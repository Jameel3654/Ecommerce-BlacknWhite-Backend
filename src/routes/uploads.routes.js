import { Router } from 'express';
import { uploadProductImage } from '../controllers/upload.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/images', protect, requireAdmin, upload.single('image'), asyncHandler(uploadProductImage));

export default router;
