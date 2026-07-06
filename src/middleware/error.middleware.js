import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'Internal server error',
  };

  if (error instanceof ApiError && error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && error.stack) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};
