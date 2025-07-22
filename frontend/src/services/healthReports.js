import api from './api';

export const healthReportsService = {
  // Generate daily report
  generateDailyReport: async (date, elderId = null) => {
    try {
      const params = { date };
      if (elderId) params.elderId = elderId;
      
      const response = await api.get('/health-reports/daily', { params });
      return response.data;
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  },

  // Generate weekly report
  generateWeeklyReport: async (startDate, endDate, elderId = null) => {
    try {
      const params = { startDate, endDate };
      if (elderId) params.elderId = elderId;
      
      const response = await api.get('/health-reports/weekly', { params });
      return response.data;
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  },

  // Generate monthly report
  generateMonthlyReport: async (year, month, elderId = null) => {
    try {
      const params = { year, month };
      if (elderId) params.elderId = elderId;
      
      const response = await api.get('/health-reports/monthly', { params });
      return response.data;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  },

  // Download PDF report
  downloadPDFReport: async (reportType, params) => {
    try {
      console.log('📄 Downloading PDF report:', reportType, params);
      
      const endpoint = `/health-reports/${reportType}/pdf`;
      
      // Use axios with responseType 'blob' for binary data
      const response = await api.get(endpoint, {
        params: params,
        responseType: 'blob', // Important: This tells axios to expect binary data
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      console.log('📄 PDF response received:', response);
      
      // Check if response is actually a PDF
      if (response.headers['content-type'] !== 'application/pdf') {
        // If it's not a PDF, it might be an error response
        const text = await response.data.text();
        console.error('❌ Expected PDF but got:', response.headers['content-type'], text);
        throw new Error('Server returned invalid PDF format');
      }
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on report type and date
      const today = new Date().toISOString().split('T')[0];
      const filename = `health-report-${reportType}-${today}.pdf`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF downloaded successfully as:', filename);
      
    } catch (error) {
      console.error('❌ PDF download failed:', error);
      
      // Better error handling for PDF downloads
      if (error.response?.status === 404) {
        throw new Error('PDF report endpoint not found');
      } else if (error.response?.status === 500) {
        throw new Error('Server error while generating PDF');
      } else if (error.message.includes('invalid PDF format')) {
        throw new Error('Server returned invalid PDF format. Please try again.');
      } else {
        throw new Error('Failed to download PDF report: ' + error.message);
      }
    }
  }
};