import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this URL to your backend server
const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to Socket.io server
  async connect() {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);

        // Join appropriate room based on user role
        if (userData) {
          if (userData.role === 'ambulance_driver') {
            this.joinDriverRoom(userData.id);
          } else if (userData.role === 'coordinator') {
            this.joinCoordinatorRoom();
          } else if (userData.role === 'family_member') {
            // Get elder ID and join family room
            // This would come from your app state
            this.joinFamilyRoom(userData.elderId);
          }
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect socket:', error);
    }
  }

  // Disconnect from Socket.io server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  // Join coordinator room
  joinCoordinatorRoom() {
    if (this.socket) {
      this.socket.emit('join:coordinator');
      console.log('Joined coordinator room');
    }
  }

  // Join driver room
  joinDriverRoom(driverId) {
    if (this.socket) {
      this.socket.emit('join:driver', driverId);
      console.log('Joined driver room:', driverId);
    }
  }

  // Join family room
  joinFamilyRoom(elderId) {
    if (this.socket) {
      this.socket.emit('join:family', elderId);
      console.log('Joined family room:', elderId);
    }
  }

  // Join ambulance tracking room
  joinAmbulanceTracking(ambulanceId) {
    if (this.socket) {
      this.socket.emit('join:ambulance', ambulanceId);
      console.log('Joined ambulance tracking:', ambulanceId);
    }
  }

  // Setup default event listeners
  setupEventListeners() {
    // Emergency alerts for coordinators
    this.on('emergency:new', (data) => {
      console.log('New emergency alert:', data);
    });

    // Dispatch notifications for drivers
    this.on('dispatch:new', (data) => {
      console.log('New dispatch:', data);
    });

    this.on('dispatch:updated', (data) => {
      console.log('Dispatch updated:', data);
    });

    // Ambulance location updates
    this.on('ambulance:location', (data) => {
      console.log('Ambulance location update:', data);
    });

    // Emergency updates for family
    this.on('emergency:updated', (data) => {
      console.log('Emergency updated:', data);
    });

    this.on('ambulance:dispatched', (data) => {
      console.log('Ambulance dispatched:', data);
    });

    this.on('ambulance:arrived', (data) => {
      console.log('Ambulance arrived:', data);
    });

    this.on('emergency:completed', (data) => {
      console.log('Emergency completed:', data);
    });
  }

  // Register custom event listener
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    // Store listener reference for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Register with socket
    this.socket.on(event, callback);
  }

  // Unregister event listener
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from listeners map
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to server
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
