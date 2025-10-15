import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Scale, // Changed from Weight to Scale
  Moon, 
  User, 
  Calendar, 
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText
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
  const [todayRecords, setTodayRecords] = useState([]);
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
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, eldersData] = await Promise.all([
        healthMonitoringService.getAllHealthMonitoring(), // Changed from getTodaysSchedule
        elderService.getAllEldersForStaff()
      ]);
      
      console.log('📊 Health monitoring data loaded:', {
        recordsCount: recordsData.data?.healthMonitoring?.length || 0,
        eldersCount: eldersData.elders?.length || 0
      });
      
      // Filter today's records on the frontend
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const allRecords = recordsData.data?.healthMonitoring || [];
      const todaysRecords = allRecords.filter(record => {
        const recordDate = new Date(record.monitoringDate);
        return recordDate >= todayStart && recordDate < todayEnd;
      });
      
      setTodayRecords(todaysRecords);
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
      notes: record.notes || ''
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
      notes: ''
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
                Add Health Record
              </button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingRecord ? 'Edit Health Record' : 'Create Health Record'}
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
                    <p className="text-xs text-gray-500 mt-1">Valid range: 95.0 - 110.0°F</p>
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
                    <p className="text-xs text-gray-500 mt-1">Valid range: 50.0 - 500.0 lbs</p>
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
                    placeholder="Additional notes about the health record..."
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

          {/* Today's Health Records */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Today's Health Records for Elders</h2>
            </div>
            
            {todayRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No health records found for today</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Health Record" to create the first record
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Showing {todayRecords.length} health record{todayRecords.length !== 1 ? 's' : ''} for today
                </div>
                
                {todayRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {record.elder?.photo ? (
                              <img
                                src={`${process.env.REACT_APP_API_URL}/uploads/elders/${record.elder.photo}`}
                                alt={`${record.elder.firstName} ${record.elder.lastName}`}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                              {record.elder?.firstName} {record.elder?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Recorded: {new Date(record.monitoringDate).toLocaleString()}
                            </p>
                            {record.staff && (
                              <p className="text-xs text-gray-500">
                                By: {record.staff.firstName} {record.staff.lastName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Health Metrics Display */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <h4 className="font-medium text-gray-800 mb-3">Health Metrics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {record.heartRate && (
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="font-medium">{record.heartRate}</div>
                                  <div className="text-gray-500">bpm</div>
                                </div>
                              </div>
                            )}
                            
                            {(record.bloodPressureSystolic || record.bloodPressureDiastolic) && (
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {formatBloodPressure(record.bloodPressureSystolic, record.bloodPressureDiastolic)}
                                  </div>
                                  <div className="text-gray-500">mmHg</div>
                                </div>
                              </div>
                            )}
                            
                            {record.temperature && (
                              <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="font-medium">{record.temperature}</div>
                                  <div className="text-gray-500">°F</div>
                                </div>
                              </div>
                            )}
                            
                            {record.weight && (
                              <div className="flex items-center gap-2">
                                <Scale className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="font-medium">{record.weight}</div>
                                  <div className="text-gray-500">lbs</div>
                                </div>
                              </div>
                            )}
                            
                            {record.sleepHours && (
                              <div className="flex items-center gap-2">
                                <Moon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="font-medium">{record.sleepHours}</div>
                                  <div className="text-gray-500">hours</div>
                                </div>
                              </div>
                            )}
                            
                            {record.oxygenSaturation && (
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="font-medium">{record.oxygenSaturation}</div>
                                  <div className="text-gray-500">%</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {record.notes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <h5 className="font-medium text-sm text-gray-700 mb-1">Notes:</h5>
                            <p className="text-sm text-gray-600">{record.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${alertColor(record.alertLevel)}`}>
                          {record.alertLevel.charAt(0).toUpperCase() + record.alertLevel.slice(1)}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete record"
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
