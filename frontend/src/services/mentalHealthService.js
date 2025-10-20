// frontend/src/services/mentalHealthService.js
import api from "./api";

const mentalHealthService = {
  // ============= DASHBOARD =============
  getDashboardStatistics: async () => {
    const response = await api.get("/mental-health/dashboard/statistics");
    return response.data;
  },

  getTodaySchedule: async () => {
    const response = await api.get("/mental-health/dashboard/today");
    return response.data;
  },

  getRecentActivities: async (limit = 10) => {
    const response = await api.get(
      `/mental-health/dashboard/activities?limit=${limit}`
    );
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get("/mental-health/dashboard/alerts");
    return response.data;
  },

  // ============= ASSIGNMENTS =============
  createAssignment: async (assignmentData) => {
    const response = await api.post(
      "/mental-health/assignments",
      assignmentData
    );
    return response.data;
  },

  getFamilyAssignments: async () => {
    const response = await api.get("/mental-health/assignments/family");
    return response.data;
  },

  getSpecialistClients: async (status = null) => {
    const url = status
      ? `/mental-health/assignments/clients?status=${status}`
      : "/mental-health/assignments/clients";
    const response = await api.get(url);
    return response.data;
  },

  getAssignedElders: async () => {
    const response = await api.get(
      "/mental-health/assignments/clients?status=active"
    );
    // Map clients to elders format
    return {
      elders:
        response.data.clients?.map((assignment) => assignment.elder) || [],
    };
  },

  getAvailableSpecialists: async () => {
    const response = await api.get(
      "/mental-health/assignments/specialists/available"
    );
    return response.data;
  },

  updateAssignment: async (assignmentId, updates) => {
    const response = await api.put(
      `/mental-health/assignments/${assignmentId}`,
      updates
    );
    return response.data;
  },

  terminateAssignment: async (assignmentId) => {
    const response = await api.delete(
      `/mental-health/assignments/${assignmentId}`
    );
    return response.data;
  },

  // ============= THERAPY SESSIONS =============
  createSession: async (sessionData) => {
    const response = await api.post("/mental-health/sessions", sessionData);
    return response.data;
  },

  getSpecialistSessions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/mental-health/sessions?${params}`);
    return response.data;
  },

  getElderSessions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/mental-health/sessions/elder?${params}`);
    return response.data;
  },

  completeSession: async (sessionId, completionData) => {
    const response = await api.put(
      `/mental-health/sessions/${sessionId}/complete`,
      completionData
    );
    return response.data;
  },

  updateSession: async (sessionId, updates) => {
    const response = await api.put(
      `/mental-health/sessions/${sessionId}`,
      updates
    );
    return response.data;
  },

  cancelSession: async (sessionId) => {
    const response = await api.delete(`/mental-health/sessions/${sessionId}`);
    return response.data;
  },

  getSessionStatistics: async () => {
    const response = await api.get("/mental-health/sessions/statistics");
    return response.data;
  },

  createZoomMeeting: async (sessionId) => {
    const response = await api.post(
      `/mental-health/sessions/${sessionId}/create-zoom`
    );
    return response.data;
  },

  // ============= ASSESSMENTS =============
  createAssessment: async (assessmentData) => {
    const response = await api.post(
      "/mental-health/assessments",
      assessmentData
    );
    return response.data;
  },

  getSpecialistAssessments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/mental-health/assessments?${params}`);
    return response.data;
  },

  getAssessmentById: async (assessmentId) => {
    const response = await api.get(
      `/mental-health/assessments/${assessmentId}`
    );
    return response.data;
  },

  completeAssessment: async (assessmentId, completionData) => {
    const response = await api.put(
      `/mental-health/assessments/${assessmentId}/complete`,
      completionData
    );
    return response.data;
  },

  updateAssessment: async (assessmentId, updates) => {
    const response = await api.put(
      `/mental-health/assessments/${assessmentId}`,
      updates
    );
    return response.data;
  },

  deleteAssessment: async (assessmentId) => {
    const response = await api.delete(
      `/mental-health/assessments/${assessmentId}`
    );
    return response.data;
  },

  getAssessmentStatistics: async () => {
    const response = await api.get("/mental-health/assessments/statistics");
    return response.data;
  },

  // ============= TREATMENT PLANS =============
  createTreatmentPlan: async (planData) => {
    const response = await api.post("/mental-health/treatment-plans", planData);
    return response.data;
  },

  getSpecialistTreatmentPlans: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(
      `/mental-health/treatment-plans/specialist?${params}`
    );
    return response.data;
  },

  getCaregiverTreatmentPlans: async (elderId = null) => {
    const url = elderId
      ? `/mental-health/treatment-plans/caregiver?elderId=${elderId}`
      : "/mental-health/treatment-plans/caregiver";
    const response = await api.get(url);
    return response.data;
  },

  getTreatmentPlanById: async (planId) => {
    const response = await api.get(`/mental-health/treatment-plans/${planId}`);
    return response.data;
  },

  updateTreatmentPlan: async (planId, updates) => {
    const response = await api.put(
      `/mental-health/treatment-plans/${planId}`,
      updates
    );
    return response.data;
  },

  submitProgressReport: async (planId, progressData) => {
    const response = await api.post(
      `/mental-health/treatment-plans/${planId}/progress`,
      progressData
    );
    return response.data;
  },

  getProgressReports: async (planId) => {
    const response = await api.get(
      `/mental-health/treatment-plans/${planId}/progress`
    );
    return response.data;
  },

  getTreatmentPlanStatistics: async () => {
    const response = await api.get("/mental-health/treatment-plans/statistics");
    return response.data;
  },

  // ============= PROGRESS REPORTS =============
  createProgressReport: async (reportData) => {
    const response = await api.post(
      "/mental-health/progress-reports",
      reportData
    );
    return response.data;
  },

  getSpecialistProgressReports: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/mental-health/progress-reports?${params}`);
    return response.data;
  },

  getProgressReportById: async (reportId) => {
    const response = await api.get(
      `/mental-health/progress-reports/${reportId}`
    );
    return response.data;
  },

  updateProgressReport: async (reportId, updates) => {
    const response = await api.put(
      `/mental-health/progress-reports/${reportId}`,
      updates
    );
    return response.data;
  },

  deleteProgressReport: async (reportId) => {
    const response = await api.delete(
      `/mental-health/progress-reports/${reportId}`
    );
    return response.data;
  },

  getProgressReportStatistics: async () => {
    const response = await api.get(
      "/mental-health/progress-reports/statistics"
    );
    return response.data;
  },

  // ============= GROUP SESSIONS =============
  createGroupSession: async (sessionData) => {
    const response = await api.post(
      "/mental-health/group-sessions",
      sessionData
    );
    return response.data;
  },

  getSpecialistGroupSessions: async (status = null) => {
    const url = status
      ? `/mental-health/group-sessions?status=${status}`
      : "/mental-health/group-sessions";
    const response = await api.get(url);
    return response.data;
  },

  getGroupSessionById: async (sessionId) => {
    const response = await api.get(
      `/mental-health/group-sessions/${sessionId}`
    );
    return response.data;
  },

  updateGroupSession: async (sessionId, updates) => {
    const response = await api.put(
      `/mental-health/group-sessions/${sessionId}`,
      updates
    );
    return response.data;
  },

  addParticipant: async (sessionId, elderId) => {
    const response = await api.post(
      `/mental-health/group-sessions/${sessionId}/participants`,
      { elderId }
    );
    return response.data;
  },

  removeParticipant: async (sessionId, elderId) => {
    const response = await api.delete(
      `/mental-health/group-sessions/${sessionId}/participants/${elderId}`
    );
    return response.data;
  },

  completeGroupSession: async (sessionId) => {
    const response = await api.put(
      `/mental-health/group-sessions/${sessionId}/complete`
    );
    return response.data;
  },

  cancelGroupSession: async (sessionId) => {
    const response = await api.put(
      `/mental-health/group-sessions/${sessionId}/cancel`
    );
    return response.data;
  },

  // ============= RESOURCES =============
  createResource: async (resourceData) => {
    const response = await api.post("/mental-health/resources", resourceData);
    return response.data;
  },

  getAllResources: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/mental-health/resources?${params}`);
    return response.data;
  },

  getResourceById: async (resourceId) => {
    const response = await api.get(`/mental-health/resources/${resourceId}`);
    return response.data;
  },

  updateResource: async (resourceId, updates) => {
    const response = await api.put(
      `/mental-health/resources/${resourceId}`,
      updates
    );
    return response.data;
  },

  deleteResource: async (resourceId) => {
    const response = await api.delete(`/mental-health/resources/${resourceId}`);
    return response.data;
  },

  incrementDownloadCount: async (resourceId) => {
    const response = await api.post(
      `/mental-health/resources/${resourceId}/download`
    );
    return response.data;
  },

  rateResource: async (resourceId, rating) => {
    const response = await api.post(
      `/mental-health/resources/${resourceId}/rate`,
      { rating }
    );
    return response.data;
  },

  getResourceStatistics: async () => {
    const response = await api.get("/mental-health/resources/statistics");
    return response.data;
  },

  // ============= PROFILE =============
  getSpecialistProfile: async () => {
    const response = await api.get("/mental-health/profile");
    return response.data;
  },

  updateSpecialistProfile: async (profileData) => {
    const response = await api.put("/mental-health/profile", profileData);
    return response.data;
  },

  updateProfileImage: async (imageUrl) => {
    const response = await api.put("/mental-health/profile/image", {
      profileImage: imageUrl,
    });
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put(
      "/mental-health/profile/password",
      passwordData
    );
    return response.data;
  },

  getProfileStatistics: async () => {
    const response = await api.get("/mental-health/profile/statistics");
    return response.data;
  },

  // ============= STAFF ASSESSMENT MANAGEMENT =============
  getStaffAssessments: async (elderId = null, status = null) => {
    const params = new URLSearchParams();
    if (elderId) params.append("elderId", elderId);
    if (status) params.append("status", status);
    const queryString = params.toString();
    const url = queryString
      ? `/staff/assessments?${queryString}`
      : "/staff/assessments";
    const response = await api.get(url);
    return response.data;
  },

  getStaffAssessmentStats: async () => {
    const response = await api.get("/staff/assessments/stats");
    return response.data;
  },

  updateStaffAssessmentStatus: async (assessmentId, statusData) => {
    const response = await api.patch(
      `/staff/assessments/${assessmentId}/status`,
      statusData
    );
    return response.data;
  },
};

export default mentalHealthService;
