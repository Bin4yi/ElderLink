// frontend/src/components/family/appointments/AppointmentList.js
import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Clock, Repeat, User, MapPin, Phone, Mail, 
  Calendar, ChevronLeft, ChevronRight, Video, FileText, AlertCircle,
  CheckCircle, XCircle, Plus, Filter, Search
} from 'lucide-react';
import { appointmentService } from '../../../services/appointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import { useNavigate } from 'react-router-dom';


const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAppointments();
      if (Array.isArray(response)) {
        setAppointments(response);
      } else {
        toast.error('No appointments found or response format invalid.');
      }
    } catch (error) {
      toast.error('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (id) => {
    setSelectedAppointmentId(id);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Date and time are required');
      return;
    }

    const datetime = `${rescheduleDate}T${rescheduleTime}`;

    try {
      await appointmentService.reschedule(selectedAppointmentId, {
        newDateTime: datetime,
        reason: rescheduleReason,
      });
      toast.success('Appointment rescheduled successfully');
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to reschedule appointment');
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      rejected: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesSearch = !searchQuery || 
      apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  const renderAppointmentCard = (appointment) => (
    <div
      key={appointment.id}
      className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Dr. {appointment.doctorName || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {appointment.type && <span className="capitalize">{appointment.type}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Appointment Date</p>
            <p className="text-base font-semibold text-gray-800">
              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Reason */}
        {appointment.reason && (
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reason</p>
              <p className="text-base text-gray-800">{appointment.reason}</p>
            </div>
          </div>
        )}

        {/* Duration */}
        {appointment.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{appointment.duration} minutes</span>
          </div>
        )}
      </div>

      {/* Footer - Actions */}
      {appointment.zoomJoinUrl && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-200">
          <a
            href={appointment.zoomJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2.5 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Video className="w-4 h-4" />
            Join Video Call
          </a>
        </div>
      )}
    </div>
  );

  const approvedAppointments = filteredAppointments.filter(
    (a) => a.status === 'approved'
  );
  const pendingAppointments = filteredAppointments.filter(
    (a) => a.status === 'pending'
  );

  return (
    <RoleLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <CalendarCheck className="w-8 h-8 text-white" />
                  </div>
                  My Appointments
                </h1>
                <p className="text-gray-600 mt-2">Manage and track your healthcare appointments</p>
              </div>
              <button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={() => navigate('/appointment-booking')}
              >
                <Plus className="w-5 h-5" />
                Book New Appointment
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending</p>
                    <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Completed</p>
                    <p className="text-3xl font-bold mt-1">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Cancelled</p>
                    <p className="text-3xl font-bold mt-1">{stats.cancelled}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* View Toggle & Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "You haven't booked any appointments yet"}
              </p>
              <button
                onClick={() => navigate('/appointment-booking')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Book Your First Appointment
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <>
              {/* All Appointments */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CalendarCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">All Appointments</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {filteredAppointments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            {dayAppointments.slice(0, 2).map(apt => (
                              <div
                                key={apt.id}
                                className={`text-xs px-2 py-1 rounded ${getStatusColor(apt.status)} cursor-pointer hover:opacity-80`}
                                onClick={() => {
                                  setViewMode('list');
                                  setSearchQuery(apt.doctorName);
                                }}
                              >
                                <div className="font-medium truncate">
                                  {new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="truncate">Dr. {apt.doctorName}</div>
                              </div>
                            ))}
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

export default AppointmentList;








