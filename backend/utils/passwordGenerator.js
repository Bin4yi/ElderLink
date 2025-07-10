// backend/utils/passwordGenerator.js
const crypto = require('crypto');

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @param {object} options - Password options
 * @returns {string} Generated password
 */
const generateSecurePassword = (length = 12, options = {}) => {
  const defaultOptions = {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true, // Exclude similar looking characters like 0, O, l, 1
    ...options
  };

  let charset = '';
  
  if (defaultOptions.includeLowercase) {
    charset += defaultOptions.excludeSimilar 
      ? 'abcdefghijkmnpqrstuvwxyz' 
      : 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (defaultOptions.includeUppercase) {
    charset += defaultOptions.excludeSimilar 
      ? 'ABCDEFGHJKMNPQRSTUVWXYZ' 
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (defaultOptions.includeNumbers) {
    charset += defaultOptions.excludeSimilar 
      ? '23456789' 
      : '0123456789';
  }
  
  if (defaultOptions.includeSymbols) {
    charset += '!@#$%^&*';
  }

  let password = '';
  
  // Ensure at least one character from each enabled category
  if (defaultOptions.includeLowercase) {
    const lowerChars = defaultOptions.excludeSimilar 
      ? 'abcdefghijkmnpqrstuvwxyz' 
      : 'abcdefghijklmnopqrstuvwxyz';
    password += lowerChars[crypto.randomInt(lowerChars.length)];
  }
  
  if (defaultOptions.includeUppercase) {
    const upperChars = defaultOptions.excludeSimilar 
      ? 'ABCDEFGHJKMNPQRSTUVWXYZ' 
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    password += upperChars[crypto.randomInt(upperChars.length)];
  }
  
  if (defaultOptions.includeNumbers) {
    const numberChars = defaultOptions.excludeSimilar 
      ? '23456789' 
      : '0123456789';
    password += numberChars[crypto.randomInt(numberChars.length)];
  }
  
  if (defaultOptions.includeSymbols) {
    const symbolChars = '!@#$%^&*';
    password += symbolChars[crypto.randomInt(symbolChars.length)];
  }

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[crypto.randomInt(charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
};

/**
 * Generate a temporary password for new users
 * @returns {string} Temporary password
 */
const generateTempPassword = () => {
  return generateSecurePassword(10, {
    includeSymbols: false, // Easier to type for first login
    excludeSimilar: true
  });
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
const validatePasswordStrength = (password) => {
  const result = {
    isValid: true,
    score: 0,
    feedback: []
  };

  if (password.length < 8) {
    result.isValid = false;
    result.feedback.push('Password must be at least 8 characters long');
  } else {
    result.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password should contain lowercase letters');
  } else {
    result.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password should contain uppercase letters');
  } else {
    result.score += 1;
  }

  if (!/\d/.test(password)) {
    result.feedback.push('Password should contain numbers');
  } else {
    result.score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.feedback.push('Password should contain special characters');
  } else {
    result.score += 1;
  }

  // Set strength level
  if (result.score < 3) {
    result.strength = 'weak';
  } else if (result.score < 4) {
    result.strength = 'medium';
  } else {
    result.strength = 'strong';
  }

  return result;
};

module.exports = {
  generateSecurePassword,
  generateTempPassword,
  validatePasswordStrength
};