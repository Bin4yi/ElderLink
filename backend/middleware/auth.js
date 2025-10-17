// backend/middleware/auth.js (Make sure exports are correct)
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Ensure allowedRoles is always an array
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(req.user.role)) {
      console.log(`❌ Access denied - user role: ${req.user.role} allowed roles: [${rolesArray.map(r => ` '${r}'`)} ]`);
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action'
      });
    }

    next();
  };
};

// Alternative function names for backwards compatibility
const authenticate = auth;
const authorize = checkRole;
const protect = auth; // Add protect as an alias for auth

module.exports = { 
  auth, 
  checkRole, 
  authenticate, 
  authorize,
  protect // Export protect for consistency with other routes
};