import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || localStorage.getItem('token'),
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join coordinator room
  joinCoordinatorRoom() {
    if (this.socket) {
      this.socket.emit('join_coordinator_room');
      console.log('📊 Joined coordinator room');
    }
  }

  // Join driver room
  joinDriverRoom(driverId) {
    if (this.socket) {
      this.socket.emit('join_driver_room', driverId);
      console.log(`🚑 Joined driver room: ${driverId}`);
    }
  }

  // Join family room
  joinFamilyRoom(elderId) {
    if (this.socket) {
      this.socket.emit('join_family_room', elderId);
      console.log(`👨‍👩‍👧 Joined family room: ${elderId}`);
    }
  }

  // Track ambulance
  trackAmbulance(ambulanceId) {
    if (this.socket) {
      this.socket.emit('track_ambulance', ambulanceId);
      console.log(`🚨 Tracking ambulance: ${ambulanceId}`);
    }
  }

  // Listen for emergency alerts
  onEmergencyAlert(callback) {
    if (this.socket) {
      this.socket.on('emergency_alert', callback);
    }
  }

  // Listen for emergency updates
  onEmergencyUpdate(callback) {
    if (this.socket) {
      this.socket.on('emergency_update', callback);
    }
  }

  // Listen for dispatch assignments
  onDispatchAssigned(callback) {
    if (this.socket) {
      this.socket.on('dispatch_assigned', callback);
    }
  }

  // Listen for ambulance location updates
  onAmbulanceLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('ambulance_location_update', callback);
    }
  }

  // Listen for ambulance arrival
  onAmbulanceArrived(callback) {
    if (this.socket) {
      this.socket.on('ambulance_arrived', callback);
    }
  }

  // Listen for emergency completion
  onEmergencyCompleted(callback) {
    if (this.socket) {
      this.socket.on('emergency_completed', callback);
    }
  }

  // Listen for dispatch status updates
  onDispatchStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('dispatch_status_update', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
