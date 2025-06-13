// src/context/NotificationContext.js (BASIC VERSION)
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications: () => console.log('Fetch notifications'),
    markAsRead: () => console.log('Mark as read'),
    markAllAsRead: () => console.log('Mark all as read')
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};