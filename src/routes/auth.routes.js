import { Router } from 'express';
import { googleSignIn, listUsers, login, register } from '../controllers/auth.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/google', asyncHandler(googleSignIn));
router.get('/users', protect, requireAdmin, asyncHandler(listUsers));

export default router;
