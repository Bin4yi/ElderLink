// frontend/src/context/SubscriptionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscription';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptions();
    } else {
      setSubscriptions([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSubscriptions = async () => {
    try {
      const { subscriptions } = await subscriptionService.getSubscriptions();
      setSubscriptions(subscriptions || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasValidSubscription = () => {
    return subscriptions.some(sub => 
      sub.status === 'active' && 
      new Date(sub.endDate) > new Date()
    );
  };

  const value = {
    subscriptions,
    loading,
    hasValidSubscription,
    refreshSubscriptions: loadSubscriptions
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};