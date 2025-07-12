
import { Schema, model } from 'mongoose';

const diagnosticCenterSchema = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

const DiagnosticCenter = model('DiagnosticCenter', diagnosticCenterSchema);

// Named exports for commonly used methods
export const findOne = (filter) => DiagnosticCenter.findOne(filter);
export const findById = (id) => DiagnosticCenter.findById(id);
export const find = (filter) => DiagnosticCenter.find(filter);
export const create = (data) => DiagnosticCenter.create(data);
export const findByIdAndUpdate = (id, update, options) => DiagnosticCenter.findByIdAndUpdate(id, update, options);
export const countDocuments = (filter) => DiagnosticCenter.countDocuments(filter);
export const aggregate = (pipeline) => DiagnosticCenter.aggregate(pipeline);

export default DiagnosticCenter;
