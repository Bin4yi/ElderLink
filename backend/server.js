// backend/server.js - Updated with familyDoctors route

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

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ElderLink Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ElderLink API is running',
    timestamp: new Date().toISOString()
  });
});

// Add this new endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ElderLink API is running',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/subscriptions',
      '/api/elders',
      '/api/notifications',
      '/api/admin'
    ]
  });
});

// Route configurations
const routeConfigs = [
  { path: './routes/auth', mount: '/api/auth', name: 'authRoutes' },
  { path: './routes/elder', mount: '/api/elders', name: 'elderRoutes' },
  { path: './routes/healthMonitoring', mount: '/api/health-monitoring', name: 'healthMonitoringRoutes' },
  { path: './routes/subscription', mount: '/api/subscriptions', name: 'subscriptionRoutes' },
  { path: './routes/notification', mount: '/api/notifications', name: 'notificationRoutes' },
  { path: './routes/adminUserRoutes', mount: '/api/admin', name: 'adminUserRoutes' },
  { path: './routes/adminStatsRoutes', mount: '/api/admin', name: 'adminStatsRoutes' },
  { path: './routes/staffAssignment', mount: '/api/staff-assignments', name: 'staffAssignmentRoutes' }
];

// Import health monitoring routes
const healthMonitoringRoutes = require('./routes/healthMonitoring');
// Import health reports routes
const healthReportsRoutes = require('./routes/healthReports');

// Import staff assignment routes
const staffAssignmentRoutes = require('./routes/staffAssignment');

// Import and use routes with error checking
try {
  routeConfigs.forEach(({ path, mount, name }) => {
    const route = require(path);
    
    // Verify routes are properly exported
    if (typeof route !== 'function') {
      throw new Error(`${name} is not a valid router`);
    }
    
    // API Routes
    app.use(mount, route);
  });

  // Use health monitoring routes
  app.use('/api/health-monitoring', healthMonitoringRoutes);
  // Use health reports routes
  app.use('/api/health-reports', healthReportsRoutes);
  // Use staff assignment routes
  app.use('/api/staff-assignments', staffAssignmentRoutes);

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
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
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
