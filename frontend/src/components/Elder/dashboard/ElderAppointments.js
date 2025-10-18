import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { appointmentService } from '../../../services/appointment';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Video, 
  Plus,
  Filter,
  ChevronRight,
  Stethoscope,
  Heart,
  Eye,
  Brain,
  ChevronLeft,
  CalendarDays,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  List,
  X
} from 'lucide-react';

const ElderAppointments = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load appointments from backend
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
    toast.success('Appointments refreshed');
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(appointmentId, 'Cancelled by elder');
      toast.success('Appointment cancelled successfully');
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleReschedule = (appointmentId) => {
    toast.info('Reschedule feature coming soon!');
  };

  // Calendar Helper Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate || apt.date);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      return aptDateStr === dateStr;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'cancelled':
      case 'rejected':
        return XCircle;
      case 'completed':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'video' || type === 'online' ? Video : MapPin;
  };

  const getSpecialtyIcon = (specialty) => {
    const specialtyLower = specialty?.toLowerCase() || '';
    if (specialtyLower.includes('cardio') || specialtyLower.includes('heart')) return Heart;
    if (specialtyLower.includes('eye') || specialtyLower.includes('ophthal')) return Eye;
    if (specialtyLower.includes('neuro') || specialtyLower.includes('brain')) return Brain;
    if (specialtyLower.includes('general') || specialtyLower.includes('family')) return Stethoscope;
    return Activity;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (selectedFilter === 'all') return true;
    return apt.status?.toLowerCase() === selectedFilter.toLowerCase();
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.appointmentDate || a.date);
    const dateB = new Date(b.appointmentDate || b.date);
    return dateA - dateB;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <RoleLayout title="My Appointments">
        <Loading />
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="My Appointments">
      <div className="max-w-7xl mx-auto space-y-6 p-6 bg-gray-50 min-h-screen">
        {/* Clean Header with White Background */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <CalendarDays className="w-8 h-8 mr-3 text-gray-700" />
                My Appointments
              </h1>
              <p className="text-gray-600">View and manage your healthcare schedule</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-2.5 flex items-center transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-gray-700 font-medium">Refresh</span>
              </button>
              <button 
                onClick={() => toast.info('Book new appointment feature coming soon!')}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-6 py-2.5 flex items-center transition-colors font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book New
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Clean White Design */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                <div className="text-gray-600 text-sm mt-1">Total</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <CalendarDays className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(a => a.status?.toLowerCase() === 'confirmed' || a.status?.toLowerCase() === 'approved').length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Confirmed</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {appointments.filter(a => a.status?.toLowerCase() === 'pending').length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Pending</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.type === 'video' || a.type === 'online').length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Video Calls</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <Video className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex space-x-2">
                {['all', 'confirmed', 'pending', 'completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                      selectedFilter === filter
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200"
                >
                  Today
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 py-3 text-sm">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {getDaysInMonth(currentMonth).map((date, index) => {
                const dayAppointments = date ? getAppointmentsForDate(date) : [];
                const hasAppointments = dayAppointments.length > 0;
                const isSelectedDate = selectedDate && date && isSameDay(date, selectedDate);
                const isTodayDate = date && isToday(date);

                return (
                  <div
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    className={`min-h-[110px] p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      !date
                        ? 'bg-gray-50 cursor-default border-gray-100'
                        : isSelectedDate
                        ? 'bg-gray-900 border-gray-900 shadow-lg scale-105'
                        : isTodayDate
                        ? 'bg-gray-100 border-gray-300 hover:shadow-md'
                        : hasAppointments
                        ? 'bg-white border-gray-300 hover:shadow-md hover:border-gray-400'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${
                          isSelectedDate ? 'text-white' :
                          isTodayDate ? 'text-gray-900' :
                          'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        {hasAppointments && (
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt, i) => {
                              const StatusIcon = getStatusIcon(apt.status);
                              return (
                                <div
                                  key={i}
                                  className={`text-xs rounded px-2 py-1.5 truncate flex items-center ${
                                    isSelectedDate 
                                      ? 'bg-white/20 text-white border border-white/30' 
                                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}
                                  title={apt.appointmentType || apt.title || 'Appointment'}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate font-medium">
                                    {formatTime(apt.appointmentDate || apt.date)}
                                  </span>
                                </div>
                              );
                            })}
                            {dayAppointments.length > 2 && (
                              <div className={`text-xs font-medium ${
                                isSelectedDate ? 'text-white' : 'text-gray-600'
                              }`}>
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Date Appointments */}
            {selectedDate && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No appointments scheduled for this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getAppointmentsForDate(selectedDate).map(apt => renderAppointmentCard(apt, true))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {sortedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-4">No appointments match the selected filter.</p>
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Show All Appointments
                  </button>
                </div>
              </div>
            ) : (
              sortedAppointments.map(apt => renderAppointmentCard(apt, false))
            )}
          </div>
        )}
      </div>
    </RoleLayout>
  );

  // Render appointment card helper function
  function renderAppointmentCard(appointment, isCompact) {
    const SpecialtyIcon = getSpecialtyIcon(appointment.specialty);
    const TypeIcon = getTypeIcon(appointment.type);
    const StatusIcon = getStatusIcon(appointment.status);
    const statusColor = getStatusColor(appointment.status);

    return (
      <div
        key={appointment.id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              <div className="bg-gray-100 rounded-lg p-3 flex-shrink-0">
                <SpecialtyIcon className="w-6 h-6 text-gray-700" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {appointment.appointmentType || appointment.title || 'Appointment'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${statusColor}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {appointment.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    {appointment.Doctor && (
                      <div className="flex items-center text-gray-700">
                        <User className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="font-medium truncate">
                          Dr. {appointment.Doctor.firstName} {appointment.Doctor.lastName}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span>{formatDate(appointment.appointmentDate || appointment.date)}</span>
                      <span className="ml-2 text-gray-500">at {formatTime(appointment.appointmentDate || appointment.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <TypeIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{appointment.location || (appointment.type === 'video' ? 'Video Call' : 'In-Person')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    {appointment.phone && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span>{appointment.phone}</span>
                      </div>
                    )}
                    
                    {(appointment.notes || appointment.reason) && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-600">{appointment.notes || appointment.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {!isCompact && (
              <button className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-5 py-2.5 flex items-center transition-colors flex-shrink-0 font-medium">
                <span className="mr-2">Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex space-x-4">
              <button 
                onClick={() => handleReschedule(appointment.id)}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center text-sm"
              >
                <Edit className="w-4 h-4 mr-1.5" />
                Reschedule
              </button>
              <button 
                onClick={() => handleCancelAppointment(appointment.id)}
                className="text-red-600 hover:text-red-700 font-medium transition-colors flex items-center text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Cancel
              </button>
              {(appointment.type === 'video' || appointment.type === 'online') && (
                <button 
                  onClick={() => toast.info('Video call feature coming soon!')}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors flex items-center text-sm"
                >
                  <Video className="w-4 h-4 mr-1.5" />
                  Join Call
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <TypeIcon className="w-4 h-4 mr-1.5" />
              {appointment.type === 'video' || appointment.type === 'online' ? 'Video Call' : 'In-Person'}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ElderAppointments;