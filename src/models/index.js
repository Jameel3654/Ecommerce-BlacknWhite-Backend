import { sequelize } from '../config/database.js';
import { User } from './user.model.js';
import { Product } from './product.model.js';
import { Order } from './order.model.js';
import { OrderItem } from './order-item.model.js';

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export { sequelize, User, Product, Order, OrderItem };
