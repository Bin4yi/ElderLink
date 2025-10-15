import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Moon,
  Filter,
  BarChart3
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import { healthReportsService } from '../../../services/healthReports';
import { elderService } from '../../../services/elder';
import toast from 'react-hot-toast';

const HealthReports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elders, setElders] = useState([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    elderId: ''
  });

  useEffect(() => {
    loadElders();
  }, []);

  useEffect(() => {
    if (activeTab === 'daily') {
      generateDailyReport();
    } else if (activeTab === 'weekly') {
      generateWeeklyReport();
    } else if (activeTab === 'monthly') {
      generateMonthlyReport();
    }
  }, [activeTab]);

  const loadElders = async () => {
    try {
      console.log('🔍 Loading assigned elders for health reports...');
      
      // Get assigned elders for staff members
      const response = await elderService.getAssignedElders();
      console.log('📊 Assigned elders response:', response);
      
      if (response && response.success) {
        // Handle the response structure from getAssignedElders
        const eldersArray = response.elders || [];
        setElders(eldersArray);
        console.log('✅ Loaded', eldersArray.length, 'assigned elders for reports');
        
        if (eldersArray.length === 0) {
          toast.info('No assigned elders found. Reports will be empty until elders are assigned to you.');
        }
      } else {
        setElders([]);
        console.log('ℹ️ No assigned elders found for reports');
        toast.info('No assigned elders available');
      }
    } catch (error) {
      console.error('❌ Failed to load assigned elders:', error);
      setElders([]);
      
      // Better error handling
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - please check your connection');
      } else if (error.response?.status === 403) {
        toast.error('Access denied - you may not have permission to view elders');
      } else if (error.response?.status === 401) {
        toast.error('Session expired - please login again');
      } else {
        toast.error('Failed to load assigned elders: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const generateDailyReport = async () => {
    try {
      setLoading(true);
      console.log('📊 Generating daily report for:', filters.date);
      
      const response = await healthReportsService.generateDailyReport(
        filters.date,
        filters.elderId || null
      );
      
      console.log('✅ Daily report response:', response);
      
      if (response && response.success && response.data) {
        setReportData(response.data);
        toast.success('Daily report generated successfully');
      } else {
        setReportData(null);
        toast.error('No data found for the selected date');
      }
    } catch (error) {
      console.error('❌ Failed to generate daily report:', error);
      setReportData(null);
      toast.error('Failed to generate daily report: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyReport = async () => {
    try {
      setLoading(true);
      console.log('📊 Generating weekly report for:', filters.startDate, 'to', filters.endDate);
      
      const response = await healthReportsService.generateWeeklyReport(
        filters.startDate,
        filters.endDate,
        filters.elderId || null
      );
      
      console.log('✅ Weekly report response:', response);
      
      if (response && response.success && response.data) {
        setReportData(response.data);
        toast.success('Weekly report generated successfully');
      } else {
        setReportData(null);
        toast.error('No data found for the selected date range');
      }
    } catch (error) {
      console.error('❌ Failed to generate weekly report:', error);
      setReportData(null);
      toast.error('Failed to generate weekly report: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyReport = async () => {
    try {
      setLoading(true);
      console.log('📊 Generating monthly report for:', filters.year, filters.month);
      
      const response = await healthReportsService.generateMonthlyReport(
        filters.year,
        filters.month,
        filters.elderId || null
      );
      
      console.log('✅ Monthly report response:', response);
      
      if (response && response.success && response.data) {
        setReportData(response.data);
        toast.success('Monthly report generated successfully');
      } else {
        setReportData(null);
        toast.error('No data found for the selected month');
      }
    } catch (error) {
      console.error('❌ Failed to generate monthly report:', error);
      setReportData(null);
      toast.error('Failed to generate monthly report: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = () => {
    if (activeTab === 'daily') {
      generateDailyReport();
    } else if (activeTab === 'weekly') {
      generateWeeklyReport();
    } else if (activeTab === 'monthly') {
      generateMonthlyReport();
    }
  };

  const handleDownloadPDF = async () => {
    try {
      let params = {};
      
      if (activeTab === 'daily') {
        params = { date: filters.date };
      } else if (activeTab === 'weekly') {
        params = { startDate: filters.startDate, endDate: filters.endDate };
      } else if (activeTab === 'monthly') {
        params = { year: filters.year, month: filters.month };
      }
      
      if (filters.elderId) {
        params.elderId = filters.elderId;
      }
      
      await healthReportsService.downloadPDFReport(activeTab, params);
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      // Show the specific error message from the service
      toast.error(error.message || 'Failed to download PDF report');
      console.error('Error downloading PDF:', error);
    }
  };

  const renderSummaryCard = (title, value, icon, color) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderVitalStats = (stats) => {
    if (!stats || Object.keys(stats).length === 0) {
      return <p className="text-gray-500">No vital statistics available</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.heartRate && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-medium">Heart Rate</span>
            </div>
            <p className="text-sm text-gray-600">
              Avg: {stats.heartRate.average} bpm | 
              Range: {stats.heartRate.min}-{stats.heartRate.max} bpm |
              Records: {stats.heartRate.count}
            </p>
          </div>
        )}
        
        {stats.temperature && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Temperature</span>
            </div>
            <p className="text-sm text-gray-600">
              Avg: {stats.temperature.average}°F | 
              Range: {stats.temperature.min}-{stats.temperature.max}°F |
              Records: {stats.temperature.count}
            </p>
          </div>
        )}
        
        {stats.bloodPressureSystolic && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Blood Pressure</span>
            </div>
            <p className="text-sm text-gray-600">
              Systolic Avg: {stats.bloodPressureSystolic.average} mmHg |
              Records: {stats.bloodPressureSystolic.count}
            </p>
          </div>
        )}
        
        {stats.weight && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Weight</span>
            </div>
            <p className="text-sm text-gray-600">
              Avg: {stats.weight.average} lbs | 
              Range: {stats.weight.min}-{stats.weight.max} lbs |
              Records: {stats.weight.count}
            </p>
          </div>
        )}
        
        {stats.oxygenSaturation && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="font-medium">Oxygen Saturation</span>
            </div>
            <p className="text-sm text-gray-600">
              Avg: {stats.oxygenSaturation.average}% | 
              Range: {stats.oxygenSaturation.min}-{stats.oxygenSaturation.max}% |
              Records: {stats.oxygenSaturation.count}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderElderTrends = (trends) => {
    if (!trends || Object.keys(trends).length === 0) {
      return <p className="text-gray-500">No trend data available</p>;
    }

    return (
      <div className="space-y-4">
        {Object.values(trends).map((trend, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-lg mb-2">{trend.elderName}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{trend.recordCount}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{trend.alertDistribution.critical}</p>
                <p className="text-sm text-gray-600">Critical Alerts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{trend.alertDistribution.warning}</p>
                <p className="text-sm text-gray-600">Warning Alerts</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Elder (Optional)
          </label>
          <select
            value={filters.elderId}
            onChange={(e) => handleFilterChange('elderId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Elders</option>
            {elders.map(elder => (
              <option key={elder.id} value={elder.id}>
                {elder.firstName} {elder.lastName}
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'daily' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {activeTab === 'weekly' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {activeTab === 'monthly' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[
                  { value: 1, label: 'January' },
                  { value: 2, label: 'February' },
                  { value: 3, label: 'March' },
                  { value: 4, label: 'April' },
                  { value: 5, label: 'May' },
                  { value: 6, label: 'June' },
                  { value: 7, label: 'July' },
                  { value: 8, label: 'August' },
                  { value: 9, label: 'September' },
                  { value: 10, label: 'October' },
                  { value: 11, label: 'November' },
                  { value: 12, label: 'December' }
                ].map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        
        {reportData && (
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        )}
      </div>
    </div>
  );

  return (
    <RoleLayout title="Health Reports">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Health Reports</h1>
                <p className="text-gray-600">Generate comprehensive health reports for elders</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Report
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Report Content */}
          {reportData && !loading && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderSummaryCard(
                  'Total Records',
                  reportData.summary?.totalRecords || 0,
                  <FileText className="w-6 h-6 text-blue-600" />,
                  '#3B82F6'
                )}
                {renderSummaryCard(
                  'Total Elders',
                  reportData.summary?.totalElders || 0,
                  <Users className="w-6 h-6 text-green-600" />,
                  '#10B981'
                )}
                {renderSummaryCard(
                  'Critical Alerts',
                  reportData.summary?.criticalAlerts || 0,
                  <AlertTriangle className="w-6 h-6 text-red-600" />,
                  '#EF4444'
                )}
                {renderSummaryCard(
                  'Warning Alerts',
                  reportData.summary?.warningAlerts || 0,
                  <AlertTriangle className="w-6 h-6 text-orange-600" />,
                  '#F59E0B'
                )}
              </div>

              {/* Vital Statistics */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Vital Statistics</h3>
                {renderVitalStats(reportData.statistics)}
              </div>

              {/* Elder Trends */}
              {reportData.trends && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Elder Trends</h3>
                  {renderElderTrends(reportData.trends)}
                </div>
              )}

              {/* Weekly Breakdown for Monthly Reports */}
              {reportData.weeklyBreakdown && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Weekly Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportData.weeklyBreakdown.map((week, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">{week.week}</h4>
                        <p className="text-sm text-gray-600 mb-2">{week.period}</p>
                        <div className="space-y-1">
                          <p className="text-sm">Records: {week.recordCount}</p>
                          <p className="text-sm text-red-600">Critical: {week.criticalAlerts}</p>
                          <p className="text-sm text-orange-600">Warning: {week.warningAlerts}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Data Message */}
          {reportData && !loading && (!reportData.summary || reportData.summary.totalRecords === 0) && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No health records found for the selected period</p>
              <p className="text-sm text-gray-400 mt-2">
                Try selecting a different date range or elder
              </p>
            </div>
          )}

          {/* Error Message */}
          {!reportData && !loading && (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-red-500">Failed to generate report</p>
              <p className="text-sm text-gray-400 mt-2">
                Please try again or check your network connection
              </p>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default HealthReports;