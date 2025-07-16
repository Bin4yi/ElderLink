import apiClient from './api';

export const healthReportsService = {
  // Generate daily report
  generateDailyReport: async (date, elderId = null) => {
    try {
      const params = new URLSearchParams({ date });
      if (elderId) params.append('elderId', elderId);
      
      const response = await apiClient.get(`/health-reports/daily?${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to generate daily report:', error);
      throw error;
    }
  },

  // Generate weekly report
  generateWeeklyReport: async (startDate, endDate, elderId = null) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (elderId) params.append('elderId', elderId);
      
      const response = await apiClient.get(`/health-reports/weekly?${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to generate weekly report:', error);
      throw error;
    }
  },

  // Generate monthly report
  generateMonthlyReport: async (year, month, elderId = null) => {
    try {
      const params = new URLSearchParams({ year, month });
      if (elderId) params.append('elderId', elderId);
      
      const response = await apiClient.get(`/health-reports/monthly?${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to generate monthly report:', error);
      throw error;
    }
  },

  // Download PDF report
  downloadPDFReport: async (type, params) => {
    try {
      const queryParams = new URLSearchParams({ type, ...params });
      
      const response = await apiClient.get(`/health-reports/pdf?${queryParams}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health_report_${type}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to download PDF report:', error);
      throw error;
    }
  }
};