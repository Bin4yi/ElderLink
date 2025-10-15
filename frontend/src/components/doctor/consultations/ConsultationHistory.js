// src/components/doctor/consultations/ConsultationHistory.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Video,
  Users,
  Loader,
  FileText,
  Heart,
  Activity
} from 'lucide-react';

const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedElder, setSelectedElder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showElderModal, setShowElderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading consultations...');

      // Only fetch approved appointments for consultations
      const params = { status: 'approved' };
      const response = await doctorAppointmentService.getDoctorAppointments(params);
      
      console.log('📋 Consultations response:', response);

      if (response.success !== false) {
        setConsultations(response.appointments || []);
        console.log('✅ Loaded consultations:', response.appointments?.length || 0);
      } else {
        console.error('API returned error:', response.message);
        toast.error(response.message || 'Failed to load consultations');
        setConsultations([]);
      }
    } catch (error) {
      console.error('❌ Error loading consultations:', error);
      toast.error('Failed to load consultations');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  // Date helper functions
  const getDateOnly = (dateStr) => new Date(dateStr).toISOString().split('T')[0];
  const isToday = (dateStr) => getDateOnly(dateStr) === today;
  const isFuture = (dateStr) => getDateOnly(dateStr) > today;
  const isPast = (dateStr) => getDateOnly(dateStr) < today;

  // Filter consultations by date
  const todayConsultations = consultations.filter(
    c => isToday(c.appointmentDate)
  );

  const upcomingConsultations = consultations.filter(
    c => isFuture(c.appointmentDate)
  );

  const completedConsultations = consultations.filter(
    c => isPast(c.appointmentDate)
  );

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Handle start meeting
  const handleStartMeeting = async (consultation) => {
    try {
      setActionLoading(true);
      console.log('🎥 Starting meeting for consultation:', consultation.id);
      
      // Here you would integrate with your video call service
      // For now, we'll just show a success message
      toast.success('Meeting started successfully');
      
      // You could redirect to a video call component or open a new window
      // window.open(`/video-call/${consultation.id}`, '_blank');
      
    } catch (error) {
      console.error('❌ Error starting meeting:', error);
      toast.error('Failed to start meeting');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
  };

  // Handle view elder details
  const handleViewElderDetails = (consultation) => {
    setSelectedElder(consultation.elder);
    setShowElderModal(true);
  };

  // Render consultation card
  const renderConsultationCard = (consultation, showStartMeeting = false) => {
    const { date, time } = formatDateTime(consultation.appointmentDate);
    const elder = consultation.elder || {};
    const familyMember = consultation.familyMember || {};

    return (
      <div
        key={consultation.id}
        className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Elder Information */}
            <div className="flex items-center gap-3 mb-3">
              {elder.photo ? (
                <img 
                  src={elder.photo} 
                  alt={`${elder.firstName} ${elder.lastName}`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {elder.firstName} {elder.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {elder.gender && `${elder.gender.charAt(0).toUpperCase()}${elder.gender.slice(1)}`}
                  {elder.dateOfBirth && ` • ${new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear()} years old`}
                </p>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm capitalize">{consultation.type}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {elder.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{elder.phone}</span>
                  </div>
                )}
                {familyMember.firstName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Family: {familyMember.firstName} {familyMember.lastName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">Duration: {consultation.duration || 30} min</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Reason:</span> {consultation.reason}
              </p>
              {consultation.symptoms && (
                <p className="text-gray-700">
                  <span className="font-medium">Symptoms:</span> {consultation.symptoms}
                </p>
              )}
            </div>

            {/* Quick Medical Info */}
            {(elder.bloodType || elder.allergies) && (
              <div className="mt-3 flex gap-4 text-sm">
                {elder.bloodType && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    <Heart className="w-3 h-3 inline mr-1" />
                    {elder.bloodType}
                  </span>
                )}
                {elder.allergies && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    ⚠️ Allergies
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end gap-2 ml-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
              APPROVED
            </span>

            <div className="flex flex-col gap-2">
              {/* Start Meeting Button - Only for today's consultations */}
              {showStartMeeting && (
                <button
                  onClick={() => handleStartMeeting(consultation)}
                  disabled={actionLoading}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {actionLoading ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : (
                    <Video className="w-3 h-3" />
                  )}
                  Start Meeting
                </button>
              )}

              {/* View Details Button */}
              <button
                onClick={() => handleViewDetails(consultation)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View Details
              </button>

              {/* Elder Details Button */}
              <button
                onClick={() => handleViewElderDetails(consultation)}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                Elder Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RoleLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Consultation History</h2>
            <p className="text-gray-600 mt-1">Manage your patient consultations and meetings</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            Total Consultations: {consultations.length}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Loading consultations...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Today's Consultations */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🏥 Today's Consultations ({todayConsultations.length})
              </h3>
              {todayConsultations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No consultations scheduled for today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayConsultations.map(consultation => 
                    renderConsultationCard(consultation, true)
                  )}
                </div>
              )}
            </section>

            {/* Upcoming Consultations */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📅 Upcoming Consultations ({upcomingConsultations.length})
              </h3>
              {upcomingConsultations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming consultations scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingConsultations.map(consultation => 
                    renderConsultationCard(consultation, false)
                  )}
                </div>
              )}
            </section>

            {/* Completed Consultations */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ✅ Completed Consultations ({completedConsultations.length})
              </h3>
              {completedConsultations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No completed consultations found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedConsultations.map(consultation => 
                    renderConsultationCard(consultation, false)
                  )}
                </div>
              )}
            </section>

            {/* No Consultations Message */}
            {consultations.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
                <p className="text-gray-500">
                  You don't have any approved appointments for consultations yet.
                </p>
              </div>
            )}
          </>
        )}

        {/* Modal: View Consultation Details */}
        {showDetailsModal && selectedConsultation && (
          <Modal onClose={() => setShowDetailsModal(false)}>
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Consultation Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Patient Information</h3>
                  <div className="flex items-center gap-3 mb-4">
                    {selectedConsultation.elder?.photo ? (
                      <img 
                        src={selectedConsultation.elder.photo} 
                        alt={`${selectedConsultation.elder.firstName} ${selectedConsultation.elder.lastName}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">
                        {selectedConsultation.elder?.firstName} {selectedConsultation.elder?.lastName}
                      </h4>
                      <p className="text-gray-600">
                        {selectedConsultation.elder?.gender} • 
                        {selectedConsultation.elder?.dateOfBirth && 
                          ` ${new Date().getFullYear() - new Date(selectedConsultation.elder.dateOfBirth).getFullYear()} years old`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p><strong>Phone:</strong> {selectedConsultation.elder?.phone || 'N/A'}</p>
                    <p><strong>Emergency Contact:</strong> {selectedConsultation.elder?.emergencyContact || 'N/A'}</p>
                    <p><strong>Blood Type:</strong> {selectedConsultation.elder?.bloodType || 'N/A'}</p>
                    {selectedConsultation.familyMember?.firstName && (
                      <p><strong>Family Contact:</strong> {selectedConsultation.familyMember.firstName} {selectedConsultation.familyMember.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Consultation Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Consultation Information</h3>
                  <div className="space-y-2">
                    <p><strong>Date:</strong> {formatDateTime(selectedConsultation.appointmentDate).date}</p>
                    <p><strong>Time:</strong> {formatDateTime(selectedConsultation.appointmentDate).time}</p>
                    <p><strong>Duration:</strong> {selectedConsultation.duration || 30} minutes</p>
                    <p><strong>Type:</strong> {selectedConsultation.type}</p>
                    <p><strong>Priority:</strong> {selectedConsultation.priority}</p>
                    <p><strong>Status:</strong> 
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        APPROVED
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Medical Information</h3>
                <div className="space-y-3">
                  <div>
                    <strong>Reason for Consultation:</strong>
                    <p className="text-gray-700 mt-1">{selectedConsultation.reason}</p>
                  </div>
                  {selectedConsultation.symptoms && (
                    <div>
                      <strong>Symptoms:</strong>
                      <p className="text-gray-700 mt-1">{selectedConsultation.symptoms}</p>
                    </div>
                  )}
                  {selectedConsultation.notes && (
                    <div>
                      <strong>Patient Notes:</strong>
                      <p className="text-gray-700 mt-1">{selectedConsultation.notes}</p>
                    </div>
                  )}
                  {selectedConsultation.doctorNotes && (
                    <div>
                      <strong>Doctor Notes:</strong>
                      <p className="text-gray-700 mt-1">{selectedConsultation.doctorNotes}</p>
                    </div>
                  )}
                  {selectedConsultation.elder?.allergies && (
                    <div>
                      <strong>Allergies:</strong>
                      <p className="text-red-600 mt-1 font-medium">{selectedConsultation.elder.allergies}</p>
                    </div>
                  )}
                  {selectedConsultation.elder?.chronicConditions && (
                    <div>
                      <strong>Chronic Conditions:</strong>
                      <p className="text-gray-700 mt-1">{selectedConsultation.elder.chronicConditions}</p>
                    </div>
                  )}
                  {selectedConsultation.elder?.currentMedications && (
                    <div>
                      <strong>Current Medications:</strong>
                      <p className="text-gray-700 mt-1">{selectedConsultation.elder.currentMedications}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isToday(selectedConsultation.appointmentDate) && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleStartMeeting(selectedConsultation)}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        Start Meeting
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Modal: View Elder Details */}
        {showElderModal && selectedElder && (
          <Modal onClose={() => setShowElderModal(false)}>
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Elder Details
              </h2>
              
              {/* Elder Profile */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {selectedElder.photo ? (
                  <img 
                    src={selectedElder.photo} 
                    alt={`${selectedElder.firstName} ${selectedElder.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-3 border-gray-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedElder.firstName} {selectedElder.lastName}
                  </h3>
                  <p className="text-gray-600">
                    {selectedElder.gender && `${selectedElder.gender.charAt(0).toUpperCase()}${selectedElder.gender.slice(1)}`}
                    {selectedElder.dateOfBirth && 
                      ` • ${new Date().getFullYear() - new Date(selectedElder.dateOfBirth).getFullYear()} years old`
                    }
                  </p>
                  {selectedElder.dateOfBirth && (
                    <p className="text-sm text-gray-500">
                      Born: {new Date(selectedElder.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Contact Information</h4>
                  <div className="space-y-3">
                    {selectedElder.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedElder.phone}</span>
                      </div>
                    )}
                    {selectedElder.emergencyContact && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-500" />
                        <span>Emergency: {selectedElder.emergencyContact}</span>
                      </div>
                    )}
                    {selectedElder.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <span>{selectedElder.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Medical Information</h4>
                  <div className="space-y-3">
                    {selectedElder.bloodType && (
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>Blood Type: <strong>{selectedElder.bloodType}</strong></span>
                      </div>
                    )}
                    {selectedElder.allergies && (
                      <div>
                        <p className="font-medium text-red-600 mb-1">⚠️ Allergies:</p>
                        <p className="text-red-700 bg-red-50 p-2 rounded">{selectedElder.allergies}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Medical Information */}
              {(selectedElder.chronicConditions || selectedElder.currentMedications) && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Detailed Medical History</h4>
                  {selectedElder.chronicConditions && (
                    <div>
                      <p className="font-medium text-gray-800 mb-2">Chronic Conditions:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedElder.chronicConditions}</p>
                    </div>
                  )}
                  {selectedElder.currentMedications && (
                    <div>
                      <p className="font-medium text-gray-800 mb-2">Current Medications:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedElder.currentMedications}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </RoleLayout>
  );
};

export default ConsultationHistory;