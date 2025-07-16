// src/components/staff/care/CareManagement.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { FileText, CheckCircle2, ClipboardList, User, Calendar, Clock, AlertCircle, Heart, Activity, Thermometer } from 'lucide-react';
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
      
      const response = await elderService.getAllEldersForStaff();
      
      if (response && Array.isArray(response.elders)) {
        setElders(response.elders);
        if (response.elders.length > 0) {
          setSelectedElder(response.elders[0]);
        }
      } else {
        setElders([]);
        setError('No elders data received');
      }
    } catch (error) {
      console.error('Failed to load elders:', error);
      setError('Failed to load elders');
      setElders([]);
      toast.error('Failed to load elders');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthHistory = async (elderId) => {
    try {
      setLoadingHealth(true);
      
      const response = await healthMonitoringService.getElderHealthHistory(elderId, 7);
      
      if (response && response.data && Array.isArray(response.data)) {
        setHealthHistory(response.data);
      } else {
        setHealthHistory([]);
      }
    } catch (error) {
      console.error('Failed to load health history:', error);
      setHealthHistory([]);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleElderSelect = (elder) => {
    setSelectedElder(elder);
    setHealthHistory([]);
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Care Management</h1>
            <p className="text-gray-600">
              Manage care plans and monitor elder wellbeing
            </p>
          </div>

          {/* Check if we have elders */}
          {!elders || elders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Elders Available</h3>
                <p className="text-gray-500 mb-4">
                  There are no elders in the system to manage care for.
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Elder List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Elders ({elders.length})</h2>
                  <div className="space-y-3">
                    {elders.map((elder) => {
                      const age = calculateAge(elder.dateOfBirth);
                      return (
                        <div
                          key={elder.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
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
                                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/elders/${elder.photo}`}
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
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          {selectedElder.photo ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/elders/${selectedElder.photo}`}
                              alt={`${selectedElder.firstName} ${selectedElder.lastName}`}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {selectedElder.firstName} {selectedElder.lastName}
                          </h2>
                          <p className="text-gray-600">
                            {selectedElder.dateOfBirth ? (
                              <>
                                Born: {new Date(selectedElder.dateOfBirth).toLocaleDateString()}
                                {calculateAge(selectedElder.dateOfBirth) && (
                                  <span className="ml-2 text-sm">
                                    (Age: {calculateAge(selectedElder.dateOfBirth)})
                                  </span>
                                )}
                              </>
                            ) : (
                              'Date of birth not available'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
                          <p className="text-sm text-gray-600">
                            <strong>Phone:</strong> {selectedElder.phone || 'Not provided'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Address:</strong> {selectedElder.address || 'Not provided'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Emergency Contact:</strong> {selectedElder.emergencyContact || 'Not provided'}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">Medical Information</h3>
                          <p className="text-sm text-gray-600">
                            <strong>Medications:</strong> {selectedElder.currentMedications || 'None listed'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Allergies:</strong> {selectedElder.allergies || 'None listed'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Conditions:</strong> {selectedElder.chronicConditions || 'None listed'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Health Monitoring Activities */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Recent Health Monitoring</h3>
                        <span className="text-sm text-gray-500">Last 7 days</span>
                      </div>
                      
                      {loadingHealth ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : healthHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No recent health monitoring records</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {healthHistory.map((monitoring) => (
                            <div
                              key={monitoring.id}
                              className={`p-4 rounded-lg border ${getStatusColor(monitoring.status)}`}
                            >
                              <div className="flex items-start gap-3">
                                {getVitalIcon('heartRate')}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium">
                                      Health Monitoring - {monitoring.status}
                                    </p>
                                    <span className={`text-xs font-medium ${getAlertLevelColor(monitoring.alertLevel)}`}>
                                      {monitoring.alertLevel?.toUpperCase()}
                                    </span>
                                  </div>
                                  
                                  <p className="text-xs text-gray-600 mb-2">
                                    {new Date(monitoring.monitoringDate).toLocaleDateString()} at{' '}
                                    {new Date(monitoring.monitoringDate).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  
                                  <div className="text-xs text-gray-700 space-y-1">
                                    <p><strong>Vitals:</strong> {formatVitals(monitoring)}</p>
                                    {monitoring.notes && (
                                      <p><strong>Notes:</strong> {monitoring.notes}</p>
                                    )}
                                    {monitoring.staff && (
                                      <p><strong>Staff:</strong> {monitoring.staff.firstName} {monitoring.staff.lastName}</p>
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
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an Elder</h3>
                      <p className="text-gray-500">
                        Choose an elder from the list to view their care management details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default CareManagement;
