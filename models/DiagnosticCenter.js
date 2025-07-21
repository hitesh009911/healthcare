
import mongoose from 'mongoose';

const diagnosticCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Center name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  services: [{
    type: String,
    trim: true
  }],
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

diagnosticCenterSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'center',
});

diagnosticCenterSchema.statics.updateRating = async function(centerId) {
  const Review = (await import('./Review.js')).default;
  const result = await Review.aggregate([
    { $match: { center: centerId } },
    { $group: { _id: '$center', avgRating: { $avg: '$rating' }, total: { $sum: 1 } } }
  ]);
  const { avgRating = 0, total = 0 } = result[0] || {};
  await this.findByIdAndUpdate(centerId, { rating: avgRating, totalReviews: total });
};

export default mongoose.model('DiagnosticCenter', diagnosticCenterSchema);
