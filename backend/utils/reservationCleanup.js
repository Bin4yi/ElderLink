// backend/utils/reservationCleanup.js
const { Appointment } = require('../models');
const { Op } = require('sequelize');

/**
 * Clean up expired reservations
 * Reservations are valid for 10 minutes
 */
async function cleanupExpiredReservations() {
  try {
    const tenMinutesAgo = new Date(Date.now() - (10 * 60000));
    
    const result = await Appointment.destroy({
      where: {
        status: 'reserved',
        reservedAt: {
          [Op.lt]: tenMinutesAgo
        }
      }
    });

    if (result > 0) {
      console.log(`🧹 Cleaned up ${result} expired reservation(s)`);
    }

    return result;
  } catch (error) {
    console.error('❌ Error cleaning up expired reservations:', error);
    return 0;
  }
}

/**
 * Start periodic cleanup of expired reservations
 * Runs every 2 minutes
 */
function startReservationCleanup() {
  // Run immediately on start
  cleanupExpiredReservations();
  
  // Run every 2 minutes
  setInterval(() => {
    cleanupExpiredReservations();
  }, 2 * 60000); // 2 minutes
  
  console.log('✅ Reservation cleanup task started (runs every 2 minutes)');
}

module.exports = {
  cleanupExpiredReservations,
  startReservationCleanup
};
