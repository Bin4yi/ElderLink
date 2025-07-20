// backend/server.js - Updated with proper error checking
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'ElderLink API is running',
    timestamp: new Date().toISOString()
  });
});

// Import and use routes with error checking
try {
  const authRoutes = require('./routes/auth');
  const subscriptionRoutes = require('./routes/subscription');
  const elderRoutes = require('./routes/elder');
  const notificationRoutes = require('./routes/notification');
  const inventoryRoutes = require('./routes/inventoryRoutes');
  const simplePrescriptionRoutes = require('./routes/simplePrescriptions');
  const pharmacyDashboardRoutes = require('./routes/parmacyDashboard');
  



  // Verify routes are properly exported
  if (typeof authRoutes !== 'function') {
    throw new Error('authRoutes is not a valid router');
  }
  if (typeof subscriptionRoutes !== 'function') {
    throw new Error('subscriptionRoutes is not a valid router');
  }
  if (typeof elderRoutes !== 'function') {
    throw new Error('elderRoutes is not a valid router');
  }
  if (typeof notificationRoutes !== 'function') {
    throw new Error('notificationRoutes is not a valid router');
  }
  if (typeof inventoryRoutes !== 'function') {
    throw new Error('inventoryRoutes is not a valid router');
  }
  

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/elders', elderRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/simple-prescriptions', simplePrescriptionRoutes);
  app.use('/api/pharmacy-dashboard', pharmacyDashboardRoutes);
  



} catch (error) {
  console.error('Error loading routes:', error);
  process.exit(1);
}

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('io', io);

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: error.errors[0]?.path
    });
  }
  
  // Default error response
  res.status(500).json({ 
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

const PORT = process.env.PORT || 5000;

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();