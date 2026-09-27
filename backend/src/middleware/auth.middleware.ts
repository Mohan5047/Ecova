import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { query } from '../config/db';
import { AuthRequest, SafeUser } from '../types';

interface JwtPayload {
  userId: string;
  role: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid session token',
      });
      return;
    }

    const userResult = await query<SafeUser>(
      `SELECT id, full_name, email, phone, role, profile_image, is_active, created_at, updated_at
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User account not found or deactivated',
      });
      return;
    }

    req.user = userResult.rows[0];
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Session has expired. Please sign in again.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
    });
  }
}
