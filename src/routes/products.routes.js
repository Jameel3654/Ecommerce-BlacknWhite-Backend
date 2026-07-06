import { Router } from 'express';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/product.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listProducts));
router.post('/', protect, requireAdmin, asyncHandler(createProduct));
router.put('/:id', protect, requireAdmin, asyncHandler(updateProduct));
router.delete('/:id', protect, requireAdmin, asyncHandler(deleteProduct));

export default router;
