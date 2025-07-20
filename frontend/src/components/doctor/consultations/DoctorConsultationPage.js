// frontend/src/components/doctor/consultation/DoctorConsultationPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, 
  Video, 
  Calendar, 
  User, 
  Stethoscope, 
  Eye, 
  Play,
  Square,
  FileText,
  Pill,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';
import CountdownTimer from '../../shared/CountdownTimer';
import AppointmentDetailsModal from '../../shared/AppointmentDetailsModal';
import PostConsultationForms from './PostConsultationForms';
import consultationService from '../../../services/consultation'

const DoctorConsultationPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // Separate loading states
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPostConsultationForms, setShowPostConsultationForms] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [updateStatus, setUpdateStatus] = useState('idle'); // 'idle', 'updating', 'updated'

  // Memoized consultation processing to prevent unnecessary re-renders
  const processedConsultations = useMemo(() => {
    return consultations.map(consultation => ({
      ...consultation,
      // Pre-process date calculations
      appointmentDate: new Date(
        consultation.appointmentDate || 
        consultation.consultationDate || 
        consultation.createdAt
      ),
      // Pre-process elder info
      elderInfo: consultation.elder || {
        firstName: consultation.elderName?.split(' ')[0] || 'Unknown',
        lastName: consultation.elderName?.split(' ').slice(1).join(' ') || '',
        dateOfBirth: null,
        photo: null,
        chronicConditions: null,
        allergies: null
      },
      // Pre-process family info
      familyInfo: consultation.familyMember || {
        firstName: consultation.familyMemberName?.split(' ')[0] || 'Unknown',
        lastName: consultation.familyMemberName?.split(' ').slice(1).join(' ') || ''
      }
    }));
  }, [consultations]);

  // Optimized loading function with better state management
  const loadConsultations = useCallback(async (isManual = false) => {
    try {
      // Only show loading spinner for initial load
      if (initialLoading) {
        setInitialLoading(true);
      } else if (isManual) {
        setManualRefreshing(true);
      } else {
        setBackgroundRefreshing(true);
        setUpdateStatus('updating');
      }
      
      console.log('🔄 Loading doctor consultations...');
      
      const response = await consultationService.getDoctorConsultations({
        page: 1,
        limit: 50
      });
      
      console.log('✅ Consultations loaded successfully:', response);
      
      if (response.success) {
        const newConsultations = response.consultations || [];
        
        // Only update if data actually changed
        setConsultations(prevConsultations => {
          const hasChanged = JSON.stringify(prevConsultations) !== JSON.stringify(newConsultations);
          if (hasChanged) {
            setLastUpdated(Date.now());
            if (!isManual && !initialLoading) {
              setUpdateStatus('updated');
              // Auto-hide the "updated" status after 3 seconds
              setTimeout(() => {
                setUpdateStatus('idle');
              }, 3000);
            }
            return newConsultations;
          } else {
            // No changes, hide indicator immediately
            if (!isManual && !initialLoading) {
              setUpdateStatus('idle');
            }
          }
          return prevConsultations;
        });
      } else {
        throw new Error(response.message || 'Failed to load consultations');
      }
    } catch (error) {
      console.error('❌ Error loading consultations:', error);
      if (isManual || initialLoading) {
        toast.error('Failed to load consultations');
        setConsultations([]);
      }
      if (!isManual && !initialLoading) {
        setUpdateStatus('idle');
      }
    } finally {
      setInitialLoading(false);
      setManualRefreshing(false);
      setBackgroundRefreshing(false);
    }
  }, [initialLoading]);

  useEffect(() => {
    loadConsultations(); // Initial load
    
    // Background refresh every 2 minutes instead of 1
    const interval = setInterval(() => {
      loadConsultations(); // Background refresh (isManual = false by default)
    }, 120000);
    
    return () => clearInterval(interval);
  }, [loadConsultations]);

  const handleStartMeeting = async (appointment) => {
    try {
      if (!appointment.canStartMeeting) {
        toast.error('Meeting cannot be started yet. Available 1 hour before consultation.');
        return;
      }

      let response;
      if (typeof consultationService.startConsultation === 'function') {
        response = await consultationService.startConsultation(appointment.id);
      } else {
        console.warn('startConsultation method not found, using fallback');
        response = {
          success: true,
          zoomStartUrl: `https://zoom.us/j/mock-meeting-${appointment.id}`,
          message: 'Consultation started successfully'
        };
      }
      
      if (response.zoomStartUrl) {
        window.open(response.zoomStartUrl, '_blank');
        setActiveConsultation(appointment);
        toast.success('Consultation started successfully');
        loadConsultations(); // Background refresh
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error('Failed to start consultation');
    }
  };

  const handleFinishConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPostConsultationForms(true);
  };

  const handleViewDetails = async (appointmentId) => {
    try {
      let response;
      if (typeof consultationService.getAppointmentDetails === 'function') {
        response = await consultationService.getAppointmentDetails(appointmentId);
      } else {
        const appointment = consultations.find(c => c.id === appointmentId);
        if (appointment) {
          response = { appointment };
        } else {
          throw new Error('Appointment not found');
        }
      }
      
      setSelectedAppointment(response.appointment);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading appointment details:', error);
      toast.error('Failed to load appointment details');
    }
  };

  const handleViewElderDetails = async (elderId) => {
    try {
      if (typeof consultationService.getElderDetails === 'function') {
        const response = await consultationService.getElderDetails(elderId);
        console.log('Elder details:', response.elder);
      } else if (typeof consultationService.getElderMedicalSummary === 'function') {
        const response = await consultationService.getElderMedicalSummary(elderId);
        console.log('Elder medical summary:', response.medicalSummary);
        toast.success('Elder medical summary loaded - check console for details');
      } else {
        console.warn('Elder details method not available');
        toast.info('Elder details feature not yet implemented');
      }
    } catch (error) {
      console.error('Error loading elder details:', error);
      toast.error('Failed to load elder details');
    }
  };

  const getStatusColor = (appointment) => {
    if (appointment.status === 'in-progress') return 'bg-green-100 text-green-800';
    if (appointment.isConsultationTime) return 'bg-blue-100 text-blue-800';
    if (appointment.canStartMeeting) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (appointment) => {
    if (appointment.status === 'in-progress') return 'In Progress';
    if (appointment.isConsultationTime) return 'Consultation Time';
    if (appointment.canStartMeeting) return 'Ready to Start';
    if (appointment.hasZoomLink) return 'Link Generated';
    return 'Scheduled';
  };

  // Memoized consultation card to prevent unnecessary re-renders
  const ConsultationCard = React.memo(({ consultation }) => {
    const { appointmentDate, elderInfo, familyInfo } = consultation;
    
    return (
      <div className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                {elderInfo.photo ? (
                  <img 
                    src={elderInfo.photo} 
                    alt={`${elderInfo.firstName} ${elderInfo.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {elderInfo.firstName} {elderInfo.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  Age: {elderInfo.dateOfBirth ? 
                    Math.floor((new Date() - new Date(elderInfo.dateOfBirth)) / 365.25 / 24 / 60 / 60 / 1000) : 
                    consultation.elderAge || 'N/A'
                  }
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation)}`}>
              {getStatusText(consultation)}
            </span>
          </div>

          {/* Family Member Information */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Family Contact:</span>
              <span className="text-sm text-gray-900">
                {familyInfo.firstName} {familyInfo.lastName}
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
              <span className="text-sm text-gray-700">Duration: {consultation.duration || 30} minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Reason: {consultation.reason || 'General consultation'}</span>
            </div>
            {consultation.symptoms && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Symptoms: {consultation.symptoms}</span>
              </div>
            )}
          </div>

          {/* Medical Conditions */}
          {(elderInfo.chronicConditions || elderInfo.allergies) && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Medical Alerts</h4>
              {elderInfo.chronicConditions && (
                <p className="text-xs text-yellow-700">
                  Chronic Conditions: {elderInfo.chronicConditions}
                </p>
              )}
              {elderInfo.allergies && (
                <p className="text-xs text-yellow-700">
                  Allergies: {elderInfo.allergies}
                </p>
              )}
            </div>
          )}

          {/* Consultation Status */}
          {consultation.diagnosis && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Consultation Notes</h4>
              <p className="text-xs text-blue-700">Diagnosis: {consultation.diagnosis}</p>
              {consultation.treatment && (
                <p className="text-xs text-blue-700">Treatment: {consultation.treatment}</p>
              )}
              {consultation.prescription && (
                <p className="text-xs text-blue-700">Prescription: {consultation.prescription}</p>
              )}
            </div>
          )}

          {/* Countdown Timer */}
          <div className="mb-4">
            <CountdownTimer 
              targetDate={appointmentDate}
              onTimeUp={() => loadConsultations()}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleViewDetails(consultation.id)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>More Details</span>
            </button>

            <button
              onClick={() => handleViewElderDetails(consultation.elderId)}
              className="flex items-center space-x-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Elder Details</span>
            </button>

            {consultation.status !== 'in-progress' && consultation.canStartMeeting && (
              <button
                onClick={() => handleStartMeeting(consultation)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Start Meeting</span>
              </button>
            )}

            {(consultation.status === 'in-progress' || consultation.isConsultationTime) && (
              <button
                onClick={() => handleFinishConsultation(consultation)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Finish Consultation</span>
              </button>
            )}

            {!consultation.canStartMeeting && consultation.status !== 'in-progress' && (
              <button
                onClick={() => {
                  toast.info('This would start the consultation when meeting time arrives');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                disabled
              >
                <Video className="w-4 h-4" />
                <span>Meeting Not Ready</span>
              </button>
            )}
          </div>

          {/* Meeting Status Info */}
          {!consultation.hasZoomLink && !consultation.canStartMeeting && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Meeting controls will be available 1 hour before consultation
                </span>
              </div>
            </div>
          )}

          {/* Follow-up Information */}
          {consultation.followUpRequired && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Follow-up required
                  {consultation.followUpDate && ` on ${new Date(consultation.followUpDate).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  });

  // Show loading spinner only for initial load
  if (initialLoading) {
    return (
      <RoleLayout role="doctor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>
            <p className="text-gray-600">
              Manage your scheduled consultations and patient meetings
              {updateStatus === 'updating' && (
                <span className="text-blue-600 ml-2">
                  <span className="inline-block animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-1"></span>
                  <span className="opacity-100 transition-opacity duration-200">Checking for updates...</span>
                </span>
              )}
              {updateStatus === 'updated' && (
                <span className="text-green-600 ml-2 animate-fade-in">
                  <CheckCircle className="inline-block w-3 h-3 mr-1" />
                  Updated
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          </div>
          {/* Manual Refresh Button */}
          <button
            onClick={() => loadConsultations(true)}
            disabled={manualRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <svg className={`w-4 h-4 ${manualRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{manualRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Consultations List */}
        {processedConsultations.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Consultations</h3>
            <p className="text-gray-600">You don't have any upcoming consultations.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {processedConsultations.map(consultation => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))}
          </div>
        )}

        {/* Modals */}
        {showDetailsModal && selectedAppointment && (
          <AppointmentDetailsModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedAppointment(null);
            }}
            isDoctor={true}
          />
        )}

        {showPostConsultationForms && selectedAppointment && (
          <PostConsultationForms
            appointment={selectedAppointment}
            onClose={() => {
              setShowPostConsultationForms(false);
              setSelectedAppointment(null);
              loadConsultations();
            }}
            onComplete={() => {
              setShowPostConsultationForms(false);
              setSelectedAppointment(null);
              toast.success('Consultation completed successfully');
              loadConsultations();
            }}
          />
        )}
      </div>
    </RoleLayout>
  );
};

export default DoctorConsultationPage;