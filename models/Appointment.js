
import { Schema, model } from 'mongoose';

const appointmentSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosticCenterId: {
    type: Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    required: true
  },
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'DiagnosticTest',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true
  },
  results: {
    reportUrl: String,
    summary: String,
    uploadedAt: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ diagnosticCenterId: 1, appointmentDate: 1 });

const Appointment = model('Appointment', appointmentSchema);

// Named exports for commonly used methods
export const findOne = (filter) => Appointment.findOne(filter);
export const findById = (id) => Appointment.findById(id);
export const find = (filter) => Appointment.find(filter);
export const create = (data) => Appointment.create(data);
export const findByIdAndUpdate = (id, update, options) => Appointment.findByIdAndUpdate(id, update, options);
export const countDocuments = (filter) => Appointment.countDocuments(filter);
export const aggregate = (pipeline) => Appointment.aggregate(pipeline);

export default Appointment;
