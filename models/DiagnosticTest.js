
import { Schema, model } from 'mongoose';

const diagnosticTestSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['blood_test', 'imaging', 'cardiology', 'pathology', 'radiology', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Duration is required']
  },
  preparationInstructions: {
    type: String,
    trim: true
  },
  diagnosticCenterId: {
    type: Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const DiagnosticTest = model('DiagnosticTest', diagnosticTestSchema);

// Named exports for commonly used methods
export const findOne = (filter) => DiagnosticTest.findOne(filter);
export const findById = (id) => DiagnosticTest.findById(id);
export const find = (filter) => DiagnosticTest.find(filter);
export const create = (data) => DiagnosticTest.create(data);
export const findByIdAndUpdate = (id, update, options) => DiagnosticTest.findByIdAndUpdate(id, update, options);
export const countDocuments = (filter) => DiagnosticTest.countDocuments(filter);
export const aggregate = (pipeline) => DiagnosticTest.aggregate(pipeline);

export default DiagnosticTest;
