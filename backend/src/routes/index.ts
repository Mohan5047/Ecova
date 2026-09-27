import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import authRoutes from './auth.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';
import authorityRoutes from './authority.routes';
import adminRoutes from './admin.routes';
import { Category } from '../types';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ECOVA API is running',
    timestamp: new Date().toISOString(),
  });
});

// Public categories endpoint
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const result = await query<Category>(
      'SELECT id, name, description, icon FROM categories WHERE is_active = true ORDER BY id ASC'
    );
    res.status(200).json({
      success: true,
      message: 'Categories retrieved',
      data: result.rows,
    });
  } catch (error: any) {
    console.error('[Categories API]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/authority', authorityRoutes);
router.use('/admin', adminRoutes);

export default router;
