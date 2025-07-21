import Appointment from '../models/Appointment.js';
import DiagnosticTest from '../models/DiagnosticTest.js';
import DiagnosticCenter from '../models/DiagnosticCenter.js';
import mongoose from 'mongoose';

const createAppointment = async (req, res) => {
  try {
    const { center, test, appointmentDate, appointmentTime } = req.body;

    if (!center || !test || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const diagnosticTest = await DiagnosticTest.findById(test);
    if (!diagnosticTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    const appointment = new Appointment({
      patientId: req.user.id,
      diagnosticCenterId: center,
      testId: test,
      appointmentDate,
      appointmentTime,
      totalAmount: diagnosticTest.price,
    });

    await appointment.save();

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Appointments
const getUserAppointments = async (req, res) => {
  try {
    console.log('Getting appointments for user:', req.user.id);
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('diagnosticCenterId', 'name address phone')
      .populate('testId', 'name category price duration')
      .sort({ appointmentDate: -1 });

    console.log(`Found ${appointments.length} appointments for user`);
    appointments.forEach(apt => {
      console.log(`Appointment ID: ${apt._id}, Status: ${apt.status}`);
    });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// Get Center Appointments (for diagnostic center admins)
const getCenterAppointments = async (req, res) => {
  try {
    const user = req.user;
    let diagnosticCenterId;

    if (user.role === 'admin') {
      diagnosticCenterId = req.params.centerId;
    } else if (user.role === 'diagnostic_center_admin') {
      diagnosticCenterId = user.diagnosticCenterId;
    }

    const appointments = await Appointment.find({ diagnosticCenterId })
      .populate('patientId', 'name email phone')
      .populate('testId', 'name category price duration')
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Get center appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get center appointments',
      error: error.message
    });
  }
};

// Update Appointment Status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, cancellationReason } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email phone')
      .populate('diagnosticCenterId', 'name address phone')
      .populate('testId', 'name category price duration');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Get User Test Results
const getUserTestResults = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      patientId: req.user.id,
      status: { $in: ['completed', 'confirmed'] }
    })
      .populate('diagnosticCenterId', 'name address phone')
      .populate('testId', 'name category price duration')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Get user test results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test results',
      error: error.message
    });
  }
};

// Update User's Own Appointment
const updateUserAppointment = async (req, res) => {
  try {
    const { status, appointmentDate } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findOne({ 
      _id: appointmentId, 
      patientId: req.user.id 
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Patients can only update certain fields
    if (status) appointment.status = status;
    if (appointmentDate) appointment.appointmentDate = appointmentDate;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate('diagnosticCenterId', 'name address phone')
      .populate('testId', 'name category price duration');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update user appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Delete User's Own Appointment
const deleteUserAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;

    console.log(`Delete request - AppointmentId: ${appointmentId}, UserId: ${userId}`);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format'
      });
    }

    // First check if appointment exists at all
    const appointmentExists = await Appointment.findById(appointmentId);
    console.log('Appointment exists check:', appointmentExists ? 'Yes' : 'No');
    
    if (appointmentExists) {
      console.log('Appointment details:', {
        id: appointmentExists._id,
        patientId: appointmentExists.patientId,
        status: appointmentExists.status
      });
    }

    if (!appointmentExists) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found in database'
      });
    }

    // Check if appointment belongs to the user
    const appointment = await Appointment.findOne({ 
      _id: appointmentId, 
      patientId: userId 
    });
    
    console.log('User owns appointment check:', appointment ? 'Yes' : 'No');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or does not belong to user'
      });
    }

    // Check if appointment can be deleted (e.g., not completed)
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed appointments'
      });
    }

    console.log('Deleting appointment:', appointmentId);
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete user appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

export {
  createAppointment,
  getUserAppointments,
  getCenterAppointments,
  updateAppointmentStatus,
  updateUserAppointment,
  deleteUserAppointment,
  getUserTestResults
};
