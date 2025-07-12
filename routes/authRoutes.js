
import { Router } from 'express';
import authController from '../controllers/authController.js';
const { register, login, getProfile } = authController;
import authMiddleware from '../middleware/auth.js';
const { protect } = authMiddleware;

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

export default router;
