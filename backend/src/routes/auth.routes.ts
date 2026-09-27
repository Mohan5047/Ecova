import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.patch('/profile', authMiddleware, authController.updateProfile);

export default router;
