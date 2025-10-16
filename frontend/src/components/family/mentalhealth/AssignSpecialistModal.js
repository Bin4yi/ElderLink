// frontend/src/components/family/mentalhealth/AssignSpecialistModal.js
import React, { useState } from 'react';
import { X, User, Star, Award, Clock, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import mentalHealthService from '../../../services/mentalHealthService';

const AssignSpecialistModal = ({ elder, availableSpecialists, onSuccess, onClose }) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [sessionFee, setSessionFee] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSpecialist) {
      toast.error('Please select a mental health specialist');
      return;
    }

    try {
      setLoading(true);
      
      await mentalHealthService.createAssignment({
        elderId: elder.id,
        specialistId: selectedSpecialist.id,
        sessionFee: sessionFee ? parseFloat(sessionFee) : null,
        priority,
        notes,
      });

      toast.success('Mental health specialist assigned successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to assign specialist:', error);
      toast.error(error.response?.data?.message || 'Failed to assign specialist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Assign Mental Health Specialist</h2>
            <p className="text-purple-100">
              For: {elder.firstName} {elder.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Available Specialists */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Available Mental Health Specialists
            </h3>
            
            {availableSpecialists.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No specialists available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSpecialists.map((specialist) => (
                  <div
                    key={specialist.id}
                    onClick={() => setSelectedSpecialist(specialist)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSpecialist?.id === specialist.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {specialist.firstName} {specialist.lastName}
                        </h4>
                        {specialist.specialization && (
                          <p className="text-sm text-purple-600 font-medium truncate">
                            {specialist.specialization}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          {specialist.experience && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{specialist.experience} years</span>
                            </div>
                          )}
                          {specialist.licenseNumber && (
                            <div className="flex items-center">
                              <Award className="w-3 h-3 mr-1" />
                              <span>Licensed</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <div>{specialist.email}</div>
                          {specialist.phone && <div>{specialist.phone}</div>}
                        </div>
                      </div>
                      {selectedSpecialist?.id === specialist.id && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Details Form */}
          {selectedSpecialist && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Assignment Details</h3>
              
              {/* Session Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Session Fee (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sessionFee}
                  onChange={(e) => setSessionFee(e.target.value)}
                  placeholder="Enter session fee"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special notes or requirements..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedSpecialist || loading}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : 'Assign Specialist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSpecialistModal;
