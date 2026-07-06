import Stripe from 'stripe';
import { Order } from '../models/index.js';
import { getPaymentProvider } from '../services/payment/payment.factory.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const createPaymentIntent = async (req, res) => {
  const { orderId, provider = env.PAYMENT_PROVIDER } = req.body;
  
  if (!orderId) {
    throw new ApiError(400, 'orderId is required');
  }

  // Fetch order to get payment details
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const paymentProvider = getPaymentProvider(provider);
  const paymentIntent = await paymentProvider.createPaymentIntent({
    id: order.id,
    totalAmount: Number(order.totalAmount),
    currency: order.currency,
    customerEmail: order.customerEmail,
  });

  res.status(201).json({ success: true, paymentIntent });
};

export const confirmPayment = async (req, res) => {
  if (!stripe) {
    throw new ApiError(500, 'Stripe is not configured');
  }

  const { paymentIntentId, orderId } = req.body;

  if (!paymentIntentId || !orderId) {
    throw new ApiError(400, 'paymentIntentId and orderId are required');
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await order.update({ paymentStatus: 'paid' });
      res.json({ success: true, message: 'Payment confirmed', paymentStatus: 'paid' });
    } else if (paymentIntent.status === 'processing') {
      res.json({ success: true, message: 'Payment is processing', paymentStatus: 'processing' });
    } else if (paymentIntent.status === 'requires_payment_method') {
      throw new ApiError(400, 'Payment method is required');
    } else {
      throw new ApiError(400, `Payment status: ${paymentIntent.status}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, `Failed to confirm payment: ${error.message}`);
  }
};

export const handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    throw new ApiError(500, 'Stripe is not configured');
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(500, 'Stripe webhook secret is not configured');
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    throw new ApiError(400, 'Missing Stripe signature header');
  }

  let event;
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    throw new ApiError(400, `Stripe webhook signature verification failed: ${error.message}`);
  }

  const payload = event.data.object;
  const eventType = event.type;

  console.log(`Stripe webhook received: ${eventType}`);

  if (eventType === 'payment_intent.succeeded') {
    const orderId = payload.metadata?.orderId;
    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (order) {
        await order.update({ paymentStatus: 'paid' });
        console.log(`Order ${orderId} marked as paid`);
      }
    }
  } else if (eventType === 'payment_intent.payment_failed') {
    const orderId = payload.metadata?.orderId;
    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (order) {
        await order.update({ paymentStatus: 'failed' });
        console.log(`Order ${orderId} payment failed`);
      }
    }
  }

  res.status(200).json({ received: true });
};
