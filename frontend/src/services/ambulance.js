import api from './api';

// Ambulance Management APIs
export const ambulanceService = {
  // Get all ambulances
  getAllAmbulances: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/ambulance?${params}`);
    return response.data;
  },

  // Get available ambulances
  getAvailableAmbulances: async (latitude, longitude, limit = 10) => {
    const response = await api.get(
      `/ambulance/available?latitude=${latitude}&longitude=${longitude}&limit=${limit}`
    );
    return response.data;
  },

  // Get ambulance by ID
  getAmbulanceById: async (id) => {
    const response = await api.get(`/ambulance/${id}`);
    return response.data;
  },

  // Create new ambulance
  createAmbulance: async (ambulanceData) => {
    const response = await api.post('/ambulance', ambulanceData);
    return response.data;
  },

  // Update ambulance
  updateAmbulance: async (id, ambulanceData) => {
    const response = await api.put(`/ambulance/${id}`, ambulanceData);
    return response.data;
  },

  // Update ambulance location
  updateAmbulanceLocation: async (id, location) => {
    const response = await api.patch(`/ambulance/${id}/location`, location);
    return response.data;
  },

  // Update ambulance status
  updateAmbulanceStatus: async (id, status) => {
    const response = await api.patch(`/ambulance/${id}/status`, { status });
    return response.data;
  },

  // Delete ambulance
  deleteAmbulance: async (id) => {
    const response = await api.delete(`/ambulance/${id}`);
    return response.data;
  },

  // Get ambulance statistics
  getAmbulanceStats: async () => {
    const response = await api.get('/ambulance/stats');
    return response.data;
  },

  // Get available drivers
  getAvailableDrivers: async () => {
    const response = await api.get('/ambulance/drivers');
    return response.data;
  },
};

// Coordinator Dashboard APIs
export const coordinatorService = {
  // Get dashboard overview
  getDashboardOverview: async () => {
    const response = await api.get('/coordinator/dashboard');
    return response.data;
  },

  // Get emergency queue
  getEmergencyQueue: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/coordinator/queue?${params}`);
    return response.data;
  },

  // Acknowledge emergency
  acknowledgeEmergency: async (emergencyId) => {
    const response = await api.post(`/coordinator/emergency/${emergencyId}/acknowledge`);
    return response.data;
  },

  // Dispatch ambulance
  dispatchAmbulance: async (emergencyId, dispatchData) => {
    const response = await api.post(`/coordinator/emergency/${emergencyId}/dispatch`, dispatchData);
    return response.data;
  },

  // Get dispatch history
  getDispatchHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/coordinator/dispatch/history?${params}`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/coordinator/analytics?period=${period}`);
    return response.data;
  },
};

// Emergency Alert APIs
export const emergencyService = {
  // Trigger emergency
  triggerEmergency: async (emergencyData) => {
    const response = await api.post('/emergency/trigger', emergencyData);
    return response.data;
  },

  // Get emergency history
  getEmergencyHistory: async (elderId) => {
    const response = await api.get(`/emergency/history/${elderId}`);
    return response.data;
  },

  // Get emergency contacts
  getEmergencyContacts: async (elderId) => {
    const response = await api.get(`/emergency/contacts/${elderId}`);
    return response.data;
  },
};

// SOS Response APIs (Driver)
export const sosResponseService = {
  // Accept dispatch
  acceptDispatch: async (dispatchId) => {
    const response = await api.post(`/sos/dispatch/${dispatchId}/accept`);
    return response.data;
  },

  // Update dispatch location
  updateDispatchLocation: async (dispatchId, location) => {
    const response = await api.post(`/sos/dispatch/${dispatchId}/location`, location);
    return response.data;
  },

  // Mark arrived
  markArrived: async (dispatchId) => {
    const response = await api.post(`/sos/dispatch/${dispatchId}/arrived`);
    return response.data;
  },

  // Complete dispatch
  completeDispatch: async (dispatchId, completionData) => {
    const response = await api.post(`/sos/dispatch/${dispatchId}/complete`, completionData);
    return response.data;
  },

  // Get active dispatch
  getActiveDispatch: async () => {
    const response = await api.get('/sos/driver/active');
    return response.data;
  },

  // Get dispatch history
  getDispatchHistory: async (limit = 20, offset = 0) => {
    const response = await api.get(`/sos/driver/history?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get driver stats
  getDriverStats: async () => {
    const response = await api.get('/sos/driver/stats');
    return response.data;
  },
};

export default {
  ambulanceService,
  coordinatorService,
  emergencyService,
  sosResponseService,
};
