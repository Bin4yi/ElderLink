//server.js backend

// backend/server.js - Updated with familyDoctors route

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const sequelize = require("./config/database");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "ElderLink Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "ElderLink API is running",
    timestamp: new Date().toISOString(),
  });
});

// Add this new endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ElderLink API is running",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/auth",
      "/api/subscriptions",
      "/api/elders",
      "/api/notifications",
      "/api/admin",
      "/api/inventory",
      "/api/prescriptions",
    ],
  });
});

// Route configurations
const routeConfigs = [
  { path: "./routes/auth", mount: "/api/auth", name: "authRoutes" },
  { path: "./routes/elder", mount: "/api/elder", name: "elderRoutes" },
  {
    path: "./routes/healthMonitoring",
    mount: "/api/health-monitoring",
    name: "healthMonitoringRoutes",
  },
  {
    path: "./routes/subscription",
    mount: "/api/subscriptions",
    name: "subscriptionRoutes",
  },
  {
    path: "./routes/notification",
    mount: "/api/notifications",
    name: "notificationRoutes",
  },
  {
    path: "./routes/adminUserRoutes",
    mount: "/api/admin",
    name: "adminUserRoutes",
  },
  {
    path: "./routes/adminStatsRoutes",
    mount: "/api/admin",
    name: "adminStatsRoutes",
  },
  {
    path: "./routes/staffAssignment",
    mount: "/api/staff-assignments",
    name: "staffAssignmentRoutes",
  },
  {
    path: "./routes/doctorAssignment",
    mount: "/api/doctor-assignments",
    name: "doctorAssignmentRoutes",
  },
];

// Import health monitoring routes
const healthMonitoringRoutes = require("./routes/healthMonitoring");
// Import health reports routes
const healthReportsRoutes = require("./routes/healthReports");

// Import staff assignment routes
const staffAssignmentRoutes = require("./routes/staffAssignment");

// Import doctor assignment routes
const doctorAssignmentRoutes = require("./routes/doctorAssignment");

// Import elder routes
const elderRoutes = require("./routes/elder");

// Import appointment routes
const appointmentRoutes = require("./routes/appointments");

// ✅ IMPORTANT: Import doctor appointments routes
const doctorAppointmentsRoutes = require("./routes/doctorAppointments");
// Import notification service
// const notificationService = require('../services/notificationService');

// Import new inventory routes
const inventoryRoutes = require("./routes/inventory");
const prescriptionRoutes = require("./routes/prescriptions");

// 🚨 ADD: Import emergency routes
const emergencyRoutes = require("./routes/emergency");

// 🚨 ADD: Import webhook routes
const webhookRoutes = require("./routes/webhook");

// 🚨 ADD: Import ambulance dispatch routes
const ambulanceRoutes = require("./routes/ambulance");
const coordinatorRoutes = require("./routes/coordinator");
const sosResponseRoutes = require("./routes/sosResponse");
const driverRoutes = require("./routes/drivers");

// 🚨 ADD: Import health alerts routes
const healthAlertsRoutes = require("./routes/healthAlerts");

// Import profile routes
const profileRoutes = require("./routes/profile");

// Mental Health System Routes
const mentalHealthAssignmentRoutes = require("./routes/mentalHealthAssignmentRoutes");
const therapySessionRoutes = require("./routes/therapySessionRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const treatmentPlanRoutes = require("./routes/treatmentPlanRoutes");
const progressReportRoutes = require("./routes/progressReportRoutes");
const groupSessionRoutes = require("./routes/groupSessionRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const mentalHealthProfileRoutes = require("./routes/mentalHealthProfileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const staffAssessmentRoutes = require("./routes/staffAssessmentRoutes");

// ✅ ADD: Import monthly sessions routes
const monthlySessionRoutes = require('./routes/monthlySessions');

// ✅ ADD: Import mobile notifications routes
const mobileNotificationsRoutes = require('./routes/mobileNotifications');

// 🚨 ADD: Webhook routes FIRST (no auth required)
app.use("/api/webhook", webhookRoutes);

// Import and use routes with error checking
try {
  routeConfigs.forEach(({ path, mount, name }) => {
    const route = require(path);

    // Verify routes are properly exported
    if (typeof route !== "function") {
      throw new Error(`${name} is not a valid router`);
    }

    // API Routes
    app.use(mount, route);
  });

  // Use health monitoring routes
  app.use("/api/health-monitoring", healthMonitoringRoutes);
  // Use health reports routes
  app.use("/api/health-reports", healthReportsRoutes);
  // Use staff assignment routes
  app.use("/api/staff-assignments", staffAssignmentRoutes);
  // Use doctor assignment routes
  app.use("/api/doctor-assignments", doctorAssignmentRoutes);
  // Use elder routes
  app.use("/api/elders", elderRoutes);
  // Use appointment routes
  app.use("/api/appointments", appointmentRoutes);

  app.use("/api/doctor", doctorAppointmentsRoutes);

  // Use doctor schedule routes
  const doctorScheduleRoutes = require("./routes/doctorSchedule");
  app.use("/api/doctor/schedules", doctorScheduleRoutes);

  // Use doctor patients routes
  const doctorPatientsRoutes = require('./routes/doctorPatients');
  app.use('/api/doctor/patients', doctorPatientsRoutes);

  // Use new inventory routes
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/prescriptions", prescriptionRoutes);

  // 🚨 ADD: Use emergency routes
  app.use("/api/emergency", emergencyRoutes);

  // 🚨 ADD: Use ambulance dispatch routes
  app.use("/api/ambulance", ambulanceRoutes);
  app.use("/api/coordinator", coordinatorRoutes);
  app.use("/api/sos", sosResponseRoutes);
  app.use("/api/drivers", driverRoutes);

  // 🚨 ADD: Use health alerts routes
  app.use("/api/health-alerts", healthAlertsRoutes);

  // Use profile routes
  app.use("/api/profile", profileRoutes);

  // ✅ ADD: Use monthly sessions routes
  app.use('/api/monthly-sessions', monthlySessionRoutes);

  // ✅ ADD: Use mobile notifications routes
  app.use('/api/mobile', mobileNotificationsRoutes);

  // Register Mental Health Routes
  app.use("/api/mental-health/assignments", mentalHealthAssignmentRoutes);
  app.use("/api/mental-health/sessions", therapySessionRoutes);
  app.use("/api/mental-health/assessments", assessmentRoutes);
  app.use("/api/mental-health/treatment-plans", treatmentPlanRoutes);
  app.use("/api/mental-health/progress-reports", progressReportRoutes);
  app.use("/api/mental-health/group-sessions", groupSessionRoutes);
  app.use("/api/mental-health/resources", resourceRoutes);
  app.use("/api/mental-health/profile", mentalHealthProfileRoutes);
  app.use("/api/mental-health/dashboard", dashboardRoutes);
  app.use("/api/staff/assessments", staffAssessmentRoutes);

  // Admin Analytics Routes
  const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
  app.use("/api/admin/analytics", adminAnalyticsRoutes);
} catch (error) {
  console.error("Error loading routes:", error);
  process.exit(1);
}

// Socket.io for real-time notifications
const emergencyWebSocketService = require("./services/emergencyWebSocketService");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Existing user room functionality
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // 🚨 NEW: Coordinator room for emergency dashboard
  socket.on("join_coordinator_room", () => {
    socket.join("coordinator");
    console.log(`Socket ${socket.id} joined coordinator room`);
  });

  // 🚨 NEW: Driver joins their specific room
  socket.on("join_driver_room", (driverId) => {
    socket.join(`driver_${driverId}`);
    console.log(`Driver ${driverId} joined their room`);
  });

  // 🚨 NEW: Family member joins elder's room for updates
  socket.on("join_family_room", (elderId) => {
    socket.join(`family_${elderId}`);
    console.log(`Family member joined room for elder ${elderId}`);
  });

  // 🚨 NEW: Ambulance tracking room
  socket.on("track_ambulance", (ambulanceId) => {
    socket.join(`ambulance_${ambulanceId}`);
    console.log(`Socket ${socket.id} tracking ambulance ${ambulanceId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io available to other modules
app.set("io", io);

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry",
      field: error.errors[0]?.path,
    });
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized");

    // Start reservation cleanup task
    const { startReservationCleanup } = require("./utils/reservationCleanup");
    startReservationCleanup();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

// Doctor routes
// const doctorAppointmentsRoutes = require('./routes/doctorAppointments');

app.use("/api/doctor", doctorAppointmentsRoutes);
