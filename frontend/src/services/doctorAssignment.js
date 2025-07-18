// frontend/src/services/doctorAssignment.js
import api from './api';

export const doctorAssignmentService = {
  // Get available doctors
  getAvailableDoctors: async () => {
    const response = await api.get('/doctor-assignments/doctors'); // ✅ Remove /api prefix
    return response.data;
  },

  // Assign doctor to elder
  assignDoctor: async (assignmentData) => {
    const response = await api.post('/doctor-assignments/assign', assignmentData); // ✅ Remove /api prefix
    return response.data;
  },

  // Get family's doctor assignments
  getFamilyDoctorAssignments: async (params = {}) => {
    const response = await api.get('/doctor-assignments/assignments', { params }); // ✅ Remove /api prefix
    return response.data;
  },

  // Get assignments for specific elder
  getElderDoctorAssignments: async (elderId) => {
    const response = await api.get(`/doctor-assignments/elders/${elderId}/assignments`); // ✅ Remove /api prefix
    return response.data;
  },

  // Get assignment details
  getAssignmentDetails: async (assignmentId) => {
    const response = await api.get(`/doctor-assignments/assignments/${assignmentId}`); // ✅ Remove /api prefix
    return response.data;
  },

  // Terminate assignment
  terminateAssignment: async (assignmentId, reason) => {
    const response = await api.put(`/doctor-assignments/assignments/${assignmentId}/terminate`, { reason }); // ✅ Remove /api prefix
    return response.data;
  }
};