import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/index.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new ApiError(401, 'User no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
  } catch (error) {
    req.user = null;
  }

  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'));
  }

  next();
};
