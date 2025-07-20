// frontend/src/components/family/consultation/FamilyConsultationPage.js
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Video, 
  Calendar, 
  User, 
  Stethoscope, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';
import CountdownTimer from '../../shared/CountdownTimer';
import AppointmentDetailsModal from '../../shared/AppointmentDetailsModal';
import consultationService from '../../../services/consultation'

const FamilyConsultationPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadConsultations();
    // Refresh data every minute to update timers
    const interval = setInterval(loadConsultations, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadConsultations = async () => {
    try {
      const response = await consultationService.getFamilyConsultations();
      setConsultations(response.consultations || []);
    } catch (error) {
      console.error('Error loading consultations:', error);
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (appointment) => {
    if (!appointment.zoomJoinUrl) {
      toast.error('Meeting link not available yet');
      return;
    }

    if (!appointment.canJoinMeeting) {
      toast.error('Meeting not available yet. Please wait until 1 hour before consultation.');
      return;
    }

    // Open Zoom meeting in new window
    window.open(appointment.zoomJoinUrl, '_blank');
    toast.success('Joining consultation...');
  };

  const handleViewDetails = async (appointmentId) => {
    try {
      const response = await consultationService.getAppointmentDetails(appointmentId);
      setSelectedAppointment(response.appointment);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading appointment details:', error);
      toast.error('Failed to load appointment details');
    }
  };

  const getStatusColor = (appointment) => {
    if (appointment.isConsultationTime) return 'bg-green-100 text-green-800';
    if (appointment.canJoinMeeting) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (appointment) => {
    if (appointment.isConsultationTime) return 'Consultation Active';
    if (appointment.canJoinMeeting) return 'Ready to Join';
    if (appointment.hasZoomLink) return 'Link Generated';
    return 'Waiting for Link';
  };

  const renderConsultationCard = (consultation) => {
    const appointmentDate = new Date(consultation.appointmentDate);
    
    return (
      <div key={consultation.id} className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {consultation.doctor?.user?.firstName} {consultation.doctor?.user?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{consultation.doctor?.specialization}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation)}`}>
              {getStatusText(consultation)}
            </span>
          </div>

          {/* Elder Information */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Patient:</span>
              <span className="text-sm text-gray-900">
                {consultation.elder?.firstName} {consultation.elder?.lastName}
              </span>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {appointmentDate.toLocaleDateString()} at {appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Duration: {consultation.duration} minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Reason: {consultation.reason}</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-4">
            <CountdownTimer 
              targetDate={consultation.appointmentDate}
              onTimeUp={() => loadConsultations()}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleViewDetails(consultation.id)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>More Details</span>
            </button>

            {consultation.hasZoomLink && (
              <button
                onClick={() => handleJoinMeeting(consultation)}
                disabled={!consultation.canJoinMeeting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  consultation.canJoinMeeting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>
                  {consultation.isConsultationTime ? 'Join Now' : 
                   consultation.canJoinMeeting ? 'Join Meeting' : 
                   'Available Soon'}
                </span>
              </button>
            )}
          </div>

          {/* Meeting Status Info */}
          {!consultation.hasZoomLink && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Meeting link will be generated 1 hour before consultation
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RoleLayout role="family">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="family">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>
            <p className="text-gray-600">Manage your upcoming medical consultations</p>
          </div>
        </div>

        {/* Consultations List */}
        {consultations.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Consultations</h3>
            <p className="text-gray-600">You don't have any upcoming consultations.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {consultations.map(renderConsultationCard)}
          </div>
        )}

        {/* Appointment Details Modal */}
        {showDetailsModal && selectedAppointment && (
          <AppointmentDetailsModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedAppointment(null);
            }}
          />
        )}
      </div>
    </RoleLayout>
  );
};

export default FamilyConsultationPage;