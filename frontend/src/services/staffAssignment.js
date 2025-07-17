import apiClient from './api';

export const staffAssignmentService = {
  // Get available staff members
  getAvailableStaff: async () => {
    try {
      console.log('🔍 StaffAssignmentService: Getting available staff...');
      const response = await apiClient.get('/staff-assignments/available-staff');
      console.log('✅ StaffAssignmentService: Available staff response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ StaffAssignmentService: Failed to get available staff:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      throw error;
    }
  },

  // Debug version - fallback to simple endpoint
  getAvailableStaffSimple: async () => {
    try {
      console.log('🔍 StaffAssignmentService: Getting available staff (simple)...');
      const response = await apiClient.get('/staff-assignments/available-staff-simple');
      console.log('✅ StaffAssignmentService: Available staff (simple) response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ StaffAssignmentService: Simple request failed:', error);
      throw error;
    }
  },

  // Assign elder to staff member
  assignElderToStaff: async (elderId, staffId) => {
    try {
      console.log('📝 StaffAssignmentService: Assigning elder to staff:', { elderId, staffId });
      const response = await apiClient.post('/staff-assignments/assign', {
        elderId,
        staffId
      });
      console.log('✅ StaffAssignmentService: Elder assigned to staff:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ StaffAssignmentService: Failed to assign elder to staff:', error);
      console.error('❌ Response data:', error.response?.data);
      throw error;
    }
  },

  // Get elder's current staff assignment
  getElderStaffAssignment: async (elderId) => {
    try {
      console.log('🔍 StaffAssignmentService: Getting elder staff assignment:', elderId);
      const response = await apiClient.get(`/staff-assignments/elder/${elderId}`);
      console.log('✅ StaffAssignmentService: Elder staff assignment:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ StaffAssignmentService: Failed to get elder staff assignment:', error);
      console.error('❌ Response data:', error.response?.data);
      throw error;
    }
  },

  // Unassign elder from staff
  unassignElderFromStaff: async (elderId) => {
    try {
      console.log('📝 StaffAssignmentService: Unassigning elder from staff:', elderId);
      const response = await apiClient.delete(`/staff-assignments/elder/${elderId}`);
      console.log('✅ StaffAssignmentService: Elder unassigned from staff:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ StaffAssignmentService: Failed to unassign elder from staff:', error);
      console.error('❌ Response data:', error.response?.data);
      throw error;
    }
  }
};