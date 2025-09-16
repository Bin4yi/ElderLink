// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.8.168:5000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    DELETE: '/user/delete'
  },
  
  // Health Data
  HEALTH: {
    VITALS: '/health/vitals',
    HISTORY: '/health/history',
    ALERTS: '/health/alerts'
  },
  
  // Appointments
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    UPDATE: '/appointments',
    DELETE: '/appointments'
  },
  
  // Emergency
  EMERGENCY: {
    TRIGGER: '/emergency/trigger',
    CONTACTS: '/emergency/contacts',
    HISTORY: '/emergency/history'
  }
};

// SOS Emergency Configuration
export const SOS_CONFIG = {
  HOLD_DURATION: 3000, // 3 seconds
  COUNTDOWN_INTERVAL: 100, // Update every 100ms
  VIBRATION_PATTERN: [0, 500, 200, 500],
  AUTO_CALL_DELAY: 30000, // Auto call emergency after 30 seconds
};

// Upstash QStash Configuration
export const QSTASH_CONFIG = {
  URL: 'https://qstash.upstash.io/v2/publish',
  TOKEN: process.env.QSTASH_TOKEN || null, // Set to null to disable if no valid token
  EMERGENCY_WEBHOOK: process.env.QSTASH_WEBHOOK_URL || 'https://httpbin.org/post', // Fallback for testing
  BASE_URL: 'https://qstash.upstash.io',
  ENABLED: false // Disabled for now due to configuration issues
};

export const ACCESSIBILITY = {
  FONT_SIZES: {
    small: 16,
    medium: 18,
    large: 20,
    xlarge: 24,
    xxlarge: 28
  },
  BUTTON_SIZES: {
    small: 44,
    medium: 54,
    large: 64,
    xlarge: 74
  },
  CONTRAST_MODE: false,
  HIGH_CONTRAST: false,
  REDUCE_MOTION: false
};

// Health Monitoring Configuration
export const HEALTH_CONFIG = {
  VITAL_RANGES: {
    HEART_RATE: {
      min: 60,
      max: 100,
      unit: 'bpm'
    },
    BLOOD_PRESSURE: {
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      unit: 'mmHg'
    },
    TEMPERATURE: {
      min: 36.1,
      max: 37.2,
      unit: '°C'
    },
    OXYGEN_SATURATION: {
      min: 95,
      max: 100,
      unit: '%'
    },
    WEIGHT: {
      unit: 'kg'
    },
    SLEEP_HOURS: {
      min: 6,
      max: 9,
      unit: 'hours'
    }
  },
  ALERT_LEVELS: {
    NORMAL: 'normal',
    WARNING: 'warning',
    EMERGENCY: 'emergency'
  }
};

// Appointment Configuration
export const APPOINTMENT_CONFIG = {
  TYPES: {
    CHECKUP: 'checkup',
    SPECIALIST: 'specialist',
    EMERGENCY: 'emergency',
    TELEMEDICINE: 'telemedicine'
  },
  STATUS: {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled',
    NO_SHOW: 'no_show',
    REFUNDED: 'refunded'
  }
};

// User Roles
export const USER_ROLES = {
  ELDER: 'elder',
  CAREGIVER: 'caregiver',
  FAMILY: 'family',
  ADMIN: 'admin'
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
  HEALTH_RECORDS: 'health_records',
  HEALTH_CACHE: 'health_cache'
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
  HEALTH_METRICS: 'HealthMetrics',
  APPOINTMENTS: 'Appointments',
  EMERGENCY: 'Emergency',
  PROFILE: 'Profile',
  SETTINGS: 'Settings'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  PERMISSION_DENIED: 'Permission denied.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  DATA_SAVED: 'Data saved successfully',
  EMERGENCY_SENT: 'Emergency alert sent successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};
