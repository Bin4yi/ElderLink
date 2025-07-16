import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Weight, 
  Moon, 
  User, 
  Calendar, 
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import { healthMonitoringService } from '../../../services/healthMonitoring';
import { elderService } from '../../../services/elder';
import toast from 'react-hot-toast';

const statusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 border-green-200';
    case 'in-progress':
      return 'bg-yellow-50 border-yellow-200';
    case 'scheduled':
      return 'bg-blue-50 border-blue-200';
    case 'missed':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const alertColor = (alertLevel) => {
  switch (alertLevel) {
    case 'critical':
      return 'text-red-600 bg-red-100';
    case 'warning':
      return 'text-orange-600 bg-orange-100';
    case 'normal':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const HealthMonitoring = () => {
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [elders, setElders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    elderId: '',
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: '',
    weight: '',
    sleepHours: '',
    oxygenSaturation: '',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scheduleData, eldersData] = await Promise.all([
        healthMonitoringService.getTodaysSchedule(),
        elderService.getAllEldersForStaff() // ✅ CHANGED: Use staff-specific method
      ]);
      
      console.log('📊 Health monitoring data loaded:', {
        scheduleCount: scheduleData.data?.schedule?.length || 0,
        eldersCount: eldersData.elders?.length || 0
      });
      
      setTodaySchedule(scheduleData.data.schedule || []);
      setElders(eldersData.elders || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load health monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await healthMonitoringService.updateHealthMonitoring(editingRecord.id, formData);
        toast.success('Health monitoring record updated successfully');
      } else {
        await healthMonitoringService.createHealthMonitoring(formData);
        toast.success('Health monitoring record created successfully');
      }
      
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving health monitoring record:', error);
      toast.error('Failed to save health monitoring record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      elderId: record.elderId,
      heartRate: record.heartRate || '',
      bloodPressureSystolic: record.bloodPressureSystolic || '',
      bloodPressureDiastolic: record.bloodPressureDiastolic || '',
      temperature: record.temperature || '',
      weight: record.weight || '',
      sleepHours: record.sleepHours || '',
      oxygenSaturation: record.oxygenSaturation || '',
      notes: record.notes || '',
      status: record.status
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this health monitoring record?')) {
      try {
        await healthMonitoringService.deleteHealthMonitoring(id);
        toast.success('Health monitoring record deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting health monitoring record:', error);
        toast.error('Failed to delete health monitoring record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      elderId: '',
      heartRate: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      temperature: '',
      weight: '',
      sleepHours: '',
      oxygenSaturation: '',
      notes: '',
      status: 'scheduled'
    });
    setEditingRecord(null);
    setShowCreateForm(false);
  };

  const formatBloodPressure = (systolic, diastolic) => {
    if (systolic && diastolic) {
      return `${systolic}/${diastolic}`;
    }
    return systolic || diastolic || '--';
  };

  if (loading) {
    return (
      <RoleLayout title="Health Monitoring">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Health Monitoring">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Health Monitoring</h1>
                <p className="text-gray-600 mt-2">
                  Monitor vital signs and health metrics for elderly residents
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Monitoring
              </button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingRecord ? 'Edit Health Monitoring' : 'Create Health Monitoring'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elder
                    </label>
                    <select
                      name="elderId"
                      value={formData.elderId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select an elder</option>
                      {elders.map(elder => (
                        <option key={elder.id} value={elder.id}>
                          {elder.firstName} {elder.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="missed">Missed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      name="heartRate"
                      value={formData.heartRate}
                      onChange={handleInputChange}
                      min="40"
                      max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="72"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="bloodPressureSystolic"
                        value={formData.bloodPressureSystolic}
                        onChange={handleInputChange}
                        min="70"
                        max="250"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="120"
                      />
                      <span className="px-2 py-2 text-gray-500">/</span>
                      <input
                        type="number"
                        name="bloodPressureDiastolic"
                        value={formData.bloodPressureDiastolic}
                        onChange={handleInputChange}
                        min="40"
                        max="150"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="80"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°F)
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      min="95"
                      max="110"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="98.6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="50"
                      max="500"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="165"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Hours
                    </label>
                    <input
                      type="number"
                      name="sleepHours"
                      value={formData.sleepHours}
                      onChange={handleInputChange}
                      min="0"
                      max="24"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="7.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Oxygen Saturation (%)
                    </label>
                    <input
                      type="number"
                      name="oxygenSaturation"
                      value={formData.oxygenSaturation}
                      onChange={handleInputChange}
                      min="70"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="98"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about the monitoring session..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingRecord ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Health Monitoring Schedule</h2>
            
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No health monitoring scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySchedule.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 border rounded-lg ${statusColor(record.status)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {record.elder?.photo ? (
                              <img
                                src={`${process.env.REACT_APP_API_URL}/uploads/elders/${record.elder.photo}`}
                                alt={`${record.elder.firstName} ${record.elder.lastName}`}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {record.elder?.firstName} {record.elder?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(record.monitoringDate).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Vitals Display */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {record.heartRate && (
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span className="text-sm">
                                <strong>HR:</strong> {record.heartRate} bpm
                              </span>
                            </div>
                          )}
                          {(record.bloodPressureSystolic || record.bloodPressureDiastolic) && (
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">
                                <strong>BP:</strong> {formatBloodPressure(record.bloodPressureSystolic, record.bloodPressureDiastolic)}
                              </span>
                            </div>
                          )}
                          {record.temperature && (
                            <div className="flex items-center gap-2">
                              <Thermometer className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">
                                <strong>Temp:</strong> {record.temperature}°F
                              </span>
                            </div>
                          )}
                          {record.sleepHours && (
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4 text-purple-500" />
                              <span className="text-sm">
                                <strong>Sleep:</strong> {record.sleepHours}h
                              </span>
                            </div>
                          )}
                        </div>

                        {record.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">{record.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${alertColor(record.alertLevel)}`}>
                            {record.alertLevel}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed' ? 'bg-green-100 text-green-800' :
                            record.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'missed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default HealthMonitoring;
