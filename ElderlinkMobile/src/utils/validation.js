/**
 * Validation utility functions for form validation
 * Simple validation without accessibility features
 */
export const ValidationUtils = {
  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation
  validatePassword: (password) => {
    return password && password.length >= 6;
  },

  // Phone number validation
  validatePhone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Name validation
  validateName: (name) => {
    return name && name.trim().length >= 2;
  },

  // Health metric validations
  validateHeartRate: (heartRate) => {
    const rate = parseFloat(heartRate);
    return !isNaN(rate) && rate >= 40 && rate <= 200;
  },

  validateBloodPressure: (pressure, type = 'systolic') => {
    const value = parseFloat(pressure);
    if (isNaN(value)) return false;
    
    if (type === 'systolic') {
      return value >= 70 && value <= 250;
    } else { // diastolic
      return value >= 40 && value <= 150;
    }
  },

  validateTemperature: (temperature) => {
    const temp = parseFloat(temperature);
    return !isNaN(temp) && temp >= 30 && temp <= 45;
  },

  validateWeight: (weight) => {
    const w = parseFloat(weight);
    return !isNaN(w) && w >= 20 && w <= 300;
  },

  validateOxygenSaturation: (oxygenSat) => {
    const oxygen = parseFloat(oxygenSat);
    return !isNaN(oxygen) && oxygen >= 70 && oxygen <= 100;
  },

  validateSleepHours: (sleepHours) => {
    const hours = parseFloat(sleepHours);
    return !isNaN(hours) && hours >= 0 && hours <= 24;
  },

  // Date validation
  validateDate: (date) => {
    return date instanceof Date && !isNaN(date);
  },

  validateDateOfBirth: (dateOfBirth) => {
    const date = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    return ValidationUtils.validateDate(date) && age >= 0 && age <= 150;
  },

  // Address validation
  validateAddress: (address) => {
    return address && address.trim().length >= 5;
  },

  // Emergency contact validation
  validateEmergencyContact: (contact) => {
    const errors = {};

    if (!ValidationUtils.validateName(contact.name)) {
      errors.name = 'Name is required';
    }

    if (!ValidationUtils.validatePhone(contact.phone)) {
      errors.phone = 'Valid phone number is required';
    }

    if (!contact.relationship || contact.relationship.trim().length < 2) {
      errors.relationship = 'Relationship is required';
    }

    if (contact.email && !ValidationUtils.validateEmail(contact.email)) {
      errors.email = 'Valid email address is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Generic form validation helper
  validateForm: (data, rules) => {
    const errors = {};

    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = data[field];

      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = rule.message || `${field} is required`;
        return;
      }

      if (value && rule.validator && !rule.validator(value)) {
        errors[field] = rule.message || `${field} is invalid`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Clean and sanitize input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  },

  // Check if string contains only numbers
  isNumeric: (str) => {
    return /^\d+$/.test(str);
  },

  // Check if string is alphanumeric
  isAlphaNumeric: (str) => {
    return /^[a-zA-Z0-9]+$/.test(str);
  }
};