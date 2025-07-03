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
  console.log('=== VALIDATION DEBUG ===');
  console.log('📋 Request body:', req.body);
  console.log('📁 Request files:', req.files);
  console.log('📷 Request file:', req.file);
  console.log('🔑 Headers:', req.headers);
  
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
    console.error('❌ Validation error:', error.details[0].message);
    console.error('🔍 Failed field:', error.details[0].path);
    console.error('🔍 Failed value:', error.details[0].context?.value);
    return res.status(400).json({ message: error.details[0].message });
  }
  
  console.log('✅ Validation passed');
  next();
};

const validateElderWithAuth = (req, res, next) => {
  console.log('=== ELDER WITH AUTH VALIDATION DEBUG ===');
  console.log('📋 Request body:', req.body);
  console.log('📷 Request file:', req.file);
  
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
    insuranceNumber: Joi.string().optional().allow(''),
    enableLogin: Joi.boolean().optional(),
    email: Joi.when('enableLogin', {
      is: true,
      then: Joi.string().email().required(),
      otherwise: Joi.string().email().optional().allow('', null)
    }),
    password: Joi.when('enableLogin', {
      is: true,
      then: Joi.string().min(6).required(),
      otherwise: Joi.string().optional().allow('', null)
    }),
    confirmPassword: Joi.string().optional().allow('', null)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    console.log('❌ Validation error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }

  console.log('✅ Validation passed');
  next();
};

// IMPORTANT: Make sure all functions are exported
module.exports = { 
  validateRegistration, 
  validateLogin, 
  validateElder,
  validateElderWithAuth // NEW: Add this export
};