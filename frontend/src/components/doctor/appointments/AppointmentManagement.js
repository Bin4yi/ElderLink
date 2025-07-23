// frontend/src/components/doctor/appointments/AppointmentManagement.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';
import DoctorScheduleManager from './DoctorScheduleManager';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageSquare,
  Edit,
  Ban,
  Loader,
  Filter,
  Heart,
  Brain,
  Shield,
  Activity,
  Star,
  Timer,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Plus,
  RefreshCw,
  Stethoscope,
  FileText,
  TrendingUp
} from 'lucide-react';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [monthlySessions, setMonthlySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlySessionsLoading, setMonthlySessionsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedMonthlySession, setSelectedMonthlySession] = useState(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [sessionTimer, setSessionTimer] = useState({});
  const [activeTimers, setActiveTimers] = useState({});

  const today = new Date().toISOString().split('T')[0];

  // Mock family doctor data
  const familyDoctor = {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "General Medicine & Family Care",
    experience: "15 years",
    rating: 4.8,
    phone: "+1-555-0123",
    email: "dr.johnson@elderlink.com",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    licenseNumber: "MD-12345",
    hospital: "ElderLink Medical Center",
    education: "Harvard Medical School",
    availability: "Mon-Fri: 9:00 AM - 5:00 PM",
    bio: "Dr. Sarah Johnson is a dedicated family physician with over 15 years of experience in geriatric care."
  };

  // Mock monthly sessions data
  const mockMonthlySessions = [
    {
      id: 1,
      title: "Monthly Health Check-up - July",
      date: "2025-07-23",
      time: "10:00",
      duration: 45,
      type: "health",
      status: "completed",
      doctor: familyDoctor,
      elder: {
        name: "Margaret Smith",
        age: 78,
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      notes: "Comprehensive monthly health assessment completed. All vital signs within normal range.",
      sessionSummary: "Blood pressure: 120/80, Heart rate: 72 bpm, Temperature: 98.6°F, Weight: 145 lbs",
      vitalSigns: {
        bloodPressure: "120/80",
        heartRate: "72 bpm",
        temperature: "98.6°F",
        weight: "145 lbs",
        glucose: "95 mg/dL"
      }
    },
    {
      id: 2,
      title: "Monthly Health Check-up - August",
      date: "2025-08-23",
      time: "10:00",
      duration: 45,
      type: "health",
      status: "scheduled",
      doctor: familyDoctor,
      elder: {
        name: "Margaret Smith",
        age: 78,
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      notes: "Scheduled monthly health assessment and medication review.",
      sessionSummary: ""
    },
    {
      id: 3,
      title: "Monthly Health Check-up - September",
      date: "2025-09-23",
      time: "10:00",
      duration: 45,
      type: "health",
      status: "in-progress",
      doctor: familyDoctor,
      elder: {
        name: "Robert Johnson",
        age: 82,
        photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face"
      },
      notes: "Currently conducting monthly health assessment.",
      sessionSummary: "Session in progress - checking vitals and reviewing medications"
    }
  ];

  useEffect(() => {
    loadAppointments();
    loadMonthlySessions();
  }, [filter]);

  // Timer functionality
  useEffect(() => {
    const intervals = {};
    
    Object.keys(activeTimers).forEach(sessionId => {
      if (activeTimers[sessionId]) {
        intervals[sessionId] = setInterval(() => {
          setSessionTimer(prev => ({
            ...prev,
            [sessionId]: (prev[sessionId] || 0) + 1
          }));
        }, 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [activeTimers]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading appointments with filter:', filter);

      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      console.log('📋 Calling doctorAppointmentService.getDoctorAppointments with params:', params);
      
      const response = await doctorAppointmentService.getDoctorAppointments(params);
      
      console.log('📋 Appointments API response:', response);

      if (response && response.success !== false) {
        const appointmentsData = response.appointments || response.data || response || [];
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        console.log('✅ Loaded appointments:', appointmentsData.length);
      } else {
        console.error('❌ API returned error:', response?.message);
        toast.error(response?.message || 'Failed to load appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Network error. Please check your connection.');
      } else if (error.response?.status === 404) {
        toast.error('Appointments endpoint not found. Please check backend routes.');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login again.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load appointments');
      }
      
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlySessions = async () => {
    try {
      setMonthlySessionsLoading(true);
      
      // For now, use mock data. In real implementation, this would call an API
      // const response = await doctorAppointmentService.getMonthlySessions();
      
      // Simulate API call
      setTimeout(() => {
        setMonthlySessions(mockMonthlySessions);
        setMonthlySessionsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error loading monthly sessions:', error);
      toast.error('Failed to load monthly sessions');
      setMonthlySessions([]);
      setMonthlySessionsLoading(false);
    }
  };

  // Timer functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (sessionId) => {
    setActiveTimers(prev => ({ ...prev, [sessionId]: true }));
    toast.success('Session timer started');
  };

  const pauseTimer = (sessionId) => {
    setActiveTimers(prev => ({ ...prev, [sessionId]: false }));
    toast.info('Session timer paused');
  };

  const stopTimer = (sessionId) => {
    setActiveTimers(prev => ({ ...prev, [sessionId]: false }));
    setSessionTimer(prev => ({ ...prev, [sessionId]: 0 }));
    toast.success('Session timer stopped');
  };

  // Handle appointment actions (approve/reject)
  const handleAppointmentAction = async (appointmentId, action, notes = '') => {
    try {
      setActionLoading(true);
      
      console.log('🔄 Handling appointment action:', { appointmentId, action, notes });
      
      const response = await doctorAppointmentService.reviewAppointment(
        appointmentId, 
        action, 
        notes
      );
      
      if (response && response.success !== false) {
        toast.success(`Appointment ${action}d successfully`);
        loadAppointments();
        setSelectedAppointment(null);
      } else {
        toast.error(response?.message || `Failed to ${action} appointment`);
      }
    } catch (error) {
      console.error(`❌ Error ${action}ing appointment:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} appointment`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reschedule
  const handleRescheduleSubmit = async () => {
    if (!rescheduleDateTime) {
      toast.error('Please select a new date and time');
      return;
    }

    try {
      setActionLoading(true);
      
      console.log('🔄 Rescheduling appointment:', {
        appointmentId: selectedAppointment.id,
        newDateTime: rescheduleDateTime,
        reason: rescheduleReason
      });
      
      const response = await doctorAppointmentService.rescheduleAppointment(
        selectedAppointment.id,
        {
          newDateTime: rescheduleDateTime,
          reason: rescheduleReason
        }
      );
      
      if (response && response.success !== false) {
        toast.success('Appointment rescheduled successfully');
        loadAppointments();
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        setRescheduleDateTime('');
        setRescheduleReason('');
      } else {
        toast.error(response?.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('❌ Error rescheduling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  // Date helper functions
  const getDateOnly = (dateStr) => {
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };
  
  const isToday = (dateStr) => getDateOnly(dateStr) === today;
  const isFuture = (dateStr) => getDateOnly(dateStr) > today;
  const isPast = (dateStr) => getDateOnly(dateStr) < today;

  // Filter monthly sessions by date
  const todayMonthlySessions = monthlySessions.filter(
    s => ['scheduled', 'in-progress'].includes(s.status) && isToday(s.date)
  );

  const upcomingMonthlySessions = monthlySessions.filter(
    s => ['scheduled'].includes(s.status) && isFuture(s.date)
  );

  const completedMonthlySessions = monthlySessions.filter(
    s => s.status === 'completed'
  );

  // Filter appointments by date
  const todayAppointments = appointments.filter(
    a => ['approved', 'pending'].includes(a.status) && isToday(a.appointmentDate)
  );

  const upcomingAppointments = appointments.filter(
    a => ['approved', 'pending'].includes(a.status) && isFuture(a.appointmentDate)
  );

  const otherAppointments = appointments.filter(
    a => !todayAppointments.includes(a) && !upcomingAppointments.includes(a)
  );

  // Format date and time
  const formatDateTime = (dateString) => {
    try {
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
    } catch {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      'no-show': 'bg-gray-100 text-gray-800 border-gray-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSessionIcon = (type) => {
    switch (type) {
      case 'health': return <Heart className="w-5 h-5" />;
      case 'mental': return <Brain className="w-5 h-5" />;
      case 'specialist': return <Shield className="w-5 h-5" />;
      case 'therapy': return <Activity className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  // Render monthly session card
  const renderMonthlySessionCard = (session) => {
    return (
      <div
        key={session.id}
        className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500"
        onClick={() => setSelectedMonthlySession(session)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100">
              {getSessionIcon(session.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
              <p className="text-sm text-gray-600">{session.elder.name}, {session.elder.age} years</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('-', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{new Date(session.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{session.time} ({session.duration} min)</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <img
              src={session.doctor.avatar}
              alt={session.doctor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{session.doctor.name}</p>
              <p className="text-sm text-gray-600">{session.doctor.specialization}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{session.doctor.rating}</span>
            </div>
          </div>
        </div>

        {/* Timer Section */}
        {session.status === 'in-progress' && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Session Timer</span>
              </div>
              <div className="text-2xl font-mono font-bold text-blue-600">
                {formatTime(sessionTimer[session.id] || 0)}
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              {!activeTimers[session.id] ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startTimer(session.id);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    pauseTimer(session.id);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <PauseCircle className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stopTimer(session.id);
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        )}

        {session.notes && (
          <div className="text-sm text-gray-600 bg-green-50 rounded-lg p-3">
            <strong>Notes:</strong> {session.notes}
          </div>
        )}

        {session.vitalSigns && session.status === 'completed' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Vital Signs</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>BP: {session.vitalSigns.bloodPressure}</div>
              <div>HR: {session.vitalSigns.heartRate}</div>
              <div>Temp: {session.vitalSigns.temperature}</div>
              <div>Weight: {session.vitalSigns.weight}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    const { date, time } = formatDateTime(appointment.appointmentDate);
    const elder = appointment.elder || {};
    const familyMember = appointment.familyMember || {};

    return (
      <div
        key={appointment.id}
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
                  {elder.firstName || 'Unknown'} {elder.lastName || 'Patient'}
                </h3>
                <p className="text-sm text-gray-500">
                  {elder.gender && `${elder.gender.charAt(0).toUpperCase()}${elder.gender.slice(1)}`}
                  {elder.dateOfBirth && ` • ${new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear()} years old`}
                </p>
              </div>
            </div>

            {/* Appointment Details */}
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
                  <span className="text-sm capitalize">{appointment.type || 'consultation'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {elder.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{elder.phone}</span>
                  </div>
                )}
                {elder.emergencyContact && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">Emergency: {elder.emergencyContact}</span>
                  </div>
                )}
                {familyMember.firstName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Family: {familyMember.firstName} {familyMember.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason and Symptoms */}
            <div className="space-y-2">
              {appointment.reason && (
                <p className="text-gray-700">
                  <span className="font-medium">Reason:</span> {appointment.reason}
                </p>
              )}
              {appointment.symptoms && (
                <p className="text-gray-700">
                  <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                </p>
              )}
              {appointment.notes && (
                <p className="text-gray-700">
                  <span className="font-medium">Notes:</span> {appointment.notes}
                </p>
              )}
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex flex-col items-end gap-3 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(appointment.status)}`}>
              {(appointment.status || 'pending').replace('-', ' ').toUpperCase()}
            </span>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedAppointment(appointment)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View Details
              </button>

              {appointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                    disabled={actionLoading}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {actionLoading ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAppointmentAction(appointment.id, 'reject', 'Rejected by doctor')}
                    disabled={actionLoading}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {actionLoading ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    Reject
                  </button>
                </>
              )}

              {appointment.status === 'approved' && isFuture(appointment.appointmentDate) && (
                <button
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowRescheduleModal(true);
                  }}
                  disabled={actionLoading}
                  className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Reschedule
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showScheduleManager) {
    return (
      <RoleLayout>
        <div className="p-6">
          <button
            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
            onClick={() => setShowScheduleManager(false)}
          >
            ← Back to Appointments
          </button>
          <DoctorScheduleManager />
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Appointments & Sessions</h2>
            <p className="text-gray-600 mt-1">Manage your patient appointments and monthly health sessions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadMonthlySessions}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Sessions
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              onClick={() => setShowScheduleManager(true)}
            >
              <Calendar className="w-4 h-4" />
              Manage Availability
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 flex-wrap items-center">
          <Filter className="w-5 h-5 text-gray-500" />
          {[
            { value: 'all', label: 'All', icon: null },
            { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
            { value: 'approved', label: 'Approved', icon: <CheckCircle className="w-4 h-4" /> },
            { value: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
            { value: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> }
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors flex items-center gap-2 ${
                filter === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {(loading || monthlySessionsLoading) ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Loading appointments and sessions...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Today's Monthly Sessions */}
            {todayMonthlySessions.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🏥 Today's Monthly Sessions ({todayMonthlySessions.length})
                </h3>
                <div className="space-y-4">
                  {todayMonthlySessions.map(renderMonthlySessionCard)}
                </div>
              </section>
            )}

            {/* Today's Appointments */}
            {todayAppointments.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📅 Today's Appointments ({todayAppointments.length})
                </h3>
                <div className="space-y-4">
                  {todayAppointments.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Upcoming Monthly Sessions */}
            {upcomingMonthlySessions.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🗓️ Upcoming Monthly Sessions ({upcomingMonthlySessions.length})
                </h3>
                <div className="space-y-4">
                  {upcomingMonthlySessions.map(renderMonthlySessionCard)}
                </div>
              </section>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  ⏳ Upcoming Appointments ({upcomingAppointments.length})
                </h3>
                <div className="space-y-4">
                  {upcomingAppointments.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Completed Monthly Sessions */}
            {completedMonthlySessions.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  ✅ Completed Monthly Sessions ({completedMonthlySessions.length})
                </h3>
                <div className="space-y-4">
                  {completedMonthlySessions.map(renderMonthlySessionCard)}
                </div>
              </section>
            )}

            {/* Other Appointments */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📋 Other Appointments ({otherAppointments.length})
              </h3>
              {otherAppointments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No other appointments found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {otherAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </section>

            {/* No Data Message */}
            {appointments.length === 0 && monthlySessions.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments or sessions found</h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'all' 
                    ? "You don't have any appointments or monthly sessions yet." 
                    : `No ${filter} appointments or sessions found.`
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Appointments and sessions will appear here when patients book with you.
                </p>
              </div>
            )}
          </>
        )}

        {/* Modal: View Appointment Details */}
        {selectedAppointment && !showRescheduleModal && (
          <Modal onClose={() => setSelectedAppointment(null)}>
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Appointment Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Patient Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedAppointment.elder?.firstName} {selectedAppointment.elder?.lastName}</p>
                    <p><strong>Gender:</strong> {selectedAppointment.elder?.gender || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> {selectedAppointment.elder?.dateOfBirth ? new Date(selectedAppointment.elder.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedAppointment.elder?.phone || 'N/A'}</p>
                    <p><strong>Emergency Contact:</strong> {selectedAppointment.elder?.emergencyContact || 'N/A'}</p>
                    <p><strong>Blood Type:</strong> {selectedAppointment.elder?.bloodType || 'N/A'}</p>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Appointment Information</h3>
                  <div className="space-y-2">
                    <p><strong>Date:</strong> {formatDateTime(selectedAppointment.appointmentDate).date}</p>
                    <p><strong>Time:</strong> {formatDateTime(selectedAppointment.appointmentDate).time}</p>
                    <p><strong>Duration:</strong> {selectedAppointment.duration || 30} minutes</p>
                    <p><strong>Type:</strong> {selectedAppointment.type}</p>
                    <p><strong>Priority:</strong> {selectedAppointment.priority}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(selectedAppointment.status)}`}>
                      {selectedAppointment.status.toUpperCase()}
                    </span></p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Medical Information</h3>
                <div className="space-y-3">
                  <div>
                    <strong>Reason for Visit:</strong>
                    <p className="text-gray-700 mt-1">{selectedAppointment.reason}</p>
                  </div>
                  {selectedAppointment.symptoms && (
                    <div>
                      <strong>Symptoms:</strong>
                      <p className="text-gray-700 mt-1">{selectedAppointment.symptoms}</p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div>
                      <strong>Patient Notes:</strong>
                      <p className="text-gray-700 mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  {selectedAppointment.doctorNotes && (
                    <div>
                      <strong>Doctor Notes:</strong>
                      <p className="text-gray-700 mt-1">{selectedAppointment.doctorNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedAppointment.status === 'pending' && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => handleAppointmentAction(selectedAppointment.id, 'reject', 'Rejected by doctor')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                  <button
                    onClick={() => handleAppointmentAction(selectedAppointment.id, 'approve')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Modal: View Monthly Session Details */}
        {selectedMonthlySession && (
          <Modal onClose={() => setSelectedMonthlySession(null)}>
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                Monthly Session Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-green-800">Patient Information</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    {selectedMonthlySession.elder.photo ? (
                      <img 
                        src={selectedMonthlySession.elder.photo} 
                        alt={selectedMonthlySession.elder.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-lg">{selectedMonthlySession.elder.name}</h4>
                      <p className="text-gray-600">{selectedMonthlySession.elder.age} years old</p>
                    </div>
                  </div>
                </div>

                {/* Session Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-green-800">Session Information</h3>
                  <div className="space-y-2">
                    <p><strong>Date:</strong> {new Date(selectedMonthlySession.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedMonthlySession.time}</p>
                    <p><strong>Duration:</strong> {selectedMonthlySession.duration} minutes</p>
                    <p><strong>Type:</strong> {selectedMonthlySession.type.charAt(0).toUpperCase() + selectedMonthlySession.type.slice(1)} Session</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(selectedMonthlySession.status)}`}>
                      {selectedMonthlySession.status.charAt(0).toUpperCase() + selectedMonthlySession.status.slice(1).replace('-', ' ')}
                    </span></p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-lg mb-3 text-green-800">Family Doctor</h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedMonthlySession.doctor.avatar}
                    alt={selectedMonthlySession.doctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedMonthlySession.doctor.name}</p>
                    <p className="text-sm text-gray-600">{selectedMonthlySession.doctor.specialization}</p>
                    <p className="text-xs text-gray-500">{selectedMonthlySession.doctor.experience} experience</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{selectedMonthlySession.doctor.rating}</span>
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2 text-green-800">Session Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedMonthlySession.notes}</p>
                </div>
                {selectedMonthlySession.sessionSummary && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Session Summary</h4>
                    <p className="text-blue-800">{selectedMonthlySession.sessionSummary}</p>
                  </div>
                )}
              </div>

              {/* Vital Signs (if completed) */}
              {selectedMonthlySession.vitalSigns && selectedMonthlySession.status === 'completed' && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 text-green-800">Vital Signs Recorded</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-sm text-red-600 font-medium">Blood Pressure</div>
                      <div className="text-lg font-bold text-red-700">{selectedMonthlySession.vitalSigns.bloodPressure}</div>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg text-center">
                      <div className="text-sm text-pink-600 font-medium">Heart Rate</div>
                      <div className="text-lg font-bold text-pink-700">{selectedMonthlySession.vitalSigns.heartRate}</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-sm text-orange-600 font-medium">Temperature</div>
                      <div className="text-lg font-bold text-orange-700">{selectedMonthlySession.vitalSigns.temperature}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-sm text-purple-600 font-medium">Weight</div>
                      <div className="text-lg font-bold text-purple-700">{selectedMonthlySession.vitalSigns.weight}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedMonthlySession(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedMonthlySession.status === 'scheduled' && (
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Start Session
                  </button>
                )}
                {selectedMonthlySession.status === 'in-progress' && (
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Complete Session
                  </button>
                )}
                {selectedMonthlySession.status === 'completed' && (
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Reschedule Appointment */}
        {showRescheduleModal && selectedAppointment && (
          <Modal onClose={() => setShowRescheduleModal(false)}>
            <div className="max-w-md">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Reschedule Appointment
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Current Date & Time:
                  </label>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded">
                    {formatDateTime(selectedAppointment.appointmentDate).date} at {formatDateTime(selectedAppointment.appointmentDate).time}
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    New Date and Time: *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={rescheduleDateTime}
                    onChange={e => setRescheduleDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Reason for Reschedule (optional):
                  </label>
                  <textarea
                    rows="3"
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={rescheduleReason}
                    onChange={e => setRescheduleReason(e.target.value)}
                    placeholder="Enter reason for rescheduling..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    onClick={() => setShowRescheduleModal(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    onClick={handleRescheduleSubmit}
                    disabled={actionLoading || !rescheduleDateTime}
                  >
                    {actionLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Rescheduling...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        Reschedule
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </RoleLayout>
  );
};

export default AppointmentManagement;