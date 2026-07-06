import { Op } from 'sequelize';
import { Order, OrderItem, Product, User, sequelize } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

const orderInclude = [
  { model: OrderItem, as: 'items', include: [{ model: Product }] },
  { model: User, attributes: ['id', 'name', 'email', 'role'] },
];

const shippingFees = {
  standard: 0,
  express: 450,
  overnight: 900,
};

const STRIPE_MIN_CARD_AMOUNT_PKR = 150;

export const createOrder = async (req, res) => {
  const {
    items = [],
    shippingAddress,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod = 'cod',
    shippingMethod = 'standard',
  } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Please sign in before placing an order');
  }

  if (!items.length) {
    throw new ApiError(400, 'Order must include at least one item');
  }

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress?.address || !shippingAddress?.city) {
    throw new ApiError(400, 'Name, email, phone, address, and city are required');
  }

  const order = await sequelize.transaction(async (transaction) => {
    const requestedItems = items.reduce((map, item) => {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity || 1);

      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        throw new ApiError(400, 'Cart contains an invalid product or quantity');
      }

      map.set(productId, (map.get(productId) || 0) + quantity);
      return map;
    }, new Map());

    const products = await Product.findAll({
      where: { id: [...requestedItems.keys()] },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const productsById = new Map(products.map((product) => [product.id, product]));
    const preparedItems = [...requestedItems.entries()].map(([productId, quantity]) => {
      const product = productsById.get(productId);

      if (!product) {
        throw new ApiError(400, `Product ${productId} was not found`);
      }

      if (product.status !== 'active') {
        throw new ApiError(400, `${product.name} is ${product.status} and cannot be ordered`);
      }

      if (product.stock <= 0) {
        throw new ApiError(400, `${product.name} is out of stock`);
      }

      if (quantity > product.stock) {
        throw new ApiError(400, `${product.name} has only ${product.stock} in stock`);
      }

      const unitPrice = Number(product.price);
      return {
        product,
        quantity,
        unitPrice,
        lineTotal: quantity * unitPrice,
      };
    });

    const subtotal = preparedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = shippingFees[shippingMethod] ?? 0;
    const totalAmount = subtotal + shippingFee;

    if (paymentMethod === 'stripe' && totalAmount < STRIPE_MIN_CARD_AMOUNT_PKR) {
      throw new ApiError(400, `Card payment requires a minimum order total of PKR ${STRIPE_MIN_CARD_AMOUNT_PKR}. Please use Cash on Delivery for smaller orders.`);
    }

    const createdOrder = await Order.create({
      userId: req.user.id,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingMethod,
      shippingFee,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending_cash_collection' : 'pending',
      totalAmount,
      currency: 'PKR',
    }, { transaction });

    await Promise.all(preparedItems.map(async (item) => {
      await OrderItem.create({
        orderId: createdOrder.id,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      }, { transaction });

      await item.product.decrement('stock', { by: item.quantity, transaction });
    }));

    return createdOrder;
  });

  const savedOrder = await Order.findByPk(order.id, { include: orderInclude });
  res.status(201).json({ success: true, order: savedOrder });
};

export const listMyOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: orderInclude,
    order: [['createdAt', 'DESC']],
  });

  res.json({ success: true, orders });
};

export const listOrders = async (req, res) => {
  const orders = await Order.findAll({
    include: orderInclude,
    order: [['createdAt', 'DESC']],
  });

  res.json({ success: true, orders });
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }] });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  await sequelize.transaction(async (transaction) => {
    const nextReturnStatus = req.body.returnStatus || order.returnStatus;
    const previousReturnStatus = order.returnStatus;

    await order.update({
      status: req.body.status || order.status,
      paymentStatus: req.body.paymentStatus || order.paymentStatus,
      returnStatus: nextReturnStatus,
    }, { transaction });

    if (previousReturnStatus !== 'approved' && nextReturnStatus === 'approved') {
      await Promise.all(order.items.map((item) =>
        item.productId
          ? Product.increment('stock', { by: item.quantity, where: { id: item.productId }, transaction })
          : Promise.resolve()
      ));
    }
  });

  const updated = await Order.findByPk(order.id, { include: orderInclude });
  res.json({ success: true, order: updated });
};

export const requestReturn = async (req, res) => {
  const order = await Order.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  await order.update({
    returnStatus: 'requested',
    returnReason: req.body.reason || 'Customer requested return',
    returnedAt: new Date(),
  });

  const updated = await Order.findByPk(order.id, { include: orderInclude });
  res.json({ success: true, order: updated });
};

export const getOrderAnalytics = async (req, res) => {
  const orders = await Order.findAll({
    where: {
      createdAt: { [Op.gte]: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
    },
    include: [{ model: OrderItem, as: 'items' }],
  });

  const completedOrders = orders.filter((order) => order.returnStatus !== 'approved');
  const returnedOrders = orders.filter((order) => order.returnStatus !== 'none');
  const revenue = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const returnedValue = returnedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const unitsSold = completedOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  res.json({
    success: true,
    analytics: {
      revenue,
      orderCount: orders.length,
      unitsSold,
      returnedOrders: returnedOrders.length,
      returnedValue,
      returnRate: orders.length ? Math.round((returnedOrders.length / orders.length) * 100) : 0,
    },
  });
};
