const { body, validationResult } = require('express-validator');

const inventoryValidation = {
  // Validation rules for medicine creation/update
  validateMedicine: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Medicine name is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Medicine name must be between 2 and 255 characters'),
    
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    
    body('location')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Location must be less than 255 characters'),
    
    body('expirationDate')
      .isISO8601()
      .withMessage('Please provide a valid expiration date in ISO format')
      .custom((value) => {
        const expirationDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expirationDate < today) {
          throw new Error('Expiration date cannot be in the past');
        }
        return true;
      }),
    
    body('usage')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Usage description must be less than 500 characters'),
    
    body('prescriptionRequired')
      .optional()
      .isBoolean()
      .withMessage('Prescription required must be a boolean value'),
    
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters'),
    
    // Middleware to handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      next();
    }
  ],

  // Validation rules for usage recording
  validateUsage: [
    body('quantityUsed')
      .isInt({ min: 1 })
      .withMessage('Quantity used must be a positive integer'),
    
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters'),
    
    body('batchNumber')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Batch number must be less than 100 characters'),
    
    // Middleware to handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      next();
    }
  ],

  // Custom validation for search queries
  validateSearch: [
    body('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Search term must be between 1 and 255 characters'),
    
    body('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    body('sortBy')
      .optional()
      .isIn(['name', 'quantity', 'expirationDate', 'lastUpdated', 'created_at'])
      .withMessage('Invalid sort field'),
    
    body('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC'),
    
    // Middleware to handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      next();
    }
  ],

  // Validation for analytics parameters
  validateAnalytics: [
    body('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365'),
    
    body('threshold')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Threshold must be between 1 and 100'),
    
    // Middleware to handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      next();
    }
  ],

  // Custom validation helpers
  sanitizeInput: (req, res, next) => {
    // Remove any potential XSS or injection attempts
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
      }
    };
    
    sanitize(req.body);
    sanitize(req.query);
    next();
  }
};

module.exports = inventoryValidation;
