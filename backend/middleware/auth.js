// backend/middleware/auth.js (Make sure exports are correct)
const { verifyToken } = require('../config/jwt');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log('🔍 Authorization check:', {
        userRole: req.user?.role,
        allowedRoles: allowedRoles,
        userInfo: req.user
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Handle both string and array of roles
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        console.log('❌ Access denied - user role:', req.user.role, 'allowed roles:', roles);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      console.log('✅ Authorization successful for role:', req.user.role);
      next();
    } catch (error) {
      console.error('❌ Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// IMPORTANT: Make sure both functions are exported
module.exports = { authenticate, authorize };