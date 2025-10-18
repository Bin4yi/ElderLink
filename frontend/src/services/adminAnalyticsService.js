// frontend/src/services/adminAnalyticsService.js
import api from "./api";

const adminAnalyticsService = {
  /**
   * Get dashboard overview statistics
   */
  getDashboardOverview: async () => {
    const response = await api.get("/admin/analytics/overview");
    return response.data;
  },

  /**
   * Get detailed user statistics
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   */
  getUserStatistics: async (page = 1, limit = 10) => {
    const response = await api.get("/admin/analytics/users", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get subscription statistics and details
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   */
  getSubscriptionStatistics: async (page = 1, limit = 10) => {
    const response = await api.get("/admin/analytics/subscriptions", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get revenue statistics
   */
  getRevenueStatistics: async () => {
    const response = await api.get("/admin/analytics/revenue");
    return response.data;
  },
};

export default adminAnalyticsService;
