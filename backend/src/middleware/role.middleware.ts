import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

/**
 * Middleware to restrict route access to specific user roles
 * Example: requireRole('ADMIN') or requireRole('AUTHORITY', 'ADMIN')
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: requires one of [${allowedRoles.join(', ')}] permissions`,
      });
      return;
    }

    next();
  };
}
