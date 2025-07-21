import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import DiagnosticCenter from '../models/DiagnosticCenter.js';

// Create a review (only if appointment is completed and not already reviewed)
export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const userId = req.user._id;

    // Find appointment and check status
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patientId.toString() !== userId.toString()) return res.status(403).json({ message: 'Not your appointment' });
    if (appointment.status !== 'completed') return res.status(400).json({ message: 'You can only review completed appointments' });

    // Check if already reviewed
    const existing = await Review.findOne({ user: userId, appointment: appointmentId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this appointment' });

    const review = new Review({
      user: userId,
      appointment: appointmentId,
      center: appointment.diagnosticCenterId,
      rating,
      comment
    });
    await review.save();
    await DiagnosticCenter.updateRating(appointment.diagnosticCenterId);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a review (only by owner)
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your review' });
    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();
    await DiagnosticCenter.updateRating(review.center);
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a review (only by owner)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your review' });
    await review.deleteOne();
    await DiagnosticCenter.updateRating(review.center);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all reviews for a center
export const getCenterReviews = async (req, res) => {
  try {
    const centerId = req.params.centerId;
    const reviews = await Review.find({ center: centerId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('center', 'name')
      .populate('appointment', 'appointmentDate');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 