// frontend/src/components/doctor/appointments/AppointmentManagement.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';
import DoctorScheduleManager from './DoctorScheduleManager';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  // State for reschedule modal and fields
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // State for review modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  // ✅ FIXED: Updated to handle the correct API response structure
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading doctor appointments with filter:', filter);
      
      const params = {
        page: 1,
        limit: 100 // Load more appointments for comprehensive view
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await doctorAppointmentService.getDoctorAppointments(params);
      
      console.log('✅ API Response:', response);
      
      if (response.success) {
        const appointmentsData = response.appointments || [];
        setAppointments(appointmentsData);
        console.log('✅ Loaded doctor appointments:', appointmentsData.length);
      } else {
        throw new Error(response.message || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setError(error.message || 'Failed to load appointments');
      setAppointments([]);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ENHANCED: Better review appointment handling with modal
  const handleReviewAppointment = (appointmentId, action) => {
    setSelectedAppointment(appointments.find(apt => apt.id === appointmentId));
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const submitReviewAppointment = async () => {
    try {
      if (!selectedAppointment || !reviewAction) {
        toast.error('Missing appointment or action');
        return;
      }

      console.log('🔄 Reviewing appointment:', {
        id: selectedAppointment.id,
        action: reviewAction,
        notes: reviewNotes
      });

      await doctorAppointmentService.reviewAppointment(
        selectedAppointment.id, 
        reviewAction, 
        reviewNotes
      );
      
      toast.success(`Appointment ${reviewAction}d successfully`);
      
      // Reset modal state
      setShowReviewModal(false);
      setSelectedAppointment(null);
      setReviewAction('');
      setReviewNotes('');
      
      // Reload appointments
      loadAppointments();
    } catch (error) {
      console.error('❌ Error reviewing appointment:', error);
      toast.error(error.message || `Failed to ${reviewAction} appointment`);
    }
  };

  // Handle Reschedule Submit
  const handleRescheduleSubmit = async () => {
    if (!rescheduleDateTime) {
      toast.error('Please select date and time');
      return;
    }
    
    if (!selectedAppointment) {
      toast.error('No appointment selected');
      return;
    }

    try {
      console.log('🔄 Rescheduling appointment:', {
        id: selectedAppointment.id,
        newDateTime: rescheduleDateTime,
        reason: rescheduleReason
      });

      await doctorAppointmentService.rescheduleAppointment(selectedAppointment.id, {
        newDateTime: rescheduleDateTime,
        reason: rescheduleReason,
      });
      
      toast.success('Appointment rescheduled successfully');
      
      // Reset modal state
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setRescheduleDateTime('');
      setRescheduleReason('');
      
      // Reload appointments
      loadAppointments();
    } catch (error) {
      console.error('❌ Error rescheduling appointment:', error);
      toast.error(error.message || 'Failed to reschedule appointment');
    }
  };

  const isToday = dateStr => {
    const d = new Date(dateStr).toISOString().split('T')[0];
    return d === today;
  };

  const isFuture = dateStr => {
    const d = new Date(dateStr).toISOString().split('T')[0];
    return d > today;
  };

  // ✅ ENHANCED: Better appointment card rendering with improved data handling
  const renderAppointmentCard = appointment => {
    // Handle different data structures from API
    const elderName = appointment.elderName || 
                     (appointment.elder ? `${appointment.elder.firstName} ${appointment.elder.lastName}` : 'Unknown Elder');
    
    const familyMemberName = appointment.familyMemberName || 
                            (appointment.familyMember ? `${appointment.familyMember.firstName} ${appointment.familyMember.lastName}` : 'Unknown Family Member');

    return (
      <div
        key={appointment.id}
        className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              {elderName}
            </h3>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Requested by:</span> {familyMemberName}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Reason:</span> {appointment.reason || 'General consultation'}
            </p>
            <p className="text-gray-500 text-sm mb-2">
              <span className="font-medium">Date:</span>{' '}
              {new Date(appointment.appointmentDate).toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm mb-2">
              <span className="font-medium">Duration:</span> {appointment.duration || 30} minutes
            </p>
            <p className="text-gray-500 text-sm mb-2">
              <span className="font-medium">Priority:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                appointment.priority === 'high' ? 'bg-red-100 text-red-800' :
                appointment.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {appointment.priority || 'medium'}
              </span>
            </p>
            {appointment.symptoms && (
              <p className="text-gray-500 text-sm mb-2">
                <span className="font-medium">Symptoms:</span> {appointment.symptoms}
              </p>
            )}
            {appointment.notes && (
              <p className="text-gray-500 text-sm mb-2">
                <span className="font-medium">Notes:</span> {appointment.notes}
              </p>
            )}
            {appointment.doctorNotes && (
              <p className="text-blue-600 text-sm mb-2">
                <span className="font-medium">Doctor Notes:</span> {appointment.doctorNotes}
              </p>
            )}
            {appointment.rejectionReason && (
              <p className="text-red-600 text-sm mb-2">
                <span className="font-medium">Rejection Reason:</span> {appointment.rejectionReason}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                appointment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : appointment.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : appointment.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : appointment.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {appointment.status}
            </span>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedAppointment(appointment)}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded transition-colors"
                title="View Details"
              >
                📄 Details
              </button>

              {appointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReviewAppointment(appointment.id, 'approve')}
                    className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReviewAppointment(appointment.id, 'reject')}
                    className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowRescheduleModal(true);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                  >
                    🔄 Reschedule
                  </button>
                </>
              )}

              {appointment.status === 'approved' && (
                <button
                  onClick={() => {
                    // You can implement completion functionality here
                    toast.info('Complete appointment functionality can be added here');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  ✔️ Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const todayAppointments = appointments.filter(a => isToday(a.appointmentDate));
  const upcomingAppointments = appointments.filter(
    a => a.status === 'approved' && isFuture(a.appointmentDate)
  );
  const otherAppointments = appointments.filter(
    a => !isToday(a.appointmentDate) && !(a.status === 'approved' && isFuture(a.appointmentDate))
  );

  if (showScheduleManager) {
    return (
      <RoleLayout>
        <div className="p-6">
          <button
            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Appointments</h2>
            <p className="text-gray-600">Manage your patient appointments and schedule</p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              onClick={() => loadAppointments()}
            >
              🔄 Refresh
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => setShowScheduleManager(true)}
            >
              📅 Manage Availability
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {status} {status === filter && `(${appointments.length})`}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Appointments</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-red-100 px-2 py-1.5 rounded-md text-red-800 text-xs font-medium hover:bg-red-200 transition-colors"
                    onClick={() => loadAppointments()}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Today's Appointments */}
            {todayAppointments.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  📅 Today's Appointments 
                  <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                    {todayAppointments.length}
                  </span>
                </h3>
                <div className="space-y-4">
                  {todayAppointments.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  ⏳ Upcoming Appointments 
                  <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                    {upcomingAppointments.length}
                  </span>
                </h3>
                <div className="space-y-4">
                  {upcomingAppointments.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Other Appointments */}
            <section>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                📋 Other Appointments
                <span className="ml-2 bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                  {otherAppointments.length}
                </span>
              </h3>
              {otherAppointments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">No other appointments found.</p>
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View all appointments
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {otherAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </section>

            {/* No appointments message */}
            {appointments.length === 0 && !loading && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? "You don't have any appointments yet." 
                    : `No ${filter} appointments found.`}
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View All Appointments
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: View Appointment Details */}
      {selectedAppointment && !showRescheduleModal && !showReviewModal && (
        <Modal onClose={() => setSelectedAppointment(null)}>
          <h2 className="text-lg font-bold mb-4">Appointment Details</h2>
          <div className="space-y-3">
            <p><strong>Elder:</strong> {selectedAppointment.elderName || `${selectedAppointment.elder?.firstName} ${selectedAppointment.elder?.lastName}`}</p>
            <p><strong>Family Member:</strong> {selectedAppointment.familyMemberName || `${selectedAppointment.familyMember?.firstName} ${selectedAppointment.familyMember?.lastName}`}</p>
            <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleString()}</p>
            <p><strong>Duration:</strong> {selectedAppointment.duration || 30} minutes</p>
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm ${
              selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              selectedAppointment.status === 'approved' ? 'bg-green-100 text-green-800' :
              selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>{selectedAppointment.status}</span></p>
            <p><strong>Priority:</strong> {selectedAppointment.priority || 'medium'}</p>
            <p><strong>Reason:</strong> {selectedAppointment.reason || 'General consultation'}</p>
            <p><strong>Symptoms:</strong> {selectedAppointment.symptoms || 'N/A'}</p>
            <p><strong>Notes:</strong> {selectedAppointment.notes || 'N/A'}</p>
            {selectedAppointment.doctorNotes && (
              <p><strong>Doctor Notes:</strong> {selectedAppointment.doctorNotes}</p>
            )}
            {selectedAppointment.rejectionReason && (
              <p><strong>Rejection Reason:</strong> {selectedAppointment.rejectionReason}</p>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Review Appointment */}
      {showReviewModal && selectedAppointment && (
        <Modal onClose={() => setShowReviewModal(false)}>
          <h2 className="text-lg font-bold mb-4">
            {reviewAction === 'approve' ? 'Approve' : 'Reject'} Appointment
          </h2>
          <div className="mb-4">
            <p><strong>Elder:</strong> {selectedAppointment.elderName}</p>
            <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleString()}</p>
            <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
          </div>
          
          <label className="block mb-2 text-sm font-medium">
            {reviewAction === 'approve' ? 'Approval Notes (optional):' : 'Rejection Reason:'}
          </label>
          <textarea
            rows="3"
            className="border p-2 rounded w-full mb-4"
            value={reviewNotes}
            onChange={e => setReviewNotes(e.target.value)}
            placeholder={reviewAction === 'approve' ? 'Add any notes for approval...' : 'Please provide a reason for rejection...'}
            required={reviewAction === 'reject'}
          />
          
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              onClick={() => setShowReviewModal(false)}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded text-white transition-colors ${
                reviewAction === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              onClick={submitReviewAppointment}
              disabled={reviewAction === 'reject' && !reviewNotes.trim()}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Appointment
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Reschedule Appointment */}
      {showRescheduleModal && selectedAppointment && (
        <Modal onClose={() => setShowRescheduleModal(false)}>
          <h2 className="text-lg font-bold mb-4">Reschedule Appointment</h2>
          <div className="mb-4">
            <p><strong>Elder:</strong> {selectedAppointment.elderName}</p>
            <p><strong>Current Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleString()}</p>
          </div>
          
          <label className="block mb-2 text-sm font-medium">New Date and Time:</label>
          <input
            type="datetime-local"
            className="border p-2 rounded w-full mb-4"
            value={rescheduleDateTime}
            onChange={e => setRescheduleDateTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          
          <label className="block mb-2 text-sm font-medium">Reason (optional):</label>
          <textarea
            rows="3"
            className="border p-2 rounded w-full mb-4"
            value={rescheduleReason}
            onChange={e => setRescheduleReason(e.target.value)}
            placeholder="Reason for rescheduling..."
          />
          
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              onClick={() => setShowRescheduleModal(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={handleRescheduleSubmit}
              disabled={!rescheduleDateTime}
            >
              Reschedule
            </button>
          </div>
        </Modal>
      )}
    </RoleLayout>
  );
};

export default AppointmentManagement;

