import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class OrderItem extends Model {}

OrderItem.init({
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  lineTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'OrderItem',
});
