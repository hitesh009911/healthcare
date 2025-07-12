
import { Router } from 'express';
import diagnosticTestController from '../controllers/diagnosticTestController.js';
const { createTest, getTestsByCenter, getAllTests, updateTest, deleteTest } = diagnosticTestController;

import authMiddleware from '../middleware/auth.js';
const { protect, checkPermission } = authMiddleware;

const router = Router();

// Public routes
router.get('/', getAllTests);
router.get('/center/:centerId', getTestsByCenter);

// Protected routes
router.use(protect);

// Admin and center admin routes
router.post('/', checkPermission('create_tests'), createTest);
router.put('/:id', checkPermission('update_tests'), updateTest);
router.delete('/:id', checkPermission('delete_tests'), deleteTest);

export default router;
