import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error Middleware]:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'Uploaded file is too large. Maximum permitted size is 10MB.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
    return;
  }

  // Handle specific database constraint errors gracefully
  if (err.code === '23505') {
    // Unique violation
    res.status(409).json({
      success: false,
      message: 'A record with this information already exists.',
    });
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
