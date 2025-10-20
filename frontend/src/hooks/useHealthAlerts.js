// frontend/src/hooks/useHealthAlerts.js
import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const useHealthAlerts = (userId) => {
  const [socket, setSocket] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    console.log('🔌 Connecting to socket.io for health alerts...');
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected for health alerts');
      setConnected(true);
      
      // Join user's room
      newSocket.emit('join', `user_${userId}`);
      console.log(`📡 Joined room: user_${userId}`);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Listen for health alerts
    newSocket.on('health_alert', (alertData) => {
      console.log('🚨 Health alert received:', alertData);
      
      // Add to alerts list
      setAlerts(prev => [alertData, ...prev]);

      // Show toast notification
      const toastMessage = `${alertData.severity.toUpperCase()}: ${alertData.elderName} - ${alertData.message}`;
      
      if (alertData.severity === 'critical') {
        toast.error(toastMessage, {
          duration: 10000,
          icon: '🚨',
          style: {
            background: '#DC2626',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      } else if (alertData.severity === 'high') {
        toast.error(toastMessage, {
          duration: 7000,
          icon: '⚠️',
          style: {
            background: '#EA580C',
            color: 'white'
          }
        });
      } else {
        toast(toastMessage, {
          duration: 5000,
          icon: 'ℹ️'
        });
      }
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Disconnecting socket for health alerts');
      newSocket.off('health_alert');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.disconnect();
    };
  }, [userId]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const removeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
  }, []);

  return {
    socket,
    connected,
    alerts,
    clearAlerts,
    removeAlert
  };
};

export default useHealthAlerts;
