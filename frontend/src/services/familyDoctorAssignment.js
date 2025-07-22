import api from './api';

export const familyDoctorAssignmentService = {
  // Get available doctors for family assignment
  getAvailableDoctors: async () => {
    try {
      const response = await api.get('/family/doctors');
      return response.data;
    } catch (error) {
      console.error('Get available doctors error:', error);
      throw error;
    }
  },

  // Assign doctor to family/elder
  assignDoctor: async (assignmentData) => {
    try {
      const response = await api.post('/family/doctor-assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Assign doctor error:', error);
      throw error;
    }
  },

  // Get family's current doctor assignments
  getFamilyDoctorAssignments: async () => {
    try {
      const response = await api.get('/family/doctor-assignments');
      return response.data;
    } catch (error) {
      console.error('Get family doctor assignments error:', error);
      throw error;
    }
  },

  // Update doctor assignment
  updateAssignment: async (assignmentId, updateData) => {
    try {
      const response = await api.put(`/family/doctor-assignments/${assignmentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update doctor assignment error:', error);
      throw error;
    }
  },

  // Remove doctor assignment
  removeAssignment: async (assignmentId) => {
    try {
      const response = await api.delete(`/family/doctor-assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Remove doctor assignment error:', error);
      throw error;
    }
  }
};