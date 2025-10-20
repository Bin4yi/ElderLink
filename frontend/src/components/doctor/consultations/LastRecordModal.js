// src/components/doctor/consultations/LastRecordModal.js
import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Clock, User, Activity, Loader, AlertCircle, Heart, Droplet, Thermometer, Wind } from 'lucide-react';
import toast from 'react-hot-toast';
import { consultationService } from '../../../services/consultation';

const LastRecordModal = ({ isOpen, onClose, elderId, elderName }) => {
  const [loading, setLoading] = useState(false);
  const [lastConsultation, setLastConsultation] = useState(null);
  const [latestVitals, setLatestVitals] = useState(null);

  useEffect(() => {
    if (isOpen && elderId) {
      loadLastRecords();
    }
  }, [isOpen, elderId]);

  const loadLastRecords = async () => {
    try {
      setLoading(true);
      const response = await consultationService.getElderLastRecordWithVitals(elderId);
      
      if (response.success) {
        setLastConsultation(response.data.lastConsultation);
        setLatestVitals(response.data.latestVitals);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Last Consultation Records</h2>
                <p className="text-blue-100">Patient: {elderName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading records...</p>
            </div>
          ) : !lastConsultation ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No previous records found</p>
              <p className="text-sm text-gray-500 mt-1">This will be the first consultation for this patient</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Last Consultation Record */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Last Consultation</h3>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">
                          {new Date(lastConsultation.sessionDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      {lastConsultation.doctor && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <User className="w-4 h-4" />
                          <span>
                            Dr. {lastConsultation.doctor.user?.firstName} {lastConsultation.doctor.user?.lastName}
                            {lastConsultation.doctor.specialization && ` - ${lastConsultation.doctor.specialization}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                    {lastConsultation.appointment?.type || 'Consultation'}
                  </span>
                </div>

                <div className="space-y-3">
                  {lastConsultation.symptoms && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Symptoms</p>
                      <p className="text-gray-900">{lastConsultation.symptoms}</p>
                    </div>
                  )}
                  
                  {lastConsultation.diagnosis && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Diagnosis</p>
                      <p className="text-gray-900">{lastConsultation.diagnosis}</p>
                    </div>
                  )}

                  {lastConsultation.treatment && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Treatment</p>
                      <p className="text-gray-900">{lastConsultation.treatment}</p>
                    </div>
                  )}

                  {lastConsultation.recommendations && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Recommendations</p>
                      <p className="text-gray-900">{lastConsultation.recommendations}</p>
                    </div>
                  )}

                  {lastConsultation.sessionSummary && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Session Summary</p>
                      <p className="text-gray-900">{lastConsultation.sessionSummary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Latest Vitals */}
              {latestVitals && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Latest Vital Signs</h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(latestVitals.monitoringDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {latestVitals.heartRate && (
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          <p className="text-sm font-bold text-gray-700">Heart Rate</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{latestVitals.heartRate}</p>
                        <p className="text-xs text-gray-500">bpm</p>
                      </div>
                    )}

                    {latestVitals.bloodPressure && (
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="w-5 h-5 text-blue-500" />
                          <p className="text-sm font-bold text-gray-700">Blood Pressure</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{latestVitals.bloodPressure}</p>
                        <p className="text-xs text-gray-500">mmHg</p>
                      </div>
                    )}

                    {latestVitals.temperature && (
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-5 h-5 text-orange-500" />
                          <p className="text-sm font-bold text-gray-700">Temperature</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{latestVitals.temperature}</p>
                        <p className="text-xs text-gray-500">°F</p>
                      </div>
                    )}

                    {latestVitals.respiratoryRate && (
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-5 h-5 text-cyan-500" />
                          <p className="text-sm font-bold text-gray-700">Respiratory Rate</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{latestVitals.respiratoryRate}</p>
                        <p className="text-xs text-gray-500">breaths/min</p>
                      </div>
                    )}

                    {latestVitals.oxygenSaturation && (
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-purple-500" />
                          <p className="text-sm font-bold text-gray-700">Oxygen Saturation</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{latestVitals.oxygenSaturation}</p>
                        <p className="text-xs text-gray-500">%</p>
                      </div>
                    )}

                    {latestVitals.bloodSugar && (
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="w-5 h-5 text-pink-500" />
                          <p className="text-sm font-bold text-gray-700">Blood Sugar</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{latestVitals.bloodSugar}</p>
                        <p className="text-xs text-gray-500">mg/dL</p>
                      </div>
                    )}
                  </div>

                  {latestVitals.notes && (
                    <div className="bg-white rounded-lg p-4 mt-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Monitoring Notes</p>
                      <p className="text-gray-900">{latestVitals.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LastRecordModal;
