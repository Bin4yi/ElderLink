// frontend/src/components/family/mentalHealth/MentalHealthCard.js
import React from 'react';
import { Brain, Phone, Mail, Calendar, Clock, MapPin, X, Star } from 'lucide-react';

const MentalHealthCard = ({ assignment, onTerminate }) => {
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getAssignmentTypeBadge = (type) => {
    const styles = {
      primary: 'bg-purple-100 text-purple-800',
      secondary: 'bg-blue-100 text-blue-800',
      specialist: 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)} Priority
      </span>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-800">
              {assignment.consultant?.user?.firstName} {assignment.consultant?.user?.lastName}
            </h4>
            <p className="text-purple-600 font-semibold">
              {assignment.consultant?.specialization || 'Mental Health Consultant'}
            </p>
            {assignment.consultant?.rating && (
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">{assignment.consultant.rating}/5</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({assignment.consultant.experience} years exp.)
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getAssignmentTypeBadge(assignment.assignmentType)}
          {getStatusBadge(assignment.status)}
          {assignment.status === 'active' && (
            <button
              onClick={() => onTerminate(assignment.id)}
              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
              title="Terminate Assignment"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Contact Information */}
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-700 mb-2">Contact Information</h5>
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-purple-500" />
            <span>{assignment.consultant?.user?.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-purple-500" />
            <span>{assignment.consultant?.user?.email}</span>
          </div>
          {assignment.consultant?.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-purple-500" />
              <span>{assignment.consultant.location}</span>
            </div>
          )}
        </div>

        {/* Assignment Details */}
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-700 mb-2">Assignment Details</h5>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
            <span>Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}</span>
          </div>
          {assignment.sessionFee && (
            <div className="flex items-center text-gray-600">
              <span className="text-green-600 font-bold text-base">${assignment.sessionFee}/session</span>
            </div>
          )}
          {assignment.consultant?.languages && (
            <div className="flex items-center text-gray-600">
              <span className="text-xs">Languages: {assignment.consultant.languages.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Specializations */}
      {assignment.consultant?.specializations && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">Areas of Expertise:</p>
          <div className="flex flex-wrap gap-2">
            {assignment.consultant.specializations.map((spec, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* About Section */}
      {assignment.consultant?.about && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <p className="text-sm font-semibold text-gray-700 mb-1">About:</p>
          <p className="text-sm text-gray-600">{assignment.consultant.about}</p>
        </div>
      )}

      {/* Notes */}
      {assignment.notes && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <p className="text-sm font-semibold text-gray-700 mb-1">Assignment Notes:</p>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{assignment.notes}</p>
        </div>
      )}

      {/* Priority Indicator */}
      {assignment.priority && assignment.priority !== 'medium' && (
        <div className="mt-4 flex justify-between items-center">
          {getPriorityBadge(assignment.priority)}
          <div className="text-xs text-gray-500">
            Last updated: {new Date(assignment.assignedDate).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-purple-100 flex justify-end space-x-2">
        <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
          Schedule Session
        </button>
        <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
          View Progress
        </button>
      </div>
    </div>
  );
};

export default MentalHealthCard;