import express from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getCenterReviews,
  getAllReviews
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected except getting center reviews
router.post('/', protect, authorize('patient'), createReview);
router.put('/:id', protect, authorize('patient'), updateReview);
router.delete('/:id', protect, authorize('patient'), deleteReview);

// Get reviews for a center (public)
router.get('/center/:centerId', getCenterReviews);

// Admin: get all reviews (admin only, no delete)
router.get('/admin/all', protect, authorize('admin'), getAllReviews);

export default router; 