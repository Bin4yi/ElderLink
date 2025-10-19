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
import LastRecordModal from './LastRecordModal';
import ScheduleSessionModal from './ScheduleSessionModal';
import UploadRecordModal from './UploadRecordModal';
import UploadPrescriptionModal from './UploadPrescriptionModal';
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
  Stethoscope,
  Search,
  Filter,
  X,
  RefreshCw,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  Upload,
  Pill,
  History,
  Download
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

  // New modal states
  const [showLastRecordModal, setShowLastRecordModal] = useState(false);
  const [showScheduleSessionModal, setShowScheduleSessionModal] = useState(false);
  const [showUploadRecordModal, setShowUploadRecordModal] = useState(false);
  const [showUploadPrescriptionModal, setShowUploadPrescriptionModal] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'in-progress', 'completed'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadConsultations();
    loadMonthlySessions();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading consultations...');

      // Fetch all appointments for consultations (no status filter)
      const params = {}; // Show all appointments
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

  // Apply filters to consultations
  const applyFilters = (consultationList) => {
    return consultationList.filter(consultation => {
      const elder = consultation.elder || {};
      const elderName = `${elder.firstName || ''} ${elder.lastName || ''}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      // Search filter
      const matchesSearch = searchQuery === '' || 
        elderName.includes(searchLower) ||
        (consultation.reason || '').toLowerCase().includes(searchLower) ||
        (consultation.symptoms || '').toLowerCase().includes(searchLower) ||
        (consultation.type || '').toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = selectedStatus === 'all' || consultation.status === selectedStatus;

      // Priority filter
      const matchesPriority = selectedPriority === 'all' || consultation.priority === selectedPriority;

      // Type filter
      const matchesType = selectedType === 'all' || consultation.type === selectedType;

      // Date range filter
      const appointmentDate = new Date(consultation.appointmentDate);
      const matchesDateRange = 
        (!dateRange.start || appointmentDate >= new Date(dateRange.start)) &&
        (!dateRange.end || appointmentDate <= new Date(dateRange.end));

      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesDateRange;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedType('all');
    setDateRange({ start: '', end: '' });
  };

  // Filter consultations by date and apply filters
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  threeMonthsFromNow.setHours(23, 59, 59, 999); // End of day
  
  // Upcoming consultations (current month + next 2 months = 3 months total from today)
  const upcomingConsultations = applyFilters(
    consultations.filter(c => {
      const appointmentDate = new Date(c.appointmentDate);
      return appointmentDate >= todayDate && appointmentDate <= threeMonthsFromNow;
    })
  ).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  // In progress consultations (today's appointments)
  const inProgressConsultations = applyFilters(
    consultations.filter(c => isToday(c.appointmentDate))
  ).sort((a, b) => new Date(`${a.appointmentDate} ${a.appointmentTime}`) - new Date(`${b.appointmentDate} ${b.appointmentTime}`));

  // Completed consultations (past appointments)
  const completedConsultations = applyFilters(
    consultations.filter(c => isPast(c.appointmentDate))
  ).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)); // Most recent first

  // Log filtering results for debugging
  console.log('📊 Consultation Filtering:', {
    total: consultations.length,
    inProgress: inProgressConsultations.length,
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

  // Handle view last record
  const handleViewLastRecord = (consultation) => {
    setSelectedConsultation(consultation);
    setShowLastRecordModal(true);
  };

  // Handle schedule session
  const handleScheduleSession = (consultation) => {
    setSelectedConsultation(consultation);
    setShowScheduleSessionModal(true);
  };

  // Handle upload record
  const handleUploadRecord = (consultation) => {
    setSelectedConsultation(consultation);
    setShowUploadRecordModal(true);
  };

  // Handle upload prescription
  const handleUploadPrescription = (consultation) => {
    setSelectedConsultation(consultation);
    setShowUploadPrescriptionModal(true);
  };

  // Handle close modals
  const closeAllModals = () => {
    setShowDetailsModal(false);
    setShowElderModal(false);
    setShowDoctorModal(false);
    setShowLastRecordModal(false);
    setShowScheduleSessionModal(false);
    setShowUploadRecordModal(false);
    setShowUploadPrescriptionModal(false);
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
        <div className="flex justify-between items-center mb-6">
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

        {/* Today's Consultation Reminder Banner */}
        {!loading && inProgressConsultations.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl overflow-hidden animate-pulse">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    🔔 Reminder: You have {inProgressConsultations.length} consultation{inProgressConsultations.length > 1 ? 's' : ''} today!
                  </h3>
                  <p className="text-white/90 text-base">
                    {inProgressConsultations.length === 1 ? (
                      <>
                        Consultation with <span className="font-semibold">{inProgressConsultations[0].elder?.firstName} {inProgressConsultations[0].elder?.lastName}</span> at {inProgressConsultations[0].appointmentTime}
                      </>
                    ) : (
                      <>View the "In Progress Consultations" section below for all today's appointments</>
                    )}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-white/80 text-sm">Ready to start?</p>
                  <p className="text-white font-bold text-lg">Today's Schedule</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <PlayCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            {/* Bottom Info Bar */}
            <div className="bg-black/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-6 text-white/90 text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {inProgressConsultations.length} appointments scheduled
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {inProgressConsultations.length} patient{inProgressConsultations.length > 1 ? 's' : ''} waiting
                </span>
              </div>
              <button
                onClick={() => {
                  const inProgressSection = document.getElementById('in-progress-section');
                  if (inProgressSection) {
                    inProgressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-white/90 transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-lg"
              >
                <Eye className="w-4 h-4" />
                View Today's Schedule
              </button>
            </div>
          </div>
        )}

        {/* Main Grid Layout: Content Left, Calendar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Consultations List (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                </div>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by patient name, reason, symptoms..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="today">Today</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="all">All Types</option>
                    <option value="general">General</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={loadConsultations}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-base shadow-md hover:shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedType !== 'all' || dateRange.start || dateRange.end) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                  {searchQuery && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Search: {searchQuery}
                    </span>
                  )}
                  {selectedStatus !== 'all' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Status: {selectedStatus}
                    </span>
                  )}
                  {selectedPriority !== 'all' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Priority: {selectedPriority}
                    </span>
                  )}
                  {selectedType !== 'all' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Type: {selectedType}
                    </span>
                  )}
                  {dateRange.start && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      From: {new Date(dateRange.start).toLocaleDateString()}
                    </span>
                  )}
                  {dateRange.end && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      To: {new Date(dateRange.end).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {monthlySessions.map((session, index) => {
                      const elder = session.elder || {};
                      const familyMember = session.familyMember || {};
                      
                      return (
                        <div
                          key={session.id || index}
                          className="bg-white rounded-xl shadow-md border-l-4 hover:shadow-xl transition-all duration-300 overflow-hidden"
                          style={{
                            borderLeftColor: 
                              session.status === 'scheduled' ? '#10B981' :
                              session.status === 'completed' ? '#3B82F6' :
                              '#F59E0B'
                          }}
                        >
                          {/* Header Section with Patient Info and Status */}
                          <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                {elder.photo ? (
                                  <img 
                                    src={elder.photo} 
                                    alt={`${elder.firstName} ${elder.lastName}`}
                                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg border-4 border-white">
                                    <User className="w-8 h-8 text-white" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-bold text-2xl text-gray-900 mb-1">
                                    {elder.firstName || 'Unknown'} {elder.lastName || 'Patient'}
                                  </h3>
                                  <div className="flex items-center gap-3 text-base text-gray-600">
                                    {elder.gender && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {elder.gender.charAt(0).toUpperCase()}{elder.gender.slice(1)}
                                      </span>
                                    )}
                                    {elder.dateOfBirth && (
                                      <span className="flex items-center gap-1">
                                        📅 {new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear()} years
                                      </span>
                                    )}
                                    {elder.bloodType && (
                                      <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                                        🩸 {elder.bloodType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${
                                  session.status === 'scheduled' 
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : session.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                  {session.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Main Content Section */}
                          <div className="p-6">
                            {/* Session Date & Time - Highlighted */}
                            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-purple-500 p-2 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Date</p>
                                    <p className="text-base font-semibold text-gray-900">
                                      {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-pink-500 p-2 rounded-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Time</p>
                                    <p className="text-base font-semibold text-gray-900">{session.sessionTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-500 p-2 rounded-lg">
                                    <Activity className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Duration</p>
                                    <p className="text-base font-semibold text-gray-900">{session.duration || 30} min</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Information</h4>
                                {elder.phone && (
                                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <Phone className="w-5 h-5 text-purple-600" />
                                    <div>
                                      <p className="text-sm text-gray-500">Primary Phone</p>
                                      <p className="text-base font-medium text-gray-900">{elder.phone}</p>
                                    </div>
                                  </div>
                                )}
                                {elder.emergencyContact && (
                                  <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <div>
                                      <p className="text-sm text-red-600 font-medium">Emergency Contact</p>
                                      <p className="text-base font-semibold text-red-900">{elder.emergencyContact}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Family Member</h4>
                                {familyMember.firstName ? (
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-green-500 p-2 rounded-full">
                                        <User className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-base font-semibold text-gray-900">
                                          {familyMember.firstName} {familyMember.lastName}
                                        </p>
                                        {familyMember.email && (
                                          <p className="text-sm text-gray-600">{familyMember.email}</p>
                                        )}
                                        {familyMember.phone && (
                                          <p className="text-sm text-gray-600">{familyMember.phone}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-base text-gray-500">No family member information</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Medical Conditions */}
                            {(elder.allergies || elder.chronicConditions || elder.currentMedications) && (
                              <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
                                <h4 className="text-base font-bold text-red-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5" />
                                  Important Medical Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {elder.allergies && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Allergies</p>
                                      <p className="text-base text-gray-900">{elder.allergies}</p>
                                    </div>
                                  )}
                                  {elder.chronicConditions && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-orange-600 mb-1">🏥 Chronic Conditions</p>
                                      <p className="text-base text-gray-900">{elder.chronicConditions}</p>
                                    </div>
                                  )}
                                  {elder.currentMedications && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-blue-600 mb-1">💊 Current Medications</p>
                                      <p className="text-base text-gray-900">{elder.currentMedications}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => handleViewElderDetails({ elder: session.elder })}
                                className="flex-1 min-w-[140px] px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-base"
                              >
                                <UserCircle className="w-5 h-5" />
                                Elder Details
                              </button>
                              {session.zoomJoinUrl && (
                                <button
                                  onClick={() => handleStartZoomMeeting(session)}
                                  className="flex-1 min-w-[140px] px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-base"
                                >
                                  <Video className="w-5 h-5" />
                                  Start Call
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Tabs Navigation */}
            <div className="mb-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-2 border border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'upcoming'
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Upcoming</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'upcoming' ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {upcomingConsultations.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('in-progress')}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'in-progress'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>In Progress</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'in-progress' ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {inProgressConsultations.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'completed'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'completed' ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {completedConsultations.length}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Consultations Section (Current Month + Next 2 Months) */}
            {activeTab === 'upcoming' && (
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {upcomingConsultations.map((appointment, index) => {
                      const elder = appointment.elder || {};
                      const familyMember = appointment.familyMember || {};
                      const { date, time } = formatDateTime(appointment.appointmentDate);
                      const appointmentAge = calculateAge(elder.dateOfBirth);
                      
                      return (
                        <div
                          key={appointment.id || index}
                          className="bg-white rounded-xl shadow-md border-l-4 hover:shadow-xl transition-all duration-300 overflow-hidden"
                          style={{
                            borderLeftColor: 
                              isToday(appointment.appointmentDate) ? '#10B981' :
                              appointment.priority === 'urgent' ? '#EF4444' :
                              appointment.priority === 'high' ? '#F59E0B' :
                              '#3B82F6'
                          }}
                        >
                          {/* Header Section with Patient Info and Status */}
                          <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                {elder.photo ? (
                                  <img 
                                    src={elder.photo} 
                                    alt={`${elder.firstName} ${elder.lastName}`}
                                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg border-4 border-white">
                                    <User className="w-8 h-8 text-white" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-bold text-2xl text-gray-900 mb-1">
                                    {elder.firstName || 'Unknown'} {elder.lastName || 'Patient'}
                                  </h3>
                                  <div className="flex items-center gap-3 text-base text-gray-600">
                                    {elder.gender && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {elder.gender.charAt(0).toUpperCase()}{elder.gender.slice(1)}
                                      </span>
                                    )}
                                    {appointmentAge && (
                                      <span className="flex items-center gap-1">
                                        📅 {appointmentAge} years
                                      </span>
                                    )}
                                    {elder.bloodType && (
                                      <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                                        🩸 {elder.bloodType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${
                                  isToday(appointment.appointmentDate)
                                    ? 'bg-green-100 text-green-800 border-green-200 animate-pulse'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                                }`}>
                                  {isToday(appointment.appointmentDate) ? '🔴 Today' : 'Upcoming'}
                                </span>
                                {appointment.priority && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    appointment.priority === 'urgent' 
                                      ? 'bg-red-100 text-red-800'
                                      : appointment.priority === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Main Content Section */}
                          <div className="p-6">
                            {/* Appointment Date & Time - Highlighted */}
                            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-500 p-2 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Date</p>
                                    <p className="text-base font-semibold text-gray-900">
                                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-500 p-2 rounded-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Time</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.appointmentTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-purple-500 p-2 rounded-lg">
                                    <Activity className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Duration</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.duration || 30} min</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Reason & Type */}
                            {(appointment.reason || appointment.type) && (
                              <div className="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-100">
                                <div className="grid grid-cols-1 gap-3">
                                  {appointment.type && (
                                    <div className="flex items-center gap-3">
                                      <Stethoscope className="w-5 h-5 text-amber-600" />
                                      <div>
                                        <p className="text-sm text-gray-500 font-medium uppercase">Type</p>
                                        <p className="text-base font-semibold text-gray-900 capitalize">{appointment.type}</p>
                                      </div>
                                    </div>
                                  )}
                                  {appointment.reason && (
                                    <div className="flex items-start gap-3">
                                      <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-500 font-medium uppercase mb-1">Reason</p>
                                        <p className="text-base text-gray-900">{appointment.reason}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Information</h4>
                                {elder.phone && (
                                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    <div>
                                      <p className="text-sm text-gray-500">Primary Phone</p>
                                      <p className="text-base font-medium text-gray-900">{elder.phone}</p>
                                    </div>
                                  </div>
                                )}
                                {elder.emergencyContact && (
                                  <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <div>
                                      <p className="text-sm text-red-600 font-medium">Emergency Contact</p>
                                      <p className="text-base font-semibold text-red-900">{elder.emergencyContact}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Family Member</h4>
                                {familyMember.firstName ? (
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-green-500 p-2 rounded-full">
                                        <User className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-base font-semibold text-gray-900">
                                          {familyMember.firstName} {familyMember.lastName}
                                        </p>
                                        {familyMember.email && (
                                          <p className="text-sm text-gray-600">{familyMember.email}</p>
                                        )}
                                        {familyMember.phone && (
                                          <p className="text-sm text-gray-600">{familyMember.phone}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-base text-gray-500">No family member information</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Medical Conditions */}
                            {(elder.allergies || elder.chronicConditions || elder.currentMedications) && (
                              <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
                                <h4 className="text-base font-bold text-red-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5" />
                                  Important Medical Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {elder.allergies && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Allergies</p>
                                      <p className="text-base text-gray-900">{elder.allergies}</p>
                                    </div>
                                  )}
                                  {elder.chronicConditions && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-orange-600 mb-1">🏥 Chronic Conditions</p>
                                      <p className="text-base text-gray-900">{elder.chronicConditions}</p>
                                    </div>
                                  )}
                                  {elder.currentMedications && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-blue-600 mb-1">💊 Current Medications</p>
                                      <p className="text-base text-gray-900">{elder.currentMedications}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons - 4 buttons for Upcoming */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
                              {/* Last Record Button */}
                              <button
                                onClick={() => handleViewLastRecord(appointment)}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                              >
                                <History className="w-4 h-4" />
                                <span className="hidden sm:inline">Last Record</span>
                                <span className="sm:hidden">Record</span>
                              </button>

                              {/* Schedule Session Button */}
                              <button
                                onClick={() => handleScheduleSession(appointment)}
                                disabled={!!appointment.zoomJoinUrl}
                                className={`px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md text-sm ${
                                  appointment.zoomJoinUrl
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                                }`}
                              >
                                <Calendar className="w-4 h-4" />
                                <span className="hidden sm:inline">{appointment.zoomJoinUrl ? 'Scheduled ✓' : 'Schedule'}</span>
                                <span className="sm:hidden">{appointment.zoomJoinUrl ? '✓' : 'Schedule'}</span>
                              </button>

                              {/* Start Session Button */}
                              <button
                                onClick={() => handleStartZoomMeeting(appointment)}
                                disabled={!appointment.zoomJoinUrl || !isToday(appointment.appointmentDate)}
                                className={`px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md text-sm ${
                                  appointment.zoomJoinUrl && isToday(appointment.appointmentDate)
                                    ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse hover:shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <Video className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                  {appointment.zoomJoinUrl && isToday(appointment.appointmentDate) ? 'Start Now' : 'Not Ready'}
                                </span>
                                <span className="sm:hidden">
                                  {appointment.zoomJoinUrl && isToday(appointment.appointmentDate) ? 'Start' : 'N/A'}
                                </span>
                              </button>

                              {/* Elder Details Button */}
                              <button
                                onClick={() => handleViewElderDetails(appointment)}
                                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                              >
                                <UserCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Elder Details</span>
                                <span className="sm:hidden">Details</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
            )}

            {/* In Progress Consultations Section (Today's Appointments) */}
            {activeTab === 'in-progress' && (
            <section id="in-progress-section" className="mb-8 scroll-mt-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-500/50">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        In Progress Consultations
                      </h3>
                      <p className="text-sm text-gray-600">
                        Today's active consultations
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                    <span className="text-sm font-semibold text-green-700">
                      {inProgressConsultations.length} Today
                    </span>
                  </div>
                </div>

                {inProgressConsultations.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlayCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-600 font-medium">No consultations in progress today</p>
                    <p className="text-sm text-gray-500 mt-1">Today's appointments will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {inProgressConsultations.map((appointment, index) => {
                      const elder = appointment.elder || {};
                      const familyMember = appointment.familyMember || {};
                      const { date, time } = formatDateTime(appointment.appointmentDate);
                      const appointmentAge = calculateAge(elder.dateOfBirth);
                      
                      return (
                        <div
                          key={appointment.id || index}
                          className="bg-white rounded-xl shadow-md border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                          {/* Header Section with Patient Info and Status */}
                          <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                {elder.photo ? (
                                  <img 
                                    src={elder.photo} 
                                    alt={`${elder.firstName} ${elder.lastName}`}
                                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg border-4 border-white">
                                    <User className="w-8 h-8 text-white" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-bold text-2xl text-gray-900 mb-1">
                                    {elder.firstName || 'Unknown'} {elder.lastName || 'Patient'}
                                  </h3>
                                  <div className="flex items-center gap-3 text-base text-gray-600">
                                    {elder.gender && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {elder.gender.charAt(0).toUpperCase()}{elder.gender.slice(1)}
                                      </span>
                                    )}
                                    {appointmentAge && (
                                      <span className="flex items-center gap-1">
                                        📅 {appointmentAge} years
                                      </span>
                                    )}
                                    {elder.bloodType && (
                                      <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                                        🩸 {elder.bloodType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex flex-col items-end gap-2">
                                <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm bg-green-100 text-green-800 border-green-200 animate-pulse">
                                  🔴 In Progress
                                </span>
                                {appointment.priority && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    appointment.priority === 'urgent' 
                                      ? 'bg-red-100 text-red-800'
                                      : appointment.priority === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Main Content Section */}
                          <div className="p-6">
                            {/* Appointment Date & Time - Highlighted */}
                            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-green-500 p-2 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Date</p>
                                    <p className="text-base font-semibold text-gray-900">Today</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-emerald-500 p-2 rounded-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Time</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.appointmentTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-teal-500 p-2 rounded-lg">
                                    <Activity className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Duration</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.duration || 30} min</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Reason & Type */}
                            {(appointment.reason || appointment.type) && (
                              <div className="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-100">
                                <div className="grid grid-cols-1 gap-3">
                                  {appointment.type && (
                                    <div className="flex items-center gap-3">
                                      <Stethoscope className="w-5 h-5 text-amber-600" />
                                      <div>
                                        <p className="text-sm text-gray-500 font-medium uppercase">Type</p>
                                        <p className="text-base font-semibold text-gray-900 capitalize">{appointment.type}</p>
                                      </div>
                                    </div>
                                  )}
                                  {appointment.reason && (
                                    <div className="flex items-start gap-3">
                                      <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-500 font-medium uppercase mb-1">Reason</p>
                                        <p className="text-base text-gray-900">{appointment.reason}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Information</h4>
                                {elder.phone && (
                                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="text-sm text-gray-500">Primary Phone</p>
                                      <p className="text-base font-medium text-gray-900">{elder.phone}</p>
                                    </div>
                                  </div>
                                )}
                                {elder.emergencyContact && (
                                  <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <div>
                                      <p className="text-sm text-red-600 font-medium">Emergency Contact</p>
                                      <p className="text-base font-semibold text-red-900">{elder.emergencyContact}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Family Member</h4>
                                {familyMember.firstName ? (
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-green-500 p-2 rounded-full">
                                        <User className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-base font-semibold text-gray-900">
                                          {familyMember.firstName} {familyMember.lastName}
                                        </p>
                                        {familyMember.email && (
                                          <p className="text-sm text-gray-600">{familyMember.email}</p>
                                        )}
                                        {familyMember.phone && (
                                          <p className="text-sm text-gray-600">{familyMember.phone}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-base text-gray-500">No family member information</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Medical Conditions */}
                            {(elder.allergies || elder.chronicConditions || elder.currentMedications) && (
                              <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
                                <h4 className="text-base font-bold text-red-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5" />
                                  Important Medical Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {elder.allergies && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Allergies</p>
                                      <p className="text-base text-gray-900">{elder.allergies}</p>
                                    </div>
                                  )}
                                  {elder.chronicConditions && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-orange-600 mb-1">🏥 Chronic Conditions</p>
                                      <p className="text-base text-gray-900">{elder.chronicConditions}</p>
                                    </div>
                                  )}
                                  {elder.currentMedications && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-blue-600 mb-1">💊 Current Medications</p>
                                      <p className="text-base text-gray-900">{elder.currentMedications}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* LIVE Badge and Action Buttons */}
                            <div className="pt-4 border-t-2 border-green-200">
                              {/* LIVE Indicator */}
                              <div className="mb-3 flex items-center gap-2 p-2 bg-red-50 border-2 border-red-500 rounded-lg animate-pulse">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="text-red-700 font-bold text-sm">🔴 LIVE - Consultation in Progress</span>
                              </div>

                              {/* Action Buttons - 3 buttons for In Progress */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Last Record Button */}
                                <button
                                  onClick={() => handleViewLastRecord(appointment)}
                                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                                >
                                  <History className="w-4 h-4" />
                                  <span>Last Record</span>
                                </button>

                                {/* Join Session Button */}
                                <button
                                  onClick={() => handleStartZoomMeeting(appointment)}
                                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm animate-pulse"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>Join Session</span>
                                </button>

                                {/* Elder Details Button */}
                                <button
                                  onClick={() => handleViewElderDetails(appointment)}
                                  className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                                >
                                  <UserCircle className="w-4 h-4" />
                                  <span>Elder Details</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
            )}

            {/* Completed Consultations Section */}
            {activeTab === 'completed' && (
            <section className="mb-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl shadow-lg shadow-gray-500/50">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                        Completed Consultations
                      </h3>
                      <p className="text-sm text-gray-600">
                        Past consultation records
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
                    <span className="text-sm font-semibold text-gray-700">
                      {completedConsultations.length} Completed
                    </span>
                  </div>
                </div>

                {completedConsultations.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-600 font-medium">No completed consultations</p>
                    <p className="text-sm text-gray-500 mt-1">Completed appointments will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {completedConsultations.map((appointment, index) => {
                      const elder = appointment.elder || {};
                      const familyMember = appointment.familyMember || {};
                      const { date, time } = formatDateTime(appointment.appointmentDate);
                      const appointmentAge = calculateAge(elder.dateOfBirth);
                      
                      return (
                        <div
                          key={appointment.id || index}
                          className="bg-white rounded-xl shadow-md border-l-4 border-l-gray-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                          {/* Header Section with Patient Info and Status */}
                          <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                {elder.photo ? (
                                  <img 
                                    src={elder.photo} 
                                    alt={`${elder.firstName} ${elder.lastName}`}
                                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg grayscale-[30%]"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg border-4 border-white">
                                    <User className="w-8 h-8 text-white" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-bold text-2xl text-gray-900 mb-1">
                                    {elder.firstName || 'Unknown'} {elder.lastName || 'Patient'}
                                  </h3>
                                  <div className="flex items-center gap-3 text-base text-gray-600">
                                    {elder.gender && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {elder.gender.charAt(0).toUpperCase()}{elder.gender.slice(1)}
                                      </span>
                                    )}
                                    {appointmentAge && (
                                      <span className="flex items-center gap-1">
                                        📅 {appointmentAge} years
                                      </span>
                                    )}
                                    {elder.bloodType && (
                                      <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                                        🩸 {elder.bloodType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="flex flex-col items-end gap-2">
                                <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm bg-gray-100 text-gray-800 border-gray-200">
                                  ✅ Completed
                                </span>
                                {appointment.priority && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    appointment.priority === 'urgent' 
                                      ? 'bg-red-100 text-red-800'
                                      : appointment.priority === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Main Content Section */}
                          <div className="p-6">
                            {/* Appointment Date & Time - Highlighted */}
                            <div className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-gray-500 p-2 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Date</p>
                                    <p className="text-base font-semibold text-gray-900">
                                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-gray-600 p-2 rounded-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Time</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.appointmentTime}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-gray-700 p-2 rounded-lg">
                                    <Activity className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase">Duration</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.duration || 30} min</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Reason & Type */}
                            {(appointment.reason || appointment.type) && (
                              <div className="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-100">
                                <div className="grid grid-cols-1 gap-3">
                                  {appointment.type && (
                                    <div className="flex items-center gap-3">
                                      <Stethoscope className="w-5 h-5 text-amber-600" />
                                      <div>
                                        <p className="text-sm text-gray-500 font-medium uppercase">Type</p>
                                        <p className="text-base font-semibold text-gray-900 capitalize">{appointment.type}</p>
                                      </div>
                                    </div>
                                  )}
                                  {appointment.reason && (
                                    <div className="flex items-start gap-3">
                                      <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-500 font-medium uppercase mb-1">Reason</p>
                                        <p className="text-base text-gray-900">{appointment.reason}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Information</h4>
                                {elder.phone && (
                                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-600" />
                                    <div>
                                      <p className="text-sm text-gray-500">Primary Phone</p>
                                      <p className="text-base font-medium text-gray-900">{elder.phone}</p>
                                    </div>
                                  </div>
                                )}
                                {elder.emergencyContact && (
                                  <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <div>
                                      <p className="text-sm text-red-600 font-medium">Emergency Contact</p>
                                      <p className="text-base font-semibold text-red-900">{elder.emergencyContact}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Family Member</h4>
                                {familyMember.firstName ? (
                                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-green-500 p-2 rounded-full">
                                        <User className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-base font-semibold text-gray-900">
                                          {familyMember.firstName} {familyMember.lastName}
                                        </p>
                                        {familyMember.email && (
                                          <p className="text-sm text-gray-600">{familyMember.email}</p>
                                        )}
                                        {familyMember.phone && (
                                          <p className="text-sm text-gray-600">{familyMember.phone}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-base text-gray-500">No family member information</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Medical Conditions */}
                            {(elder.allergies || elder.chronicConditions || elder.currentMedications) && (
                              <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
                                <h4 className="text-base font-bold text-red-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5" />
                                  Important Medical Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {elder.allergies && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Allergies</p>
                                      <p className="text-base text-gray-900">{elder.allergies}</p>
                                    </div>
                                  )}
                                  {elder.chronicConditions && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-orange-600 mb-1">🏥 Chronic Conditions</p>
                                      <p className="text-base text-gray-900">{elder.chronicConditions}</p>
                                    </div>
                                  )}
                                  {elder.currentMedications && (
                                    <div className="bg-white p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-blue-600 mb-1">💊 Current Medications</p>
                                      <p className="text-base text-gray-900">{elder.currentMedications}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons - 4 buttons for Completed */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
                              {/* Last Record Button */}
                              <button
                                onClick={() => handleViewLastRecord(appointment)}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                              >
                                <History className="w-4 h-4" />
                                <span className="hidden sm:inline">Last Record</span>
                                <span className="sm:hidden">Record</span>
                              </button>

                              {/* Elder Details Button */}
                              <button
                                onClick={() => handleViewElderDetails(appointment)}
                                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                              >
                                <UserCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Elder Details</span>
                                <span className="sm:hidden">Details</span>
                              </button>

                              {/* Upload Record Button */}
                              <button
                                onClick={() => handleUploadRecord(appointment)}
                                className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                              >
                                <Upload className="w-4 h-4" />
                                <span className="hidden sm:inline">Upload Record</span>
                                <span className="sm:hidden">Upload</span>
                              </button>

                              {/* Upload Prescription Button */}
                              <button
                                onClick={() => handleUploadPrescription(appointment)}
                                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                              >
                                <Pill className="w-4 h-4" />
                                <span className="hidden sm:inline">Upload Prescription</span>
                                <span className="sm:hidden">Rx</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
            )}

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

        {/* Last Record Modal */}
        <LastRecordModal
          isOpen={showLastRecordModal}
          onClose={() => {
            setShowLastRecordModal(false);
            setSelectedConsultation(null);
          }}
          elderId={selectedConsultation?.elderId}
          elderName={`${selectedConsultation?.elder?.firstName || ''} ${selectedConsultation?.elder?.lastName || ''}`.trim()}
        />

        {/* Schedule Session Modal */}
        <ScheduleSessionModal
          isOpen={showScheduleSessionModal}
          onClose={() => {
            setShowScheduleSessionModal(false);
            setSelectedConsultation(null);
          }}
          appointment={selectedConsultation}
          onScheduled={() => {
            loadConsultations();
            setShowScheduleSessionModal(false);
            toast.success('Session scheduled successfully!');
          }}
        />

        {/* Upload Record Modal */}
        <UploadRecordModal
          isOpen={showUploadRecordModal}
          onClose={() => {
            setShowUploadRecordModal(false);
            setSelectedConsultation(null);
          }}
          appointment={selectedConsultation}
        />

        {/* Upload Prescription Modal */}
        <UploadPrescriptionModal
          isOpen={showUploadPrescriptionModal}
          onClose={() => {
            setShowUploadPrescriptionModal(false);
            setSelectedConsultation(null);
          }}
          appointment={selectedConsultation}
        />
      </div>
    </RoleLayout>
  );
};

export default ConsultationHistory;