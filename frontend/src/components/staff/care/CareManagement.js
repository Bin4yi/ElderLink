// src/components/staff/care/CareManagement.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { FileText, CheckCircle2, ClipboardList, User, Calendar, Clock, AlertCircle, Heart, Activity, Thermometer, Shield, Phone, MapPin, AlertTriangle, Pill } from 'lucide-react';
import { elderService } from '../../../services/elder';
import { healthMonitoringService } from '../../../services/healthMonitoring';
import toast from 'react-hot-toast';

const CareManagement = () => {
  const [elders, setElders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElder, setSelectedElder] = useState(null);
  const [error, setError] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Add this function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    loadElders();
  }, []);

  useEffect(() => {
    if (selectedElder) {
      loadHealthHistory(selectedElder.id);
    }
  }, [selectedElder]);

  const loadElders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading assigned elders for staff...');
      const response = await elderService.getAllEldersForStaff();
      
      console.log('📊 Response received:', response);
      console.log('📊 Response.success:', response?.success);
      console.log('📊 Response.elders:', response?.elders);
      console.log('📊 Is elders array?:', Array.isArray(response?.elders));
      
      if (response && response.success) {
        const eldersList = response.elders || [];
        console.log('✅ EldersList:', eldersList);
        console.log('✅ EldersList length:', eldersList.length);
        
        setElders(eldersList);
        if (eldersList.length > 0) {
          setSelectedElder(eldersList[0]);
          console.log('✅ Selected first elder:', eldersList[0]);
        }
        
        console.log('✅ Loaded', eldersList.length, 'assigned elders');
        
        if (eldersList.length === 0) {
          toast.info('No elders are currently assigned to you');
        }
      } else {
        console.log('⚠️ Response not successful or invalid');
        setElders([]);
        setError('No assigned elders found');
        toast.info('No elders are currently assigned to you');
      }
    } catch (error) {
      console.error('❌ Failed to load assigned elders:', error);
      console.error('❌ Error response:', error.response);
      setError('Failed to load assigned elders');
      setElders([]);
      
      if (error.response?.status === 403) {
        toast.error('You can only view elders assigned to you');
      } else {
        toast.error('Failed to load assigned elders');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHealthHistory = async (elderId) => {
    try {
      setLoadingHealth(true);
      
      console.log('🔍 Loading health history for elder:', elderId);
      const response = await healthMonitoringService.getElderHealthHistory(elderId, 7);
      
      console.log('📊 Health history response:', response);
      
      if (response && response.success && response.data && Array.isArray(response.data)) {
        setHealthHistory(response.data);
        console.log('✅ Loaded', response.data.length, 'health records');
      } else {
        setHealthHistory([]);
        console.log('ℹ️ No health history found');
      }
    } catch (error) {
      console.error('❌ Failed to load health history:', error);
      setHealthHistory([]);
      
      if (error.response?.status === 403) {
        toast.error('You can only access health records for elders assigned to you');
      } else {
        toast.error('Failed to load health history');
      }
    } finally {
      setLoadingHealth(false);
    }
  };

  // ✅ Fixed: Don't clear health history, let useEffect handle the loading
  const handleElderSelect = (elder) => {
    setSelectedElder(elder);
    // ✅ Removed: setHealthHistory([]); - This was causing the issue
  };

  const getVitalIcon = (type) => {
    switch (type) {
      case 'heartRate':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'bloodPressure':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'temperature':
        return <Thermometer className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'in-progress':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'missed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertLevelColor = (alertLevel) => {
    switch (alertLevel) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatVitals = (monitoring) => {
    const vitals = [];
    
    if (monitoring.heartRate) {
      vitals.push(`HR: ${monitoring.heartRate} bpm`);
    }
    if (monitoring.bloodPressureSystolic && monitoring.bloodPressureDiastolic) {
      vitals.push(`BP: ${monitoring.bloodPressureSystolic}/${monitoring.bloodPressureDiastolic} mmHg`);
    }
    if (monitoring.temperature) {
      vitals.push(`Temp: ${monitoring.temperature}°F`);
    }
    if (monitoring.oxygenSaturation) {
      vitals.push(`SpO2: ${monitoring.oxygenSaturation}%`);
    }
    
    return vitals.length > 0 ? vitals.join(', ') : 'No vitals recorded';
  };

  if (loading) {
    return (
      <RoleLayout title="Care Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </RoleLayout>
    );
  }

  if (error) {
    return (
      <RoleLayout title="Care Management">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadElders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Care Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Care Management</h1>
                <p className="text-gray-600">
                  Manage care plans and monitor wellbeing for your assigned elders
                </p>
              </div>
            </div>
            
            {/* Status Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  You have {elders.length} elder{elders.length !== 1 ? 's' : ''} assigned to you
                </span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                You can only view and manage health records for elders assigned to you.
              </p>
            </div>
          </div>

          {/* Check if we have elders */}
          {!elders || elders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Assigned Elders</h3>
                <p className="text-gray-500 mb-4">
                  You don't have any elders assigned to you yet. Please contact your administrator to get elder assignments.
                </p>
                <button
                  onClick={loadElders}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Elder List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Your Assigned Elders ({elders.length})
                  </h2>
                  <div className="space-y-3">
                    {elders.map((elder) => {
                      const age = calculateAge(elder.dateOfBirth);
                      return (
                        <div
                          key={elder.id}
                          className={`p-4 rounded-lg border cursor-pointer ${
                            selectedElder?.id === elder.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleElderSelect(elder)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {elder.photo ? (
                                <img
                                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/uploads/elders/${elder.photo}`}
                                  alt={`${elder.firstName} ${elder.lastName}`}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">
                                {elder.firstName} {elder.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {age ? `${age} years old` : 'Age not available'}
                              </p>
                              {elder.assignedDate && (
                                <p className="text-xs text-blue-600">
                                  Assigned: {new Date(elder.assignedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Elder Details */}
              <div className="lg:col-span-2">
                {selectedElder ? (
                  <div className="space-y-6">
                    {/* Elder Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-gray-100 shadow-lg p-6">
                      {/* Header Section */}
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                          {selectedElder.photo ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/uploads/elders/${selectedElder.photo}`}
                              alt={`${selectedElder.firstName} ${selectedElder.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedElder.firstName} {selectedElder.lastName}
                          </h2>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <p className="text-sm">
                              {selectedElder.dateOfBirth ? (
                                <>
                                  Born: {new Date(selectedElder.dateOfBirth).toLocaleDateString()}
                                  {calculateAge(selectedElder.dateOfBirth) && (
                                    <span className="ml-2 font-semibold text-blue-600">
                                      ({calculateAge(selectedElder.dateOfBirth)} years)
                                    </span>
                                  )}
                                </>
                              ) : (
                                'Date of birth not available'
                              )}
                            </p>
                          </div>
                          {selectedElder.assignedDate && (
                            <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              <Shield className="w-3 h-3" />
                              Assigned: {new Date(selectedElder.assignedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact & Medical Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contact Information */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Phone className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900">Contact Information</h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                              <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <div className="text-sm">
                                <div className="text-gray-500 text-xs">Phone</div>
                                <div className="font-semibold text-gray-900">{selectedElder.phone || 'Not provided'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                              <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <div className="text-sm">
                                <div className="text-gray-500 text-xs">Address</div>
                                <div className="font-semibold text-gray-900">{selectedElder.address || 'Not provided'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <div className="text-sm">
                                <div className="text-gray-500 text-xs">Emergency Contact</div>
                                <div className="font-semibold text-gray-900">{selectedElder.emergencyContact || 'Not provided'}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Medical Information */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <Heart className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900">Medical Information</h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg">
                              <Pill className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                              <div className="text-sm flex-1">
                                <div className="text-gray-500 text-xs">Medications</div>
                                <div className="font-semibold text-gray-900">{selectedElder.currentMedications || selectedElder.medications || 'None listed'}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg">
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                              <div className="text-sm flex-1">
                                <div className="text-gray-500 text-xs">Allergies</div>
                                <div className="font-semibold text-gray-900">{selectedElder.allergies || 'None listed'}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg">
                              <Activity className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <div className="text-sm flex-1">
                                <div className="text-gray-500 text-xs">Conditions</div>
                                <div className="font-semibold text-gray-900">{selectedElder.chronicConditions || selectedElder.medicalConditions || 'None listed'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an Elder</h3>
                      <p className="text-gray-500">
                        Choose an elder from your assigned list to view their care management details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Health Monitoring - Full Width Below */}
            {selectedElder && (
              <div className="mt-6">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Health Monitoring</h3>
                      <p className="text-xs text-gray-500">Last 7 days</p>
                    </div>
                  </div>
                  
                  {loadingHealth ? (
                    <div className="flex justify-center items-center h-40 py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 shadow-lg"></div>
                    </div>
                  ) : healthHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No recent health monitoring records for this elder</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Health records will appear here once monitoring sessions are completed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {healthHistory.map((monitoring) => (
                        <div
                          key={monitoring.id}
                          className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-gray-200"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Heart className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-base font-bold text-gray-900">
                                  Health Monitoring
                                </p>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                                  monitoring.alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                  monitoring.alertLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                  monitoring.alertLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {monitoring.alertLevel?.toUpperCase() || 'NORMAL'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-3 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <p className="text-sm font-medium">
                                  {new Date(monitoring.monitoringDate).toLocaleDateString()} at{' '}
                                  {new Date(monitoring.monitoringDate).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              
                              <div className="bg-white rounded-lg p-3 border border-blue-100 space-y-2">
                                <p className="text-sm text-gray-700">
                                  <span className="font-bold text-blue-700">Vitals:</span> {formatVitals(monitoring)}
                                </p>
                                {monitoring.notes && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-bold text-blue-700">Notes:</span> {monitoring.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default CareManagement;
