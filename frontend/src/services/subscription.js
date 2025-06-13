// frontend/src/services/subscription.js
import api from './api';

export const subscriptionService = {
  createSubscription: async (subscriptionData) => {
    try {
      console.log('SubscriptionService: Creating subscription:', subscriptionData);
      const response = await api.post('/subscriptions', subscriptionData);
      console.log('SubscriptionService: Subscription created:', response.data);
      return response.data;
    } catch (error) {
      console.error('SubscriptionService: Create subscription error:', error);
      throw error;
    }
  },

  getSubscriptions: async () => {
    try {
      console.log('SubscriptionService: Getting subscriptions');
      const response = await api.get('/subscriptions');
      console.log('SubscriptionService: Got subscriptions:', response.data);
      return response.data;
    } catch (error) {
      console.error('SubscriptionService: Get subscriptions error:', error);
      throw error;
    }
  },

  getAvailableSubscriptions: async () => {
    try {
      console.log('SubscriptionService: Getting available subscriptions');
      const response = await api.get('/subscriptions/available');
      console.log('SubscriptionService: Got available subscriptions:', response.data);
      return response.data;
    } catch (error) {
      console.error('SubscriptionService: Get available subscriptions error:', error);
      throw error;
    }
  },

  cancelSubscription: async (subscriptionId) => {
    try {
      console.log('SubscriptionService: Canceling subscription:', subscriptionId);
      const response = await api.delete(`/subscriptions/${subscriptionId}`);
      console.log('SubscriptionService: Subscription canceled:', response.data);
      return response.data;
    } catch (error) {
      console.error('SubscriptionService: Cancel subscription error:', error);
      throw error;
    }
  }
};