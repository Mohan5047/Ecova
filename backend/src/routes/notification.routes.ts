import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

export default router;
