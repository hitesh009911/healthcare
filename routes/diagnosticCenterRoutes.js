
import { Router } from 'express';
import diagnosticCenterController from '../controllers/diagnosticCenterController.js';
const {
  createCenter, getAllCenters, getCenterById, updateCenter, deleteCenter
} = diagnosticCenterController;

import authMiddleware from '../middleware/auth.js';
const { protect, checkPermission } = authMiddleware;

const router = Router();

// Public routes
router.get('/', getAllCenters);
router.get('/:id', getCenterById);

// Protected routes
router.use(protect);

// Admin and Super Admin routes
router.post('/', checkPermission('create_centers'), createCenter);
router.put('/:id', checkPermission('update_centers'), updateCenter);
router.delete('/:id', checkPermission('delete_centers'), deleteCenter);

export default router;
