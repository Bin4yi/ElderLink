// frontend/src/components/family/doctors/AssignDoctorModal.js
import React, { useState } from 'react';
import { X, User, Phone, Mail, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorAssignmentService } from '../../../services/doctorAssignment';

const AssignDoctorModal = ({ elder, availableDoctors, onSuccess, onClose }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [assignmentType, setAssignmentType] = useState('primary');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredDoctors = availableDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    setLoading(true);
    try {
      await doctorAssignmentService.assignDoctor({
        elderId: elder.id,
        doctorId: selectedDoctor.id,
        assignmentType,
        notes
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to assign doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to assign doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Assign Doctor to {elder.firstName} {elder.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Type
            </label>
            <select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="primary">Primary Doctor</option>
              <option value="secondary">Secondary Doctor</option>
              <option value="specialist">Specialist</option>
            </select>
          </div>

          {/* Doctor Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Doctors
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Doctor
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {doctor.experience} years exp.
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {doctor.phone || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {doctor.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Add any notes about this assignment..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDoctor}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Assigning...' : 'Assign Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDoctorModal;