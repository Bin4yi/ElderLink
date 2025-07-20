// frontend/src/components/shared/AppointmentDetailsModal.js
import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Phone, 
  Mail, 
  AlertTriangle,
  Heart,
  Pill
} from 'lucide-react';
import Modal from '../common/Modal';

const AppointmentDetailsModal = ({ appointment, onClose, isDoctor = false }) => {
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.appointmentDate);

  return (
    <Modal isOpen={true} onClose={onClose} size="2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Appointment Status */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Appointment Status</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-gray-900">{appointmentDate.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Time</p>
                <p className="text-gray-900">
                  {appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          </div>

          {/* Patient/Doctor Information */}
          {isDoctor ? (
            /* Doctor view - show patient info */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {appointment.elder?.photo ? (
                      <img 
                        src={appointment.elder.photo} 
                        alt={`${appointment.elder.firstName} ${appointment.elder.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {appointment.elder?.firstName} {appointment.elder?.lastName}
                    </h4>
                    <p className="text-gray-600">
                      Age: {appointment.elder?.dateOfBirth ? 
                        Math.floor((new Date() - new Date(appointment.elder.dateOfBirth)) / 365.25 / 24 / 60 / 60 / 1000) : 
                        'N/A'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date of Birth:</p>
                    <p className="text-sm text-gray-900">
                      {appointment.elder?.dateOfBirth ? 
                        new Date(appointment.elder.dateOfBirth).toLocaleDateString() : 
                        'Not provided'
                      }
                    </p>
                  </div>
                  
                  {appointment.elder?.chronicConditions && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Chronic Conditions:</p>
                      <p className="text-sm text-gray-900">{appointment.elder.chronicConditions}</p>
                    </div>
                  )}
                  
                  {appointment.elder?.allergies && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Allergies:</p>
                      <p className="text-sm text-gray-900 text-red-600">{appointment.elder.allergies}</p>
                    </div>
                  )}
                </div>

                {/* Family Contact */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Family Contact</h5>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {appointment.familyMember?.firstName} {appointment.familyMember?.lastName}
                      </span>
                    </div>
                    {appointment.familyMember?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{appointment.familyMember.email}</span>
                      </div>
                    )}
                    {appointment.familyMember?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{appointment.familyMember.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Family view - show doctor info */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Doctor Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                    </h4>
                    <p className="text-gray-600">{appointment.doctor?.specialization}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointment.doctor?.experience && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience:</p>
                      <p className="text-sm text-gray-900">{appointment.doctor.experience} years</p>
                    </div>
                  )}
                  
                  {appointment.doctor?.qualifications && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Qualifications:</p>
                      <p className="text-sm text-gray-900">{appointment.doctor.qualifications}</p>
                    </div>
                  )}
                </div>

                {/* Patient Information for Family */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Patient</h5>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {appointment.elder?.firstName} {appointment.elder?.lastName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-blue-900">Type:</p>
                <p className="text-sm text-blue-800 capitalize">{appointment.type || 'Consultation'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-blue-900">Priority:</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  appointment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  appointment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {appointment.priority?.charAt(0).toUpperCase() + appointment.priority?.slice(1)}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-blue-900">Duration:</p>
                <p className="text-sm text-blue-800">{appointment.duration} minutes</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-blue-900">Reason for Visit:</p>
                <p className="text-sm text-blue-800">{appointment.reason}</p>
              </div>
              
              {appointment.symptoms && (
                <div>
                  <p className="text-sm font-medium text-blue-900">Symptoms:</p>
                  <p className="text-sm text-blue-800">{appointment.symptoms}</p>
                </div>
              )}
              
              {appointment.notes && (
                <div>
                  <p className="text-sm font-medium text-blue-900">Additional Notes:</p>
                  <p className="text-sm text-blue-800">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Alerts */}
          {(appointment.elder?.chronicConditions || appointment.elder?.allergies) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Medical Alerts</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Important Medical Information</span>
                </div>
                
                <div className="space-y-2">
                  {appointment.elder?.chronicConditions && (
                    <div className="flex items-start space-x-2">
                      <Heart className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Chronic Conditions:</p>
                        <p className="text-sm text-yellow-700">{appointment.elder.chronicConditions}</p>
                      </div>
                    </div>
                  )}
                  
                  {appointment.elder?.allergies && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Allergies:</p>
                        <p className="text-sm text-red-700">{appointment.elder.allergies}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Meeting Information */}
          {appointment.hasZoomLink && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Meeting Information</h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Video meeting link generated</span>
                </div>
                <p className="text-sm text-green-700">
                  {appointment.canJoinMeeting || appointment.canStartMeeting ? 
                    'You can now access the meeting controls.' : 
                    'Meeting controls will be available 1 hour before the consultation.'
                  }
                </p>
                {appointment.zoomPassword && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-800">Meeting Password:</p>
                    <p className="text-sm text-green-700 font-mono">{appointment.zoomPassword}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Time Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Time Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Scheduled Time:</p>
                  <p className="text-sm text-gray-900">
                    {appointmentDate.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Time Until Consultation:</p>
                  <p className="text-sm text-gray-900">
                    {appointment.timeUntilConsultation > 0 ? (
                      <>
                        {Math.floor(appointment.timeUntilConsultation / (1000 * 60 * 60 * 24))} days, {' '}
                        {Math.floor((appointment.timeUntilConsultation % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} hours, {' '}
                        {Math.floor((appointment.timeUntilConsultation % (1000 * 60 * 60)) / (1000 * 60))} minutes
                      </>
                    ) : (
                      'Consultation time has passed'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;