import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './products.routes.js';
import uploadRoutes from './uploads.routes.js';
import orderRoutes from './orders.routes.js';
import paymentRoutes from './payments.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'BLACK & WHITE backend is running' });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/uploads', uploadRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

export default router;
