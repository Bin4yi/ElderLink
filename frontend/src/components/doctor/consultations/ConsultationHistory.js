// src/components/doctor/consultations/ConsultationHistory.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import monthlySessionService from '../../../services/monthlySession';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';
import ConsultationCalendar from './ConsultationCalendar';
import ElderDetailsModal from './ElderDetailsModal';
import DoctorDetailsModal from './DoctorDetailsModal';
import ZoomMeetingModal from './ZoomMeetingModal';
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
  Activity,
  CalendarCheck,
  Sparkles,
  UserCircle,
  Stethoscope
} from 'lucide-react';

const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedElder, setSelectedElder] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showElderModal, setShowElderModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [monthlySessions, setMonthlySessions] = useState([]);
  const [loadingMonthlySessions, setLoadingMonthlySessions] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadConsultations();
    loadMonthlySessions();
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

  const loadMonthlySessions = async () => {
    try {
      setLoadingMonthlySessions(true);
      console.log('🔄 Loading doctor monthly sessions...');
      
      const response = await monthlySessionService.getDoctorMonthlySessions();
      
      console.log('📋 Monthly sessions response:', response);
      console.log('📋 Full response structure:', JSON.stringify(response, null, 2));

      if (response.success && response.data && response.data.sessions) {
        console.log('✅ Sessions found:', response.data.sessions.length);
        console.log('📊 Sessions data:', response.data.sessions);
        setMonthlySessions(response.data.sessions);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback if sessions array is directly in data
        console.log('✅ Sessions found (direct array):', response.data.length);
        setMonthlySessions(response.data);
      } else {
        console.log('⚠️ No sessions found in response');
        setMonthlySessions([]);
      }
    } catch (error) {
      console.error('❌ Error loading monthly sessions:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      toast.error('Failed to load monthly sessions');
      setMonthlySessions([]);
    } finally {
      setLoadingMonthlySessions(false);
    }
  };

  // Date helper functions
  const getDateOnly = (dateStr) => new Date(dateStr).toISOString().split('T')[0];
  const isToday = (dateStr) => getDateOnly(dateStr) === today;
  const isFuture = (dateStr) => getDateOnly(dateStr) > today;
  const isPast = (dateStr) => getDateOnly(dateStr) < today;

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter consultations by date
  const todayConsultations = consultations.filter(
    c => isToday(c.appointmentDate)
  );

  const completedConsultations = consultations.filter(
    c => isPast(c.appointmentDate)
  );

  // Filter upcoming consultations (current month + next 2 months = 3 months total from today)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  threeMonthsFromNow.setHours(23, 59, 59, 999); // End of day
  
  const upcomingConsultations = consultations.filter(c => {
    const appointmentDate = new Date(c.appointmentDate);
    
    // Include appointments from today onwards up to 3 months (current month + 2 future months)
    return appointmentDate >= todayDate && appointmentDate <= threeMonthsFromNow;
  }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  // Log filtering results for debugging
  console.log('📊 Consultation Filtering:', {
    total: consultations.length,
    todayOnly: todayConsultations.length,
    upcomingNext3Months: upcomingConsultations.length,
    completed: completedConsultations.length,
    dateRange: {
      from: todayDate.toLocaleDateString(),
      to: threeMonthsFromNow.toLocaleDateString()
    }
  });

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

  // Handle view doctor details (for monthly sessions)
  const handleViewDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  // Handle start zoom meeting
  const handleStartZoomMeeting = (consultation) => {
    setSelectedConsultation(consultation);
    setShowZoomModal(true);
  };

  // Handle close modals
  const closeAllModals = () => {
    setShowDetailsModal(false);
    setShowElderModal(false);
    setShowDoctorModal(false);
    setShowZoomModal(false);
    setSelectedConsultation(null);
    setSelectedElder(null);
    setSelectedDoctor(null);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Consultation History
            </h2>
            <p className="text-gray-600 mt-1">Manage your patient consultations and meetings</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-lg">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">Total: {consultations.length}</span>
          </div>
        </div>

        {/* Main Grid Layout: Content Left, Calendar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Consultations List (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
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
            {/* Monthly Sessions Section */}
            <section className="mb-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/50">
                      <CalendarCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Monthly Sessions
                      </h3>
                      <p className="text-sm text-gray-600">Scheduled recurring sessions with elders</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                    <span className="text-sm font-semibold text-purple-700">
                      {monthlySessions.length} Sessions
                    </span>
                  </div>
                </div>

                {loadingMonthlySessions ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : monthlySessions.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-600 font-medium">No monthly sessions scheduled yet</p>
                    <p className="text-sm text-gray-500 mt-1">Sessions will appear here once scheduled</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monthlySessions.map((session, index) => (
                      <div
                        key={session.id || index}
                        className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl p-5 border border-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {session.elder?.firstName} {session.elder?.lastName}
                              </h4>
                              <p className="text-xs text-gray-500">Elder Patient</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            session.status === 'scheduled' 
                              ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg shadow-green-500/50'
                              : session.status === 'completed'
                              ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg shadow-blue-500/50'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                          }`}>
                            {session.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">
                              {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">{session.sessionTime}</span>
                            {session.duration && (
                              <span className="text-xs text-gray-500">({session.duration} min)</span>
                            )}
                          </div>
                          {session.elder?.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="w-4 h-4 text-purple-500" />
                              <span className="text-sm">{session.elder.phone}</span>
                            </div>
                          )}
                        </div>

                        {session.familyMember && (
                          <div className="mt-4 pt-4 border-t border-purple-100">
                            <p className="text-xs text-gray-500 mb-1">Scheduled by</p>
                            <p className="text-sm font-medium text-gray-700">
                              {session.familyMember.firstName} {session.familyMember.lastName}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 pt-4 border-t border-purple-100 flex gap-2">
                          <button
                            onClick={() => handleViewElderDetails({ elder: session.elder })}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold"
                          >
                            <UserCircle className="w-4 h-4" />
                            Elder Details
                          </button>
                          {session.zoomJoinUrl && (
                            <button
                              onClick={() => handleStartZoomMeeting(session)}
                              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold"
                            >
                              <Video className="w-4 h-4" />
                              Start Call
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming Consultations Section (Current Month + Next 2 Months) */}
            <section className="mb-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-indigo-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl shadow-lg shadow-indigo-500/50">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Upcoming Consultations
                      </h3>
                      <p className="text-sm text-gray-600">
                        Next 3 months (including today)
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full">
                    <span className="text-sm font-semibold text-indigo-700">
                      {upcomingConsultations.length} Appointments
                    </span>
                  </div>
                </div>

                {upcomingConsultations.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border-2 border-dashed border-indigo-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-gray-600 font-medium">No upcoming appointments</p>
                    <p className="text-sm text-gray-500 mt-1">Appointments will appear here once booked</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingConsultations.map((appointment, index) => (
                      <div
                        key={appointment.id || index}
                        className="group bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 border border-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {appointment.elder?.firstName} {appointment.elder?.lastName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {appointment.elder?.dateOfBirth && `${calculateAge(appointment.elder.dateOfBirth)} years old`}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isToday(appointment.appointmentDate)
                              ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg shadow-green-500/50 animate-pulse'
                              : isFuture(appointment.appointmentDate)
                              ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg shadow-blue-500/50'
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}>
                            {isToday(appointment.appointmentDate) ? '🔴 Today' : 
                             isFuture(appointment.appointmentDate) ? 'Upcoming' : 'Completed'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-medium">{appointment.appointmentTime}</span>
                          </div>
                          {appointment.reason && (
                            <div className="flex items-start gap-2 text-gray-700">
                              <FileText className="w-4 h-4 text-indigo-500 mt-0.5" />
                              <span className="text-sm">{appointment.reason}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewElderDetails(appointment)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold"
                          >
                            <UserCircle className="w-4 h-4" />
                            Elder Details
                          </button>
                          <button
                            onClick={() => handleStartZoomMeeting(appointment)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold"
                          >
                            <Video className="w-4 h-4" />
                            {isToday(appointment.appointmentDate) ? 'Start Call' : 'View'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          </div>

          {/* Right Column: Calendar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ConsultationCalendar
                appointments={upcomingConsultations}
                monthlySessions={monthlySessions}
              />
            </div>
          </div>
        </div>

        {/* Modals */}
        
        {/* Elder Details Modal */}
        <ElderDetailsModal
          elder={selectedElder}
          isOpen={showElderModal}
          onClose={closeAllModals}
        />

        {/* Doctor Details Modal */}
        <DoctorDetailsModal
          doctor={selectedDoctor}
          isOpen={showDoctorModal}
          onClose={closeAllModals}
        />

        {/* Zoom Meeting Modal */}
        <ZoomMeetingModal
          consultation={selectedConsultation}
          isOpen={showZoomModal}
          onClose={closeAllModals}
          onStartMeeting={(consultation) => {
            console.log('Starting meeting for:', consultation);
            // You can add additional logic here if needed
          }}
        />

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