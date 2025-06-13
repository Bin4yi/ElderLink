// backend/middleware/validation.js (COMPLETE FILE)
const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateElder = (req, res, next) => {
  const schema = Joi.object({
    subscriptionId: Joi.string().uuid().required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    address: Joi.string().min(10).required(),
    phone: Joi.string().min(10).max(15).required(),
    emergencyContact: Joi.string().min(10).max(15).required(),
    bloodType: Joi.string().optional().allow(''),
    medicalHistory: Joi.string().optional().allow(''),
    currentMedications: Joi.string().optional().allow(''),
    allergies: Joi.string().optional().allow(''),
    chronicConditions: Joi.string().optional().allow(''),
    doctorName: Joi.string().optional().allow(''),
    doctorPhone: Joi.string().optional().allow(''),
    insuranceProvider: Joi.string().optional().allow(''),
    insuranceNumber: Joi.string().optional().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    console.log('Validation error:', error.details[0].message);
    console.log('Request body:', req.body);
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// IMPORTANT: Make sure all functions are exported
module.exports = { 
  validateRegistration, 
  validateLogin, 
  validateElder 
};