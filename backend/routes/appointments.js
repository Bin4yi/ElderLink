// backend/routes/appointments.js (Family Member Routes)
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateAppointment, validateAppointmentUpdate } = require('../middleware/appointmentValidation');

// Apply authentication to all routes
router.use(authenticate);

// Family member routes (authorize family_member role)
router.use(authorize('family_member', 'admin'));

/**
 * @route GET /api/appointments/doctors
 * @desc Get available doctors
 * @access Private (Family Member)
 */
router.get('/doctors', AppointmentController.getAvailableDoctors);

/**
 * @route GET /api/appointments/doctors/:doctorId/availability
 * @desc Get doctor availability for specific date
 * @query date - Date string (YYYY-MM-DD)
 * @access Private (Family Member)
 */
router.get('/doctors/:doctorId/availability', AppointmentController.getDoctorAvailability);

/**
 * @route POST /api/appointments
 * @desc Book new appointment
 * @access Private (Family Member)
 */
router.post('/', validateAppointment, AppointmentController.bookAppointment);

/**
 * @route GET /api/appointments
 * @desc Get family member's appointments
 * @query status, page, limit
 * @access Private (Family Member)
 */
router.get('/', AppointmentController.getAppointments);

/**
 * @route GET /api/appointments/:appointmentId
 * @desc Get specific appointment details
 * @access Private (Family Member)
 */
router.get('/:appointmentId', AppointmentController.getAppointmentById);

/**
 * @route PUT /api/appointments/:appointmentId/cancel
 * @desc Cancel appointment
 * @access Private (Family Member)
 */
router.put('/:appointmentId/cancel', AppointmentController.cancelAppointment);

/**
 * @route PUT /api/appointments/:appointmentId/reschedule
 * @desc Reschedule appointment
 * @access Private (Family Member)
 */
router.put('/:appointmentId/reschedule', validateAppointmentUpdate, AppointmentController.rescheduleAppointment);

/**
 * @route GET /api/appointments/elders/:elderId/summary
 * @desc Get elder's medical summary for appointment booking
 * @access Private (Family Member)
 */
router.get('/elders/:elderId/summary', AppointmentController.getElderSummary);

module.exports = router;

// backend/routes/doctorAppointments.js (Doctor Routes)
const express = require('express');
const router = express.Router();
const DoctorAppointmentController = require('../controllers/doctorAppointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateConsultationRecord, validatePrescription } = require('../middleware/appointmentValidation');

// Apply authentication to all routes
router.use(authenticate);

// Doctor routes (authorize doctor role)
router.use(authorize('doctor', 'admin'));

/**
 * @route GET /api/doctor/appointments
 * @desc Get doctor's appointments
 * @query status, date, page, limit
 * @access Private (Doctor)
 */
router.get('/appointments', DoctorAppointmentController.getDoctorAppointments);

/**
 * @route PUT /api/doctor/appointments/:appointmentId/review
 * @desc Approve or reject appointment
 * @body action (approve/reject), doctorNotes, rejectionReason
 * @access Private (Doctor)
 */
router.put('/appointments/:appointmentId/review', DoctorAppointmentController.reviewAppointment);

/**
 * @route GET /api/doctor/elders/:elderId/summary
 * @desc Get complete elder medical summary for doctor
 * @access Private (Doctor)
 */
router.get('/elders/:elderId/summary', DoctorAppointmentController.getElderMedicalSummary);

/**
 * @route PUT /api/doctor/appointments/:appointmentId/complete
 * @desc Complete appointment and create consultation record
 * @access Private (Doctor)
 */
router.put('/appointments/:appointmentId/complete', validateConsultationRecord, DoctorAppointmentController.completeAppointment);

/**
 * @route POST /api/doctor/consultations/:consultationId/prescription
 * @desc Create prescription for consultation
 * @access Private (Doctor)
 */
router.post('/consultations/:consultationId/prescription', validatePrescription, DoctorAppointmentController.createPrescription);

/**
 * @route GET /api/doctor/consultations
 * @desc Get doctor's consultation records
 * @query page, limit, elderId
 * @access Private (Doctor)
 */
router.get('/consultations', DoctorAppointmentController.getConsultationRecords);

/**
 * @route PUT /api/doctor/schedule
 * @desc Update doctor's schedule
 * @access Private (Doctor)
 */
router.put('/schedule', DoctorAppointmentController.updateSchedule);

/**
 * @route POST /api/doctor/schedule/exceptions
 * @desc Add schedule exception (holiday, break)
 * @access Private (Doctor)
 */
router.post('/schedule/exceptions', DoctorAppointmentController.addScheduleException);

/**
 * @route GET /api/doctor/dashboard/stats
 * @desc Get doctor dashboard statistics
 * @access Private (Doctor)
 */
router.get('/dashboard/stats', DoctorAppointmentController.getDoctorDashboardStats);

module.exports = router;

// backend/middleware/appointmentValidation.js
const Joi = require('joi');

const validateAppointment = (req, res, next) => {
  const schema = Joi.object({
    elderId: Joi.string().uuid().required(),
    doctorId: Joi.string().uuid().required(),
    appointmentDate: Joi.date().min('now').required(),
    duration: Joi.number().min(15).max(120).default(30),
    type: Joi.string().valid('consultation', 'follow-up', 'emergency').default('consultation'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    reason: Joi.string().min(10).max(500).required(),
    symptoms: Joi.string().max(1000).optional(),
    notes: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error',
      details: error.details[0].message 
    });
  }
  next();
};

const validateAppointmentUpdate = (req, res, next) => {
  const schema = Joi.object({
    newDate: Joi.date().min('now').optional(),
    reason: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error',
      details: error.details[0].message 
    });
  }
  next();
};

const validateConsultationRecord = (req, res, next) => {
  const schema = Joi.object({
    diagnosis: Joi.string().max(1000).optional(),
    treatment: Joi.string().max(1000).optional(),
    recommendations: Joi.string().max(1000).optional(),
    vitalSigns: Joi.object({
      bloodPressure: Joi.string().optional(),
      heartRate: Joi.number().optional(),
      temperature: Joi.number().optional(),
      weight: Joi.number().optional(),
      height: Joi.number().optional(),
      oxygenSaturation: Joi.number().optional()
    }).optional(),
    symptoms: Joi.string().max(1000).optional(),
    sessionSummary: Joi.string().min(20).max(2000).required(),
    followUpRequired: Joi.boolean().default(false),
    followUpDate: Joi.date().min('now').optional(),
    actualDuration: Joi.number().min(1).max(180).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error',
      details: error.details[0].message 
    });
  }
  next();
};

const validatePrescription = (req, res, next) => {
  const medicationSchema = Joi.object({
    name: Joi.string().required(),
    dosage: Joi.string().required(),
    frequency: Joi.string().required(),
    duration: Joi.string().required(),
    instructions: Joi.string().optional()
  });

  const schema = Joi.object({
    medications: Joi.array().items(medicationSchema).min(1).required(),
    instructions: Joi.string().max(1000).optional(),
    validUntil: Joi.date().min('now').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error',
      details: error.details[0].message 
    });
  }
  next();
};

module.exports = {
  validateAppointment,
  validateAppointmentUpdate,
  validateConsultationRecord,
  validatePrescription
};

// backend/routes/index.js (Add to main router)
// Add these lines to your main route index file:

/*
const appointmentRoutes = require('./appointments');
const doctorAppointmentRoutes = require('./doctorAppointments');

// Family member appointment routes
app.use('/api/appointments', appointmentRoutes);

// Doctor appointment routes
app.use('/api/doctor', doctorAppointmentRoutes);
*/