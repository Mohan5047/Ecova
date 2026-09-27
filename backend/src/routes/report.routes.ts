import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { reportUpload } from '../middleware/upload.middleware';
import { reportCreateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public report tracking by code (ECOVA-XXXXXX)
router.get('/code/:reportCode', reportController.getReportByCode);

// Authenticated citizen reports
router.post(
  '/',
  authMiddleware,
  reportCreateLimiter,
  reportUpload.single('photo'),
  reportController.createReport
);
router.get('/my', authMiddleware, reportController.getMyReports);

// Authority and Admin report management
router.get('/', authMiddleware, requireRole('AUTHORITY', 'ADMIN'), reportController.getAllReports);
router.get('/:id', authMiddleware, reportController.getReportById);
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('AUTHORITY', 'ADMIN'),
  reportController.updateReportStatus
);
router.post(
  '/:id/actions',
  authMiddleware,
  requireRole('AUTHORITY', 'ADMIN'),
  reportController.addReportAction
);

export default router;
