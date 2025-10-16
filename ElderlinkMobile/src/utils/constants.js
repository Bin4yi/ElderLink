// API Configuration
// ⚠️ IMPORTANT: Update this IP address to match your computer's IP
// To find your IP:
//   Windows: Run 'ipconfig' in Command Prompt, look for IPv4 Address
//   Mac/Linux: Run 'ifconfig' in Terminal, look for inet address
// Your phone and computer MUST be on the same WiFi network!
export const API_BASE_URL = 'http://192.168.197.63:5000';

// API Config object for backward compatibility
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  
  // Elder Management
  ELDERS: {
    BASE: '/api/elders',
    PROFILE: (id) => `/api/elders/${id}`,
    UPDATE: (id) => `/api/elders/${id}`,
  },

  // Appointments
  APPOINTMENTS: {
    BASE: '/api/appointments',
    ELDER: (elderId) => `/api/appointments/elder/${elderId}`,
    UPCOMING: (elderId) => `/api/appointments/elder/${elderId}/upcoming`,
    CREATE: '/api/appointments',
    UPDATE: (id) => `/api/appointments/${id}`,
    CANCEL: (id) => `/api/appointments/${id}/cancel`,
  },
  
  // Health Monitoring
  HEALTH: {
    BASE: '/api/health-monitoring',
    ELDER: (elderId) => `/api/health-monitoring/elder/${elderId}`,
    HISTORY: (elderId, days = 7) => `/api/health-monitoring/elder/${elderId}/history?days=${days}`,
    CREATE: '/api/health-monitoring',
    TODAY: '/api/health-monitoring/today',
    ALL: '/api/health-monitoring/all',
  },
  
  // Staff Assignments
  STAFF: {
    BASE: '/api/staff-assignments',
    ELDER: (elderId) => `/api/staff-assignments/elder/${elderId}`,
    EMERGENCY: (elderId) => `/api/staff-assignments/elder/${elderId}/emergency`,
  },
  
  // Emergency - SINGLE DEFINITION
  EMERGENCY: {
    TRIGGER: '/api/emergency/trigger',
    ALERT: '/api/emergency/alert',
    HISTORY: (elderId) => `/api/emergency/history/${elderId}`,
    CONTACTS: (elderId) => `/api/emergency/contacts/${elderId}`,
  },
  
  // Driver Management
  DRIVER: {
    ACTIVE_DISPATCH: '/api/drivers/active-dispatch',
    HISTORY: '/api/drivers/dispatch-history',
  },
  
  // SOS Response (for drivers)
  SOS_RESPONSE: {
    ACCEPT_DISPATCH: (id) => `/api/sos/dispatch/${id}/accept`,
    UPDATE_STATUS: (id) => `/api/sos/dispatch/${id}/status`,
    MARK_ARRIVED: (id) => `/api/sos/dispatch/${id}/arrived`,
    COMPLETE_DISPATCH: (id) => `/api/sos/dispatch/${id}/complete`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    SEND: '/api/notifications/send',
    MARK_READ: (id) => `/api/notifications/${id}/read`,
  },
};

// SOS Button Configuration
export const SOS_CONFIG = {
  HOLD_DURATION: 3000,
  HAPTIC_PATTERN: [0, 100, 50, 100],
  COUNTDOWN_INTERVAL: 100,
  AUTO_CANCEL_TIMEOUT: 30000,
};

// Upstash QStash Configuration
export const QSTASH_CONFIG = {
  ENABLED: true,
  TOKEN: 'eyJVc2VySUQiOiI3NDFmZWU2Mi1mZThmLTQ2OGEtOTM3Mi00NjhlM2JlOGY5Y2QiLCJQYXNzd29yZCI6IjIyNTAwNjk1NGI5NDRiYjJiMGVkOGU0ZDA4ZGRmYjRmIn0=',
  URL: 'https://qstash.upstash.io/v2/publish',
  EMERGENCY_WEBHOOK: 'https://nonalined-opal-cerebellar.ngrok-free.dev/api/webhook/emergency',
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 2000,
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ELDER_DATA: 'elder_data',
  SETTINGS: 'app_settings',
  ACCESSIBILITY: 'accessibility_settings',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  EMERGENCY_RECORDS: 'emergency_records',
  PENDING_EMERGENCIES: 'pending_emergencies',
  TOKEN: 'auth_token', // Alias
};

export const ACCESSIBILITY = {
  FONT_SIZES: {
    small: 16,
    medium: 18,
    large: 20,
    xlarge: 24,
    xxlarge: 28,
  },
  BUTTON_SIZES: {
    small: 44,
    medium: 54,
    large: 64,
    xlarge: 74,
  },
  TOUCH_TARGET_SIZE: 44,
  HIGH_CONTRAST: false,
  REDUCE_MOTION: false,
};

export const HEALTH_CONFIG = {
  VITAL_RANGES: {
    HEART_RATE: { min: 60, max: 100, unit: 'bpm' },
    BLOOD_PRESSURE: {
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      unit: 'mmHg',
    },
    TEMPERATURE: { min: 36.1, max: 37.2, unit: '°C' },
    OXYGEN_SATURATION: { min: 95, max: 100, unit: '%' },
    WEIGHT: { unit: 'kg' },
    SLEEP_HOURS: { min: 6, max: 9, unit: 'hours' },
  },
  ALERT_LEVELS: {
    NORMAL: 'normal',
    WARNING: 'warning',
    CRITICAL: 'critical',
    EMERGENCY: 'emergency',
  },
};

export const APPOINTMENT_CONFIG = {
  TYPES: {
    CONSULTATION: 'consultation',
    CHECKUP: 'checkup',
    FOLLOW_UP: 'follow_up',
    EMERGENCY: 'emergency',
  },
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  STATUSES: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
  },
  PAYMENT_STATUSES: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
};

export const USER_ROLES = {
  ELDER: 'elder',
  FAMILY_MEMBER: 'family_member',
  STAFF: 'staff',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  AMBULANCE_DRIVER: 'ambulance_driver',
  COORDINATOR: 'coordinator',
};

export const ROUTES = {
  AUTH: 'Auth',
  LOGIN: 'Login',
  FORGOT_PASSWORD: 'ForgotPassword',
  MAIN: 'Main',
  HOME: 'Home',
  APPOINTMENTS: 'Appointments',
  HEALTH_METRICS: 'HealthMetrics',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  EMERGENCY: 'Emergency',
  SOS: 'SOS',
};

export const ERROR_MESSAGES = {
  NETWORK: 'Network connection error. Please check your internet connection.',
  AUTHENTICATION: 'Authentication failed. Please login again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  SOS_FAILED: 'Emergency alert failed to send. Please try again or contact emergency services directly.',
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  LOGOUT: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  APPOINTMENT_BOOKED: 'Appointment booked successfully',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  HEALTH_DATA_SAVED: 'Health data saved successfully',
  SOS_SENT: 'Emergency alert sent successfully',
};
