import { Op } from 'sequelize';
import { Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const categoryCode = (category = 'product') =>
  category
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 4)
    .toUpperCase() || 'PRD';

const parseGalleryImages = (value) => {
  if (Array.isArray(value)) {
    return value.map((url) => String(url).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return [];
};

const productInput = async (body, existingProduct = null) => {
  const name = body.name?.trim();
  const category = body.category?.trim();
  const count = existingProduct ? existingProduct.id : await Product.count();

  return {
    name,
    slug: body.slug?.trim() || existingProduct?.slug || (name ? `${slugify(name)}-${count + 1}` : undefined),
    sku: body.sku?.trim() || existingProduct?.sku || `BW-${categoryCode(category)}-${String(count + 1).padStart(4, '0')}`,
    description: body.description?.trim(),
    category,
    price: Number(body.price),
    currency: body.currency || 'PKR',
    stock: Number(body.stock || 0),
    reorderLevel: Number(body.reorderLevel || 5),
    status: body.status || 'active',
    isNew: Boolean(body.isNew),
    rating: Number(body.rating || 4.8),
    reviews: Number(body.reviews || 0),
    imageUrl: body.imageUrl?.trim() || null,
    galleryImages: parseGalleryImages(body.galleryImages),
    cloudinaryPublicId: body.cloudinaryPublicId || null,
  };
};

export const listProducts = async (req, res) => {
  const where = req.query.includeArchived === 'true' ? {} : { status: 'active' };
  const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json({ success: true, products });
};

export const createProduct = async (req, res) => {
  const product = await Product.create(await productInput(req.body));
  res.status(201).json({ success: true, product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await product.update(await productInput({ ...product.toJSON(), ...req.body }, product));
  res.json({ success: true, product });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await product.update({ status: 'archived' });
  res.json({ success: true, product });
};
