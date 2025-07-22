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
  Filter
} from 'lucide-react';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadAppointments();
  }, [filter]);

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

      // Handle different response structures
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
      
      // Check if it's a network error
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
        loadAppointments(); // Reload to get updated data
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
      'no-show': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
              {appointment.doctorNotes && (
                <p className="text-gray-700">
                  <span className="font-medium">Doctor Notes:</span> {appointment.doctorNotes}
                </p>
              )}
            </div>

            {/* Medical Information */}
            {(elder.bloodType || elder.allergies || elder.chronicConditions || elder.currentMedications) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Medical Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {elder.bloodType && (
                    <p><span className="font-medium">Blood Type:</span> {elder.bloodType}</p>
                  )}
                  {elder.allergies && (
                    <p><span className="font-medium">Allergies:</span> {elder.allergies}</p>
                  )}
                  {elder.chronicConditions && (
                    <p className="md:col-span-2"><span className="font-medium">Chronic Conditions:</span> {elder.chronicConditions}</p>
                  )}
                  {elder.currentMedications && (
                    <p className="md:col-span-2"><span className="font-medium">Current Medications:</span> {elder.currentMedications}</p>
                  )}
                </div>
              </div>
            )}
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
            <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
            <p className="text-gray-600 mt-1">Manage your patient appointments and schedule</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={() => setShowScheduleManager(true)}
          >
            <Calendar className="w-4 h-4" />
            Manage Availability
          </button>
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

            {/* No Appointments Message */}
            {appointments.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'all' 
                    ? "You don't have any appointments yet." 
                    : `No ${filter} appointments found.`
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
                  {selectedAppointment.elder?.allergies && (
                    <div>
                      <strong>Allergies:</strong>
                      <p className="text-red-600 mt-1">{selectedAppointment.elder.allergies}</p>
                    </div>
                  )}
                  {selectedAppointment.elder?.chronicConditions && (
                    <div>
                      <strong>Chronic Conditions:</strong>
                      <p className="text-gray-700 mt-1">{selectedAppointment.elder.chronicConditions}</p>
                    </div>
                  )}
                  {selectedAppointment.elder?.currentMedications && (
                    <div>
                      <strong>Current Medications:</strong>
                      <p className="text-gray-700 mt-1">{selectedAppointment.elder.currentMedications}</p>
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

