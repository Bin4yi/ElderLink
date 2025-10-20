/**
 * Logger Utility
 * 
 * Provides conditional logging that only shows in development mode.
 * In production builds, logs are automatically disabled.
 */

// Check if we're in development mode
const DEBUG = __DEV__;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args) => {
    if (DEBUG) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args) => {
    if (DEBUG) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (only in development)
   */
  error: (...args) => {
    if (DEBUG) {
      console.error(...args);
    }
  },

  /**
   * Log critical errors (always logs, even in production)
   * Use this for errors that need to be tracked in production
   */
  critical: (...args) => {
    console.error('[CRITICAL]', ...args);
  },

  /**
   * Log info with emoji (only in development)
   */
  info: (...args) => {
    if (DEBUG) {
      console.info('ℹ️', ...args);
    }
  },

  /**
   * Log success messages (only in development)
   */
  success: (...args) => {
    if (DEBUG) {
      console.log('✅', ...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args) => {
    if (DEBUG) {
      console.log('🐛', ...args);
    }
  }
};

// Override global console methods in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

export default logger;
