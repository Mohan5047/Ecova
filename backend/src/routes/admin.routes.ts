import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/authority', adminController.createAuthority);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

export default router;
