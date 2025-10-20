import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  FileText,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Eye,
  BarChart3,
  Pill,
  Stethoscope,
  Droplets,
  ThermometerSun,
  RefreshCw
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FamilyHealthReports = () => {
  // State for filters
  const [selectedElder, setSelectedElder] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  console.log('Component render - selectedElder:', selectedElder, 'selectedPeriod:', selectedPeriod);
  
  // State for backend data
  const [elders, setElders] = useState([]);
  const [healthData, setHealthData] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [chartData, setChartData] = useState({});
  const [vitalStats, setVitalStats] = useState({});
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch assigned elders
  const fetchElders = async () => {
    try {
      console.log('Fetching elders...');
      const response = await api.get('/elders');
      console.log('Elders response:', response.data);
      const eldersList = response.data.elders || response.data || [];
      console.log('Setting elders:', eldersList);
      setElders(eldersList);
      return eldersList;
    } catch (err) {
      console.error('Error fetching elders:', err);
      console.error('Error response:', err.response?.data);
      toast.error('Failed to fetch elders');
      setError('Failed to load elders');
      return [];
    }
  };

  // Fetch health reports based on period
  const fetchHealthReports = async () => {
    try {
      let endpoint = '';
      let params = {};

      const today = new Date();
      
      if (selectedPeriod === 'day') {
        endpoint = '/health-reports/daily';
        params.date = today.toISOString().split('T')[0];
      } else if (selectedPeriod === 'week') {
        endpoint = '/health-reports/weekly';
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else {
        endpoint = '/health-reports/monthly';
        params.year = today.getFullYear();
        params.month = today.getMonth() + 1;
      }

      if (selectedElder !== 'all') {
        params.elderId = selectedElder;
      }

      const response = await api.get(endpoint, { params });

      setReportSummary(response.data.data?.summary || null);
    } catch (err) {
      console.error('Error fetching health reports:', err);
      toast.error('Failed to fetch health reports');
    }
  };

  // Fetch vitals data for charts
  const fetchVitalsForElders = async () => {
    try {
      const token = localStorage.getItem('token');
      const eldersToFetch = selectedElder === 'all' 
        ? elders 
        : elders.filter(e => e.id === selectedElder);

      console.log('Fetching vitals for elders:', eldersToFetch);

      if (eldersToFetch.length === 0) {
        console.log('No elders to fetch vitals for');
        setHealthData([]);
        return;
      }

      const vitalsPromises = eldersToFetch.map(elder =>
        api.get(`/health-reports/summary/${elder.id}`)
      );

      const results = await Promise.all(vitalsPromises);
      console.log('Vitals results raw:', results);
      console.log('First result structure:', results[0]?.data);
      
      const vitalsData = results.map((res, idx) => {
        // Backend returns: { success: true, data: { summary, records } }
        const allRecords = res.data.data?.records || res.data.records || [];
        console.log(`Elder ${idx} (${eldersToFetch[idx]?.firstName}):`, {
          responseData: res.data,
          extractedRecords: allRecords,
          recordCount: allRecords.length
        });
        
        return {
          elder: eldersToFetch[idx],
          records: allRecords
        };
      });

      console.log('Processed vitals data:', vitalsData);
      setHealthData(vitalsData);
      processVitalsHistory(vitalsData);
    } catch (err) {
      console.error('Error fetching vitals:', err);
      console.error('Error response:', err.response?.data);
      toast.error('Failed to fetch vitals data');
    }
  };

  // Process vitals history for charts
  const processVitalsHistory = (vitalsData) => {
    const charts = {};
    const stats = {};

    vitalsData.forEach(({ elder, records }) => {
      if (records.length > 0) {
        // Take last 7 records for chart
        const recentRecords = records.slice(-7);
        
        charts[elder.id] = {
          labels: recentRecords.map(r => 
            new Date(r.monitoringDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          ),
          datasets: [
            {
              label: 'Heart Rate (bpm)',
              data: recentRecords.map(r => r.heartRate),
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: true,
              yAxisID: 'y',
              tension: 0.4
            },
            {
              label: 'Blood Pressure (Systolic)',
              data: recentRecords.map(r => r.bloodPressureSystolic),
              borderColor: 'rgb(236, 72, 153)',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              fill: true,
              yAxisID: 'y1',
              tension: 0.4
            },
            {
              label: 'Oxygen Saturation (%)',
              data: recentRecords.map(r => r.oxygenSaturation),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              yAxisID: 'y2',
              tension: 0.4
            }
          ]
        };

        // Calculate statistics
        stats[elder.id] = {
          heartRate: calculateVitalStats(records, 'heartRate'),
          bloodPressure: calculateVitalStats(records, 'bloodPressureSystolic'),
          oxygenSaturation: calculateVitalStats(records, 'oxygenSaturation'),
          temperature: calculateVitalStats(records, 'temperature')
        };
      }
    });

    setChartData(charts);
    setVitalStats(stats);
  };

  // Calculate vital statistics
  const calculateVitalStats = (records, vitalField) => {
    const values = records
      .filter(r => r[vitalField] != null)
      .map(r => parseFloat(r[vitalField]));
    
    if (values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    let status = 'normal';
    if (vitalField === 'bloodPressureSystolic') {
      if (avg > 140) status = 'high';
      else if (avg > 130) status = 'elevated';
    } else if (vitalField === 'heartRate') {
      if (avg > 100 || avg < 60) status = 'elevated';
    } else if (vitalField === 'oxygenSaturation') {
      if (avg < 95) status = 'low';
    } else if (vitalField === 'temperature') {
      if (avg > 99.5 || avg < 97) status = 'elevated';
    }

    const trend = values[values.length - 1] > values[0] ? 'up' 
      : values[values.length - 1] < values[0] ? 'down' 
      : 'stable';

    return {
      average: avg.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1),
      status,
      trend
    };
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      const eldersList = await fetchElders();
      if (eldersList.length > 0) {
        setLoading(true);
        await Promise.all([fetchHealthReports(), fetchVitalsForElders()])
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Fetch health reports when filters change (but not on initial load)
  useEffect(() => {
    if (elders.length > 0) {
      setLoading(true);
      Promise.all([fetchHealthReports(), fetchVitalsForElders()])
        .finally(() => setLoading(false));
    }
  }, [selectedElder, selectedPeriod]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHealthReports(), fetchVitalsForElders()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  // Export PDF
  const handleExportPDF = async () => {
    try {
      let endpoint = '';
      const params = {};

      const today = new Date();
      
      if (selectedPeriod === 'day') {
        endpoint = '/health-reports/daily/pdf';
        params.date = today.toISOString().split('T')[0];
      } else if (selectedPeriod === 'week') {
        endpoint = '/health-reports/weekly/pdf';
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else {
        endpoint = '/health-reports/monthly/pdf';
        params.year = today.getFullYear();
        params.month = today.getMonth() + 1;
      }

      if (selectedElder !== 'all') {
        params.elderId = selectedElder;
      }

      const response = await api.get(endpoint, {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health-report-${selectedPeriod}-${today.toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Failed to export report');
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 50,
        max: 120,
        title: {
          display: true,
          text: 'Heart Rate (bpm)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 80,
        max: 180,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Blood Pressure (mmHg)'
        }
      },
      y2: {
        type: 'linear',
        display: false,
        min: 85,
        max: 100
      }
    }
  };

  // Helper functions for UI
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      case 'stable': return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const getVitalStatus = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'elevated':
      case 'high': return 'text-yellow-600';
      case 'low':
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <RoleLayout>
      {loading && !refreshing ? (
        <div className="flex items-center justify-center h-screen">
          <Loading text="Loading health reports..." size="large" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6 p-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <FileText className="w-8 h-8 mr-3" />
                  Family Health Reports
                </h1>
                <p className="text-red-100 text-lg">Monitor your elders' health status and trends</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-red-600">
                {selectedElder === 'all' ? elders.length : 1}
              </div>
              <div className="text-red-500 font-medium">Monitored Elders</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-green-600">
                {healthData.reduce((sum, { records }) => sum + records.filter(r => r.alertLevel === 'normal').length, 0)}
              </div>
              <div className="text-green-500 font-medium">Normal Readings</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {healthData.reduce((sum, { records }) => sum + records.filter(r => r.alertLevel === 'warning').length, 0)}
              </div>
              <div className="text-yellow-500 font-medium">Warnings</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-rose-600">
                {healthData.reduce((sum, { records }) => sum + records.filter(r => r.alertLevel === 'critical' || r.alertLevel === 'high').length, 0)}
              </div>
              <div className="text-rose-500 font-medium">Critical Alerts</div>
            </div>
          </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter reports:</span>
              <select 
                value={selectedElder}
                onChange={(e) => {
                  console.log('Elder selected:', e.target.value);
                  setSelectedElder(e.target.value);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Elders ({elders.length})</option>
                {elders.map(elder => (
                  <option key={elder.id} value={elder.id}>
                    {elder.name || elder.firstName + ' ' + elder.lastName || 'Unnamed Elder'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Period:</span>
              {['day', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                    selectedPeriod === period
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vitals Charts & Statistics */}
        {healthData.length > 0 ? (
          <div className="space-y-6">
            {healthData.map(({ elder, records }, idx) => {
              console.log(`Rendering elder ${idx}:`, elder, 'Records:', records?.length || 0);
              const stats = vitalStats[elder?.id];
              const chart = chartData[elder?.id];
              
              console.log(`Elder ${elder?.id} - Stats:`, stats, 'Chart:', chart ? 'exists' : 'missing', 'Records:', records);
              
              if (!records || records.length === 0) {
                console.log(`Skipping elder ${elder?.id || idx} - no records or empty array`);
                return (
                  <div key={elder?.id || idx} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-800">
                      Elder {elder?.name || elder?.firstName ||'Unknown'} has no health records
                    </p>
                  </div>
                );
              }

              return (
                <div key={elder.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  {/* Elder Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {elder.name || `${elder.firstName} ${elder.lastName}` || 'Unnamed Elder'}
                        </h3>
                        <p className="text-gray-500 text-sm">{records.length} health records</p>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Statistics Cards */}
                  {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      {/* Heart Rate */}
                      {stats.heartRate && (
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Heart className="w-6 h-6 text-red-600" />
                            {getTrendIcon(stats.heartRate.trend)}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">Heart Rate</div>
                          <div className={`text-2xl font-bold ${getVitalStatus(stats.heartRate.status)}`}>
                            {stats.heartRate.average} bpm
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {stats.heartRate.min} - {stats.heartRate.max} bpm
                          </div>
                        </div>
                      )}

                      {/* Blood Pressure */}
                      {stats.bloodPressure && (
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Activity className="w-6 h-6 text-pink-600" />
                            {getTrendIcon(stats.bloodPressure.trend)}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">Blood Pressure</div>
                          <div className={`text-2xl font-bold ${getVitalStatus(stats.bloodPressure.status)}`}>
                            {stats.bloodPressure.average}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {stats.bloodPressure.min} - {stats.bloodPressure.max} mmHg
                          </div>
                        </div>
                      )}

                      {/* Oxygen Saturation */}
                      {stats.oxygenSaturation && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Droplets className="w-6 h-6 text-blue-600" />
                            {getTrendIcon(stats.oxygenSaturation.trend)}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">Oxygen Sat</div>
                          <div className={`text-2xl font-bold ${getVitalStatus(stats.oxygenSaturation.status)}`}>
                            {stats.oxygenSaturation.average}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {stats.oxygenSaturation.min} - {stats.oxygenSaturation.max}%
                          </div>
                        </div>
                      )}

                      {/* Temperature */}
                      {stats.temperature && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <ThermometerSun className="w-6 h-6 text-orange-600" />
                            {getTrendIcon(stats.temperature.trend)}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">Temperature</div>
                          <div className={`text-2xl font-bold ${getVitalStatus(stats.temperature.status)}`}>
                            {stats.temperature.average}°F
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {stats.temperature.min} - {stats.temperature.max}°F
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vitals Trend Chart */}
                  {chart && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                        Vitals Trend (Last 7 Days)
                      </h4>
                      <div className="h-80">
                        <Line data={chart} options={chartOptions} />
                      </div>
                    </div>
                  )}

                  {/* Latest Notes */}
                  {records[records.length - 1]?.notes && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-900">Latest Notes</div>
                          <div className="text-sm text-yellow-700 mt-1">
                            {records[records.length - 1].notes}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Data Available</h3>
            <p className="text-gray-500">
              {selectedElder === 'all' 
                ? 'No health monitoring data found for your assigned elders.'
                : 'No health monitoring data found for the selected elder.'}
            </p>
          </div>
        )}
      </div>
      )}
    </RoleLayout>
  );
};

export default FamilyHealthReports;