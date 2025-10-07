/**
 * Emergency WebSocket Service
 * Handles real-time communication for emergency alerts and ambulance dispatch
 */

/**
 * Broadcast emergency alert to all coordinators
 * @param {Object} io - Socket.io instance
 * @param {Object} data - Emergency data to broadcast
 */
function broadcastEmergencyAlert(io, data) {
  io.to('coordinator').emit('emergency_alert', data);
  console.log('📡 Emergency alert broadcast to coordinators:', data.type || 'alert');
}

/**
 * Notify specific driver about dispatch assignment
 * @param {Object} io - Socket.io instance
 * @param {string} driverId - Driver user ID
 * @param {Object} data - Dispatch data
 */
function notifyDriver(io, driverId, data) {
  io.to(`driver_${driverId}`).emit('dispatch_assigned', data);
  console.log(`📲 Driver ${driverId} notified of dispatch:`, data.dispatchId);
}

/**
 * Notify family members about emergency status
 * @param {Object} io - Socket.io instance
 * @param {string} elderId - Elder ID
 * @param {Object} data - Emergency update data
 */
function notifyFamily(io, elderId, data) {
  io.to(`family_${elderId}`).emit('emergency_update', data);
  console.log(`👨‍👩‍👧 Family notified for elder ${elderId}:`, data.type);
}

/**
 * Broadcast ambulance location updates
 * @param {Object} io - Socket.io instance
 * @param {string} ambulanceId - Ambulance ID
 * @param {Object} data - Location data
 */
function broadcastAmbulanceLocation(io, ambulanceId, data) {
  // Send to coordinator room
  io.to('coordinator').emit('ambulance_location_update', data);
  
  // Send to ambulance tracking room
  io.to(`ambulance_${ambulanceId}`).emit('ambulance_location_update', data);
  
  console.log(`📍 Ambulance ${ambulanceId} location broadcast`);
}

/**
 * Notify about ambulance arrival
 * @param {Object} io - Socket.io instance
 * @param {string} elderId - Elder ID
 * @param {Object} data - Arrival data
 */
function notifyArrival(io, elderId, data) {
  // Notify family
  io.to(`family_${elderId}`).emit('ambulance_arrived', data);
  
  // Notify coordinators
  io.to('coordinator').emit('ambulance_arrived', data);
  
  console.log(`🏁 Ambulance arrival notification sent for elder ${elderId}`);
}

/**
 * Broadcast emergency completion
 * @param {Object} io - Socket.io instance
 * @param {string} elderId - Elder ID
 * @param {Object} data - Completion data
 */
function notifyCompletion(io, elderId, data) {
  // Notify family
  io.to(`family_${elderId}`).emit('emergency_completed', data);
  
  // Notify coordinators
  io.to('coordinator').emit('emergency_completed', data);
  
  console.log(`✅ Emergency completion notification sent for elder ${elderId}`);
}

/**
 * Send real-time dispatch status update
 * @param {Object} io - Socket.io instance
 * @param {Object} data - Status update data
 */
function sendDispatchStatusUpdate(io, data) {
  const { driverId, elderId, status, ...rest } = data;
  
  // Notify driver
  if (driverId) {
    io.to(`driver_${driverId}`).emit('dispatch_status_update', data);
  }
  
  // Notify family
  if (elderId) {
    io.to(`family_${elderId}`).emit('dispatch_status_update', data);
  }
  
  // Notify coordinators
  io.to('coordinator').emit('dispatch_status_update', data);
  
  console.log(`🔄 Dispatch status update: ${status}`);
}

module.exports = {
  broadcastEmergencyAlert,
  notifyDriver,
  notifyFamily,
  broadcastAmbulanceLocation,
  notifyArrival,
  notifyCompletion,
  sendDispatchStatusUpdate,
};
