import { Router } from 'express';
import { createPaymentIntent, confirmPayment, handleStripeWebhook } from '../controllers/payment.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/webhook', asyncHandler(handleStripeWebhook));
router.post('/intent', asyncHandler(createPaymentIntent));
router.post('/confirm', asyncHandler(confirmPayment));

export default router;
