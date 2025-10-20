// src/components/doctor/consultations/LastRecordModal.js
import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Clock, User, Activity, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LastRecordModal = ({ isOpen, onClose, elderId, elderName }) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (isOpen && elderId) {
      loadLastRecords();
    }
  }, [isOpen, elderId]);

  const loadLastRecords = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await consultationService.getElderRecords(elderId);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecords([
        {
          id: 1,
          date: '2025-10-15',
          time: '10:00 AM',
          type: 'Consultation',
          diagnosis: 'Routine checkup - All vitals normal',
          prescription: 'Vitamin D supplement, 1000 IU daily',
          notes: 'Patient is doing well. Continue current medication.'
        },
        {
          id: 2,
          date: '2025-09-20',
          time: '02:30 PM',
          type: 'Follow-up',
          diagnosis: 'Blood pressure slightly elevated',
          prescription: 'Amlodipine 5mg once daily',
          notes: 'Monitor blood pressure daily. Return in 2 weeks.'
        }
      ]);
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
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No previous records found</p>
              <p className="text-sm text-gray-500 mt-1">This will be the first consultation for this patient</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record, index) => (
                <div
                  key={record.id}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span className="font-semibold">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 text-sm mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{record.time}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                      {record.type}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Diagnosis</p>
                      <p className="text-gray-900">{record.diagnosis}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Prescription</p>
                      <p className="text-gray-900">{record.prescription}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-bold text-gray-700 uppercase mb-1">Doctor's Notes</p>
                      <p className="text-gray-900">{record.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
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
