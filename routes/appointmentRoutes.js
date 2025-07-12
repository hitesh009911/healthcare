
import { Router } from 'express';
import appointmentController from '../controllers/appointmentController.js';
const { createAppointment, getUserAppointments, getCenterAppointments, updateAppointmentStatus } = appointmentController;

import authMiddleware from '../middleware/auth.js';
const { protect, authorize } = authMiddleware;

const router = Router();

// Protected routes
router.post('/', protect, createAppointment);
router.get('/user', protect, getUserAppointments);
router.get('/center/:centerId?', protect, authorize('admin', 'diagnostic_center_admin'), getCenterAppointments);
router.put('/:id/status', protect, authorize('admin', 'diagnostic_center_admin'), updateAppointmentStatus);

export default router;
