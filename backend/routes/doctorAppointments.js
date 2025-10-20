// backend/routes/doctorAppointments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const DoctorAppointmentController = require('../controllers/doctorAppointmentController');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Get doctor's appointments - USE CONTROLLER
router.get('/appointments', authenticate, authorize('doctor'), DoctorAppointmentController.getDoctorAppointments);

// REMOVED: Review appointment (approve/reject) - No longer needed with new workflow
// router.patch('/appointments/:id/review', authenticate, authorize('doctor'), DoctorAppointmentController.reviewAppointment);

// Reschedule appointment - USE CONTROLLER
router.patch('/appointments/:id/reschedule', authenticate, authorize('doctor'), DoctorAppointmentController.rescheduleAppointment);

// Complete appointment - USE CONTROLLER
router.patch('/appointments/:id/complete', authenticate, authorize('doctor'), DoctorAppointmentController.completeAppointment);

// Get elder's medical summary - USE CONTROLLER
router.get('/elders/:elderId/medical-summary', authenticate, authorize('doctor'), DoctorAppointmentController.getElderMedicalSummary);

// Get dashboard stats - USE CONTROLLER
router.get('/dashboard/stats', authenticate, authorize('doctor'), DoctorAppointmentController.getDashboardStats);

// Create prescription
router.post('/appointments/:appointmentId/prescriptions', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medicationName, dosage, frequency, duration, instructions } = req.body;

    // Validate required fields
    if (!medicationName || !dosage || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: medicationName, dosage, frequency'
      });
    }

    // Get doctor profile
    const { Doctor } = require('../models');
    const doctor = await Doctor.findOne({
      where: { userId: req.user.id }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Create prescription in database
    const { Prescription } = require('../models');
    const newPrescription = await Prescription.create({
      appointmentId: parseInt(appointmentId),
      doctorId: doctor.id,
      medicationName,
      dosage,
      frequency,
      duration,
      instructions,
      prescribedDate: new Date(),
      status: 'active'
    });

    console.log('💊 New prescription created:', newPrescription.toJSON());

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: newPrescription
    });
  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
});

// Get consultation records
router.get('/consultations', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get doctor profile
    const { Doctor, ConsultationRecord, Elder, Appointment } = require('../models');
    const doctor = await Doctor.findOne({
      where: { userId: req.user.id }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const consultations = await ConsultationRecord.findAndCountAll({
      where: { doctorId: doctor.id },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'reason']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      message: 'Consultation records retrieved successfully',
      consultations: consultations.rows,
      pagination: {
        total: consultations.count,
        page: parseInt(page),
        pages: Math.ceil(consultations.count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching consultation records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultation records',
      error: error.message
    });
  }
});

// Update schedule - USE CONTROLLER
router.post('/schedule', authenticate, authorize('doctor'), DoctorAppointmentController.updateSchedule);

// Add schedule exception
router.post('/schedule/exceptions', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;

    // Get doctor profile
    const { Doctor, ScheduleException } = require('../models');
    const doctor = await Doctor.findOne({
      where: { userId: req.user.id }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const exception = await ScheduleException.create({
      doctorId: doctor.id,
      date: new Date(date),
      startTime,
      endTime,
      reason,
      isActive: true
    });

    console.log('📅 Schedule exception created:', exception.toJSON());

    res.status(201).json({
      success: true,
      message: 'Schedule exception added successfully',
      exception
    });
  } catch (error) {
    console.error('❌ Error adding schedule exception:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add schedule exception',
      error: error.message
    });
  }
});

// Create Zoom meeting for appointment - USE CONTROLLER
router.post('/appointments/:appointmentId/create-zoom', authenticate, authorize('doctor'), DoctorAppointmentController.createZoomMeeting);

module.exports = router;