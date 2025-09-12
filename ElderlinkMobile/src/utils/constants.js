// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.8.168:5000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json'}};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'},
  
  // Elder Management
  ELDERS: {
    BASE: '/elders',
    PROFILE: (id) => `/elders/${id}`,
    UPDATE: (id) => `/elders/${id}`},
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    ELDER: (elderId) => `/appointments/elder/${elderId}`,
    UPCOMING: (elderId) => `/appointments/elder/${elderId}/upcoming`,
    CREATE: '/appointments',
    UPDATE: (id) => `/appointments/${id}`,
    CANCEL: (id) => `/appointments/${id}/cancel`},
  
  // Health Monitoring
  HEALTH: {
    BASE: '/health-monitoring',
    ELDER: (elderId) => `/health-monitoring/elder/${elderId}`,
    HISTORY: (elderId, days = 7) => `/health-monitoring/elder/${elderId}/history?days=${days}`,
    CREATE: '/health-monitoring',
    TODAY: '/health-monitoring/today',
    ALL: '/health-monitoring/all'},
  
  // Staff Assignments
  STAFF: {
    BASE: '/staff-assignments',
    ELDER: (elderId) => `/staff-assignments/elder/${elderId}`,
    EMERGENCY: (elderId) => `/staff-assignments/elder/${elderId}/emergency`},
  
  // Emergency
  EMERGENCY: {
    TRIGGER: '/emergency/trigger',
    ALERT: '/emergency/alert'},
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    SEND: '/notifications/send',
    MARK_READ: (id) => `/notifications/${id}/read`}};

// SOS Button Configuration
export const SOS_CONFIG = {
  HOLD_DURATION: 3000, // 3 seconds
  HAPTIC_PATTERN: [0, 100, 50, 100], // Vibration pattern
  COUNTDOWN_INTERVAL: 100, // Update every 100ms
  AUTO_CANCEL_TIMEOUT: 30000, // Auto cancel after 30 seconds
};
// Upstash QStash Configuration
export const QSTASH_CONFIG = {
    URL: 'https://qstash.upstash.io/v2/publish',
    TOKEN: "eyJVc2VySUQiOiI3NDFmZWU2Mi1mZThmLTQ2OGEtOTM3Mi00NjhlM2JlOGY5Y2QiLCJQYXNzd29yZCI6IjIyNTAwNjk1NGI5NDRiYjJiMGVkOGU0ZDA4ZGRmYjRmIn0=",
    EMERGENCY_WEBHOOK: 'https://webhook.site/1947d1ac-909f-4cb4-9bc7-492cc72ab682', // Your webhook URL for testing
    BASE_URL: 'https://qstash.upstash.io',
    ENABLED: true // Now enabled with valid configuration
};

export const ACCESSIBILITY = {
  FONT_SIZES: {
    small: 16,
    medium: 18,
    large: 20,
    xlarge: 24,
    xxlarge: 28},
  BUTTON_SIZES: {
    small: 44,
    medium: 54,
    large: 64,
    xlarge: 74},
  TOUCH_TARGET_SIZE: 44, // Minimum touch target size
  HIGH_CONTRAST: false,
  REDUCE_MOTION: false};

// Health Monitoring Configuration
export const HEALTH_CONFIG = {
  VITAL_RANGES: {
    HEART_RATE: {
      min: 60,
      max: 100,
      unit: 'bpm'},
    BLOOD_PRESSURE: {
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      unit: 'mmHg'},
    TEMPERATURE: {
      min: 36.1,
      max: 37.2,
      unit: '°C'},
    OXYGEN_SATURATION: {
      min: 95,
      max: 100,
      unit: '%'},
    WEIGHT: {
      unit: 'kg'},
    SLEEP_HOURS: {
      min: 6,
      max: 9,
      unit: 'hours'}},
  ALERT_LEVELS: {
    NORMAL: 'normal',
    WARNING: 'warning',
    CRITICAL: 'critical',
    EMERGENCY: 'emergency'}};

// Appointment Configuration
export const APPOINTMENT_CONFIG = {
  TYPES: {
    CONSULTATION: 'consultation',
    CHECKUP: 'checkup',
    FOLLOW_UP: 'follow_up',
    EMERGENCY: 'emergency'},
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'},
  STATUSES: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected'},
  PAYMENT_STATUSES: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'}};

// User Roles
export const USER_ROLES = {
  ELDER: 'elder',
  FAMILY_MEMBER: 'family_member',
  STAFF: 'staff',
  DOCTOR: 'doctor',
  ADMIN: 'admin'};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ELDER_DATA: 'elder_data',
  SETTINGS: 'app_settings',
  ACCESSIBILITY: 'accessibility_settings',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  EMERGENCY_RECORDS: 'emergency_records',
  PENDING_EMERGENCIES: 'pending_emergencies'
};

// Navigation Routes
export const ROUTES = {
  // Auth Stack
  AUTH: 'Auth',
  LOGIN: 'Login',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Main Stack
  MAIN: 'Main',
  HOME: 'Home',
  APPOINTMENTS: 'Appointments',
  HEALTH_METRICS: 'HealthMetrics',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  
  // Emergency
  EMERGENCY: 'Emergency',
  SOS: 'SOS'};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network connection error. Please check your internet connection.',
  AUTHENTICATION: 'Authentication failed. Please login again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  SOS_FAILED: 'Emergency alert failed to send. Please try again or contact emergency services directly.'};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  LOGOUT: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  APPOINTMENT_BOOKED: 'Appointment booked successfully',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  HEALTH_DATA_SAVED: 'Health data saved successfully',
  SOS_SENT: 'Emergency alert sent successfully'};

  