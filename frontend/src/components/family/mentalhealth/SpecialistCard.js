// frontend/src/components/family/mentalhealth/SpecialistCard.js
import React from "react";
import {
  Brain,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  X,
  AlertCircle,
  User,
} from "lucide-react";

const SpecialistCard = ({ assignment, onTerminate }) => {
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      terminated: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getAssignmentTypeBadge = (type) => {
    const styles = {
      primary: "bg-purple-100 text-purple-800",
      secondary: "bg-blue-100 text-blue-800",
      specialist: "bg-indigo-100 text-indigo-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[type] || "bg-gray-100 text-gray-800"
        }`}
      >
        {type?.charAt(0).toUpperCase() + type?.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          styles[priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)} Priority
      </span>
    );
  };

  const specialist = assignment.specialist;

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-indigo-50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-800">
              {specialist?.firstName} {specialist?.lastName}
            </h4>
            <p className="text-purple-600 font-semibold">
              {specialist?.specialization || "Mental Health Specialist"}
            </p>
            {specialist?.experience && (
              <p className="text-sm text-gray-600 mt-1">
                {specialist.experience} years of experience
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getAssignmentTypeBadge(assignment.assignmentType)}
          {getStatusBadge(assignment.status)}
          {assignment.status === "active" && (
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
          <h5 className="font-semibold text-gray-700 mb-2">
            Contact Information
          </h5>
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-purple-500" />
            <span>{specialist?.email || "Not provided"}</span>
          </div>
          {specialist?.phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-purple-500" />
              <span>{specialist.phone}</span>
            </div>
          )}
          {specialist?.licenseNumber && (
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2 text-purple-500" />
              <span>License: {specialist.licenseNumber}</span>
            </div>
          )}
        </div>

        {/* Assignment Details */}
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-700 mb-2">
            Assignment Details
          </h5>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
            <span>
              Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
            </span>
          </div>
          {assignment.sessionFee && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-600 font-bold">
                ${assignment.sessionFee}/session
              </span>
            </div>
          )}
          {assignment.priority && (
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-purple-500" />
              {getPriorityBadge(assignment.priority)}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {assignment.notes && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Assignment Notes:
          </p>
          <p className="text-sm text-gray-700 bg-white p-3 rounded">
            {assignment.notes}
          </p>
        </div>
      )}

      {/* Termination Date */}
      {assignment.terminatedDate && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Terminated on:</span>{" "}
            {new Date(assignment.terminatedDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {assignment.status === "active" && (
        <div className="mt-4 pt-4 border-t border-purple-100 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
            Schedule Session
          </button>
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
            View Progress
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecialistCard;
