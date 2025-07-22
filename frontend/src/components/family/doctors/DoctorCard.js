// frontend/src/components/family/doctors/DoctorCard.js
import React from 'react';
import { User, Phone, Mail, Calendar, AlertCircle, X } from 'lucide-react';

const DoctorCard = ({ assignment, onTerminate }) => {
  // Use doctor info from assignment.doctor
  const doctor = assignment.doctor || {};
  const {
    firstName = '',
    lastName = '',
    email = '',
    phone = '',
    specialization = '',
    experience = ''
  } = doctor;

  const doctorName = `${firstName} ${lastName}`;
  const doctorEmail = email;
  const doctorPhone = phone;
  const doctorSpecialization = specialization;

  const { assignmentType, assignmentDate, status } = assignment;

  const getAssignmentTypeColor = (type) => {
    switch (type) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'secondary':
        return 'bg-green-100 text-green-800';
      case 'specialist':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{doctorName}</h4>
            <p className="text-sm text-gray-600">{doctorSpecialization}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAssignmentTypeColor(assignmentType)}`}>
                {assignmentType.charAt(0).toUpperCase() + assignmentType.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {status === 'active' && (
            <button
              onClick={() => onTerminate(assignment.id)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
              title="Terminate Assignment"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Assigned: {new Date(assignmentDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{doctorPhone || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{doctorEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;