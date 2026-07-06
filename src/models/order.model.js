import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Order extends Model {}

Order.init({
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  shippingMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'standard',
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'PKR',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'processing',
  },
  returnStatus: {
    type: DataTypes.STRING,
    defaultValue: 'none',
  },
  returnReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  returnedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Order',
});
