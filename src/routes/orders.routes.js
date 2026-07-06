import { Router } from 'express';
import {
  createOrder,
  getOrderAnalytics,
  listMyOrders,
  listOrders,
  requestReturn,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', protect, asyncHandler(createOrder));
router.get('/me', protect, asyncHandler(listMyOrders));
router.get('/analytics', protect, requireAdmin, asyncHandler(getOrderAnalytics));
router.get('/', protect, requireAdmin, asyncHandler(listOrders));
router.patch('/:id/status', protect, requireAdmin, asyncHandler(updateOrderStatus));
router.post('/:id/return', protect, asyncHandler(requestReturn));

export default router;
