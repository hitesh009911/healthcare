import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ user: 1, appointment: 1 }, { unique: true }); // One review per appointment per user

export default mongoose.model('Review', reviewSchema); 