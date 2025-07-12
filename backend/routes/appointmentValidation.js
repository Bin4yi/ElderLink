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