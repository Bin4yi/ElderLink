// backend/middleware/auth.js (Updated)
const { verifyToken } = require('../config/jwt');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or inactive user token.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Reduce log verbosity - only log important events
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Authorization check:', {
          userRole: req.user?.role,
          allowedRoles: allowedRoles,
          userId: req.user?.id // Don't log full user object
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        console.log('❌ Access denied - user role:', req.user.role, 'allowed roles:', roles);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      // Only log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Authorization successful for role:', req.user.role);
      }
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

module.exports = { authenticate, authorize };