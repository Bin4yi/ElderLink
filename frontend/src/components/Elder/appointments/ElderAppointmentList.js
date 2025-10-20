// frontend/src/components/Elder/appointments/ElderAppointmentList.js
import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Clock, User, FileText, AlertCircle,
  CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight, 
  Video, Bell, X as CloseIcon, Search, Filter
} from 'lucide-react';
import { appointmentService } from '../../../services/appointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';

const ElderAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'today', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [showReminder, setShowReminder] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Check for today's appointments
    if (appointments.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppts = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });
      
      setTodayAppointments(todayAppts);
    }
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getElderAppointments();
      console.log('📋 Elder appointments response:', response);
      
      if (Array.isArray(response)) {
        setAppointments(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else if (response.appointments && Array.isArray(response.appointments)) {
        setAppointments(response.appointments);
      } else {
        console.warn('Unexpected response format:', response);
        setAppointments([]);
        toast.error('No appointments found or response format invalid.');
      }
    } catch (error) {
      console.error('❌ Error fetching elder appointments:', error);
      toast.error('Failed to fetch appointments.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
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
      return 'today'; // Today's appointments (In Progress)
    } else {
      return 'upcoming'; // Future appointments
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      today: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      upcoming: <Clock className="w-4 h-4" />,
      today: (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          <div className="relative w-2 h-2 bg-red-600 rounded-full"></div>
        </div>
      ),
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      upcoming: 'Upcoming',
      today: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Helper function to get doctor name
  const getDoctorName = (appointment) => {
    if (appointment.doctor && appointment.doctor.user) {
      return `${appointment.doctor.user.firstName || ''} ${appointment.doctor.user.lastName || ''}`.trim();
    }
    if (appointment.doctorName) {
      return appointment.doctorName;
    }
    return 'Unknown';
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const calculatedStatus = getAppointmentStatus(apt.appointmentDate);
    const matchesStatus = filterStatus === 'all' || calculatedStatus === filterStatus;
    const doctorName = getDoctorName(apt);
    const matchesSearch = !searchQuery || 
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => getAppointmentStatus(a.appointmentDate) === 'upcoming').length,
    today: appointments.filter(a => getAppointmentStatus(a.appointmentDate) === 'today').length,
    completed: appointments.filter(a => getAppointmentStatus(a.appointmentDate) === 'completed').length
  };

  const renderAppointmentCard = (appointment) => {
    const doctorName = getDoctorName(appointment);
    const calculatedStatus = getAppointmentStatus(appointment.appointmentDate);
    
    return (
      <div
        key={appointment.id}
        className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
      >
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  Dr. {doctorName}
                </h3>
                {appointment.type && (
                  <p className="text-xs text-gray-600 capitalize">{appointment.type}</p>
                )}
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 ${getStatusColor(calculatedStatus)}`}>
              {getStatusIcon(calculatedStatus)}
              <span>{getStatusLabel(calculatedStatus)}</span>
            </div>
          </div>
        </div>

        {/* Body - Compact */}
        <div className="px-4 py-3 space-y-2.5">
          {/* Date & Time - Inline */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Date</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-1.5 rounded">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Time</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Reason - Compact */}
          {appointment.reason && (
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase">Reason</p>
                  <p className="text-sm text-gray-800 line-clamp-2">{appointment.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Duration - Inline if exists */}
          {appointment.duration && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded">
              <Clock className="w-3.5 h-3.5" />
              <span>{appointment.duration} minutes</span>
            </div>
          )}
        </div>

        {/* Footer - Actions - Compact */}
        {appointment.zoomJoinUrl && (
          <div className="px-4 py-2.5 bg-green-50 border-t border-green-200">
            <a
              href={appointment.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Video className="w-4 h-4" />
              Join Video Call
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <RoleLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
                    <CalendarCheck className="w-6 h-6 text-white" />
                  </div>
                  My Appointments
                </h1>
                <p className="text-gray-600 mt-1 text-sm">View and manage your healthcare appointments</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Total</p>
                    <p className="text-2xl font-bold mt-0.5">{stats.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-3 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-xs">Upcoming</p>
                    <p className="text-2xl font-bold mt-0.5">{stats.upcoming}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-3 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs">In Progress</p>
                    <p className="text-2xl font-bold mt-0.5">{stats.today}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-3 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">Completed</p>
                    <p className="text-2xl font-bold mt-0.5">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-full mx-auto px-4 py-6">
          {/* Today's Appointment Reminder */}
          {showReminder && todayAppointments.length > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg p-4 mb-4 text-white relative animate-pulse">
              <button
                onClick={() => setShowReminder(false)}
                className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">📅 Today's Appointment Reminder!</h3>
                  <p className="text-red-50 mb-3">You have {todayAppointments.length} appointment{todayAppointments.length > 1 ? 's' : ''} scheduled for today:</p>
                  <div className="space-y-2">
                    {todayAppointments.map(apt => {
                      const doctorName = getDoctorName(apt);
                      return (
                        <div key={apt.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Dr. {doctorName}</p>
                              <p className="text-sm text-red-50">
                                {new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {apt.reason && ` • ${apt.reason}`}
                              </p>
                            </div>
                            {apt.zoomJoinUrl && (
                              <a
                                href={apt.zoomJoinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <Video className="w-4 h-4" />
                                Join
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Toggle & Filters */}
          <div className="bg-white rounded-xl shadow-md p-3 mb-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Calendar View
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="today">In Progress (Today)</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-4 text-sm">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "You don't have any appointments yet"}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <>
              {/* All Appointments */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <CalendarCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">All Appointments</h2>
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm font-semibold">
                    {filteredAppointments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAppointments.map((appointment) =>
                    renderAppointmentCard(appointment)
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Calendar View */
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
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
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const dayAppointments = date ? getAppointmentsForDate(date) : [];
                  const isToday = date && date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg ${
                        !date
                          ? 'bg-gray-50'
                          : isToday
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white hover:bg-gray-50'
                      } transition`}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-semibold mb-1 ${
                            isToday ? 'text-blue-600' : 'text-gray-700'
                          }`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map(apt => {
                              const doctorName = getDoctorName(apt);
                              const calculatedStatus = getAppointmentStatus(apt.appointmentDate);
                              return (
                                <div
                                  key={apt.id}
                                  className={`text-xs px-2 py-1 rounded ${getStatusColor(calculatedStatus)} cursor-pointer hover:opacity-80`}
                                  onClick={() => {
                                    setViewMode('list');
                                    setSearchQuery(doctorName);
                                  }}
                                >
                                  <div className="font-medium truncate">
                                    {new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="truncate">Dr. {doctorName}</div>
                                </div>
                              );
                            })}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-500 px-2">
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default ElderAppointmentList;
