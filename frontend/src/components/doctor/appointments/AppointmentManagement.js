// frontend/src/components/doctor/appointments/AppointmentManagement.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';
import DoctorScheduleManager from './DoctorScheduleManager';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  isToday, 
  startOfWeek, 
  endOfWeek,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';
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
  Ban,
  Loader,
  Filter,
  RefreshCw,
  Stethoscope,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Search
} from 'lucide-react';


const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all', // all, today, week, month
    priority: 'all'
  });

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadAppointments();
  }, []); // Only load once on mount - filtering happens on frontend



  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading all appointments (filtering will be done on frontend)');

      // Load ALL appointments without backend filtering
      // All filtering (status, date range, search, priority) will be done on frontend
      const params = {};

      console.log('📋 Calling doctorAppointmentService.getDoctorAppointments with params:', params);
      
      const response = await doctorAppointmentService.getDoctorAppointments(params);
      
      console.log('📋 Appointments API response:', response);

      if (response && response.success !== false) {
        const appointmentsData = response.appointments || response.data || response || [];
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
        setLastRefresh(new Date());
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

  // Get filtered appointments based on search, priority, status and dateRange
  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(apt => {
        const elderName = `${apt.elder?.firstName || ''} ${apt.elder?.lastName || ''}`.toLowerCase();
        const reason = (apt.reason || '').toLowerCase();
        const symptoms = (apt.symptoms || '').toLowerCase();
        return elderName.includes(searchLower) || 
               reason.includes(searchLower) || 
               symptoms.includes(searchLower);
      });
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(apt => apt.priority === filters.priority);
    }

    // Status filter - use the same date-based calculated status used for badges
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(apt => {
        const calculatedStatus = getAppointmentStatus(apt.appointmentDate);

        // If user explicitly filters for in-progress or cancelled, use the stored status field
        if (filters.status === 'in-progress' || filters.status === 'cancelled') {
          return apt.status === filters.status;
        }

        // For upcoming/today/completed rely on calculated date-based status
        return calculatedStatus === filters.status;
      });
    }

    // Date range filter handled in backend for some ranges, but we also support 'today' on frontend
    if (filters.dateRange === 'today') {
      filtered = filtered.filter(apt => isTodayDate(apt.appointmentDate));
    }

    return filtered;
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

  // Handle postpone appointment (clear date, let family reschedule)
  const handlePostponeAppointment = async (appointmentId) => {
    const reason = prompt('Please provide a reason for postponing (optional):');
    
    // User cancelled the prompt
    if (reason === null) return;

    try {
      setActionLoading(true);
      
      console.log('⏸️  Postponing appointment:', { appointmentId, reason });
      
      const response = await doctorAppointmentService.postponeAppointment(appointmentId, reason);
      
      if (response && response.success !== false) {
        toast.success('Appointment postponed. Family member will be notified to reschedule.');
        loadAppointments();
        setSelectedAppointment(null);
      } else {
        toast.error(response?.message || 'Failed to postpone appointment');
      }
    } catch (error) {
      console.error('❌ Error postponing appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to postpone appointment');
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
  
  const isTodayDate = (dateStr) => getDateOnly(dateStr) === today;
  const isFuture = (dateStr) => getDateOnly(dateStr) > today;
  const isPast = (dateStr) => getDateOnly(dateStr) < today;

  // Calendar generation
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => {
      const aptDate = getDateOnly(apt.appointmentDate);
      return aptDate === dateStr;
    });
  };

  // Group appointments by date for organized display
  const groupedAppointments = () => {
    const filtered = getFilteredAppointments();
    const grouped = {
      today: [],
      upcoming: [],
      past: []
    };

    filtered.forEach(apt => {
      if (isTodayDate(apt.appointmentDate)) {
        grouped.today.push(apt);
      } else if (isFuture(apt.appointmentDate)) {
        grouped.upcoming.push(apt);
      } else {
        grouped.past.push(apt);
      }
    });

    // Sort by date/time
    grouped.today.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    grouped.upcoming.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    grouped.past.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    return grouped;
  };

  // Scroll to specific appointment
  const scrollToAppointment = (appointmentId) => {
    const element = document.getElementById(`appointment-${appointmentId}`);
    if (element) {
      // Hide calendar first
      setShowCalendar(false);
      
      // Small delay to ensure calendar is hidden before scrolling
      setTimeout(() => {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add a highlight effect
        element.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
        }, 2000);
      }, 100);
    }
  };

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

  // Determine status based on appointment date
  const getAppointmentStatus = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const aptDate = new Date(appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    
    const diffTime = aptDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'completed'; // Past appointments
    } else if (diffDays === 0) {
      return 'today'; // Today's appointments
    } else {
      return 'upcoming'; // Future appointments
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'today':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="relative w-2 h-2 bg-red-600 rounded-full"></div>
          </div>
        );
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      today: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get priority badge styling
  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      normal: 'bg-blue-100 text-blue-800 border-blue-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return priorityStyles[priority] || priorityStyles.normal;
  };

  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    const { date, time } = formatDateTime(appointment.appointmentDate);
    const elder = appointment.elder || {};
    const familyMember = appointment.familyMember || {};
    const calculatedStatus = getAppointmentStatus(appointment.appointmentDate);

    return (
      <div
        key={appointment.id}
        id={`appointment-${appointment.id}`}
        className="bg-white rounded-xl shadow-md border-l-4 hover:shadow-xl transition-all duration-300 overflow-hidden scroll-mt-20"
        style={{
          borderLeftColor: 
            calculatedStatus === 'upcoming' ? '#F59E0B' :
            calculatedStatus === 'today' ? '#EF4444' :
            calculatedStatus === 'completed' ? '#10B981' :
            '#EF4444'
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg border-4 border-white">
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
              <div className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm flex items-center gap-2 ${getStatusBadge(calculatedStatus)}`}>
                {getStatusIcon(calculatedStatus)}
                <span>{calculatedStatus.charAt(0).toUpperCase() + calculatedStatus.slice(1)}</span>
              </div>
              {appointment.priority && appointment.priority !== 'normal' && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getPriorityBadge(appointment.priority)}`}>
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
                  <p className="text-base font-semibold text-gray-900">{date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase">Time</p>
                  <p className="text-base font-semibold text-gray-900">{time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase">Type</p>
                  <p className="text-base font-semibold text-gray-900 capitalize">{appointment.type || 'consultation'}</p>
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

          {/* Medical Information - Highlighted */}
          {(appointment.reason || appointment.symptoms || appointment.notes) && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-5 border border-amber-200">
              <h4 className="text-base font-bold text-amber-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Medical Information
              </h4>
              <div className="space-y-3">
                {appointment.reason && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-1">Reason for Visit</p>
                    <p className="text-base text-gray-900 font-medium">{appointment.reason}</p>
                  </div>
                )}
                {appointment.symptoms && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-1">Reported Symptoms</p>
                    <p className="text-base text-gray-900">{appointment.symptoms}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-1">Patient Notes</p>
                    <p className="text-base text-gray-900">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
              onClick={() => setSelectedAppointment(appointment)}
              className="flex-1 min-w-[140px] px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-base"
            >
              <Eye className="w-5 h-5" />
              View Full Details
            </button>

            {/* Postpone Button - Only show for upcoming appointments */}
            {calculatedStatus === 'upcoming' && (
              <button
                onClick={() => handlePostponeAppointment(appointment.id)}
                disabled={actionLoading}
                className="flex-1 min-w-[140px] px-5 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-base"
              >
                <Clock className="w-5 h-5" />
                {actionLoading ? 'Processing...' : 'Postpone'}
              </button>
            )}

            {/* REMOVED: Approve/Reject buttons - No longer needed */}
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

  // Get stats for the dashboard - ALWAYS use all appointments, never filtered
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const aptDate = new Date(a.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate > today; // Future dates only
    }).length,
    today: appointments.filter(a => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const aptDate = new Date(a.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime(); // Today's appointments
    }).length,
    inProgress: appointments.filter(a => a.status === 'in-progress').length,
    completed: appointments.filter(a => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const aptDate = new Date(a.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      // Completed if: past date OR explicitly marked as completed
      return aptDate < today || a.status === 'completed';
    }).length
  };

  return (
    <RoleLayout>
      <div className="px-3 py-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Appointments</h2>
            <p className="text-gray-600 mt-1">
              Manage your patient appointments and schedule
              <span className="ml-3 text-sm text-gray-500">
                • Last updated: {format(lastRefresh, 'h:mm:ss a')}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                loadAppointments();
                toast.success('Refreshing appointments...');
              }}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showCalendar 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              onClick={() => setShowScheduleManager(true)}
            >
              <Stethoscope className="w-4 h-4" />
              Manage Availability
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <Stethoscope className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {showCalendar && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {generateCalendarDays().map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isTodayDay = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-2 border rounded-lg transition-all ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isTodayDay ? 'border-blue-500 border-2' : 'border-gray-200'} ${
                      dayAppointments.length > 0 ? 'hover:shadow-md cursor-pointer' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isTodayDay ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    {dayAppointments.length > 0 && (
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((apt, i) => (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToAppointment(apt.id);
                            }}
                            className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                              getAppointmentStatus(apt.appointmentDate) === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                              getAppointmentStatus(apt.appointmentDate) === 'today' ? 'bg-red-100 text-red-800' :
                              getAppointmentStatus(apt.appointmentDate) === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                            title={`Click to view: ${apt.elder?.firstName} ${apt.elder?.lastName}`}
                          >
                            {format(new Date(apt.appointmentDate), 'HH:mm')} - {apt.elder?.firstName}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div 
                            className="text-xs text-gray-500 text-center cursor-pointer hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Scroll to first appointment of that day
                              if (dayAppointments[0]) {
                                scrollToAppointment(dayAppointments[0].id);
                              }
                            }}
                            title="Click to view appointments"
                          >
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, reason, or symptoms..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            {/* Clear Filters */}
            {(filters.search || filters.status !== 'all' || filters.dateRange !== 'all' || filters.priority !== 'all') && (
              <button
                onClick={() => setFilters({ status: 'all', search: '', dateRange: 'all', priority: 'all' })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Today's Appointments */}
            {groupedAppointments().today.length > 0 && (
              <section className="mb-5">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-blue-600">
                  <Clock className="w-5 h-5" />
                  Today's Appointments ({groupedAppointments().today.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {groupedAppointments().today.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Upcoming Appointments */}
            {groupedAppointments().upcoming.length > 0 && (
              <section className="mb-5">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-green-600">
                  <Calendar className="w-5 h-5" />
                  Upcoming Appointments ({groupedAppointments().upcoming.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {groupedAppointments().upcoming.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Past Appointments */}
            {groupedAppointments().past.length > 0 && (
              <section className="mb-5">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-gray-600">
                  <FileText className="w-5 h-5" />
                  Past Appointments ({groupedAppointments().past.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {groupedAppointments().past.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* No Data Message */}
            {getFilteredAppointments().length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.status === 'all' && !filters.search && filters.dateRange === 'all' && filters.priority === 'all'
                    ? "You don't have any appointments yet." 
                    : "No appointments match your current filters."
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Appointments will appear here when patients book with you.
                </p>
              </div>
            )}
          </>
        )}

        {/* Modal: View Appointment Details */}
        {selectedAppointment && (
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
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 inline-flex ${getStatusBadge(getAppointmentStatus(selectedAppointment.appointmentDate))}`}>
                      {getStatusIcon(getAppointmentStatus(selectedAppointment.appointmentDate))}
                      {getAppointmentStatus(selectedAppointment.appointmentDate).toUpperCase()}
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
            </div>
          </Modal>
        )}
      </div>
    </RoleLayout>
  );
};

export default AppointmentManagement;