// import express from 'express';
// import { register, login, getProfile } from '../controllers/authController.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// // Public routes
// router.post('/register', register);
// router.post('/login', login);

// // Protected routes
// router.get('/profile', protect, getProfile);

// export default router;


import express from 'express';
import { register, verifyRegistrationOTP, forgotPassword, resetPassword, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

export default router;

