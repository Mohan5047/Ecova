import { Router } from 'express';
import { authorityController } from '../controllers/authority.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('AUTHORITY', 'ADMIN'));

router.get('/reports', authorityController.getAuthorityReports);

export default router;
