import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Product extends Model {}

Product.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'PKR',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  status: {
    type: DataTypes.ENUM('active', 'draft', 'archived'),
    defaultValue: 'active',
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 4.8,
  },
  reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  galleryImages: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  cloudinaryPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Product',
});
