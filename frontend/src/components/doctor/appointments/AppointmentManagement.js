// frontend/src/components/doctor/appointments/AppointmentManagement.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal'; // ✅ Make sure you have a Modal component created or use a simple custom one

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await doctorAppointmentService.getDoctorAppointments(params);
      setAppointments(response.appointments || []);
      console.log('✅ Loaded doctor appointments:', response.appointments?.length || 0);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAppointment = async (appointmentId, action) => {
    try {
      await doctorAppointmentService.reviewAppointment(appointmentId, action);
      toast.success(`Appointment ${action}d successfully`);
      loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} appointment`);
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

  const renderAppointmentCard = appointment => (
    <div
      key={appointment.id}
      className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">
            {appointment.elder?.firstName} {appointment.elder?.lastName}
          </h3>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Reason:</span> {appointment.reason}
          </p>
          <p className="text-gray-500 text-sm mb-2">
            <span className="font-medium">Date:</span>{' '}
            {new Date(appointment.appointmentDate).toLocaleString()}
          </p>
          {appointment.symptoms && (
            <p className="text-gray-500 text-sm mb-2">
              <span className="font-medium">Symptoms:</span> {appointment.symptoms}
            </p>
          )}
          {appointment.notes && (
            <p className="text-gray-500 text-sm">
              <span className="font-medium">Notes:</span> {appointment.notes}
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
                : 'bg-red-100 text-red-800'
            }`}
          >
            {appointment.status}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedAppointment(appointment)}
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded"
              title="View Details"
            >
              📄
            </button>

            {appointment.status === 'pending' && (
              <>
                <button
                  onClick={() => handleReviewAppointment(appointment.id, 'approve')}
                  className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReviewAppointment(appointment.id, 'reject')}
                  className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const todayAppointments = appointments.filter(a => isToday(a.appointmentDate));
  const upcomingAppointments = appointments.filter(
    a => a.status === 'approved' && isFuture(a.appointmentDate)
  );
  const otherAppointments = appointments.filter(
    a => !isToday(a.appointmentDate) && !(a.status === 'approved' && isFuture(a.appointmentDate))
  );

  return (
    <RoleLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">My Appointments</h2>

        {/* Filter buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Today's Appointments */}
            {todayAppointments.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">📅 Today’s Appointments</h3>
                <div className="space-y-4">
                  {todayAppointments.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">⏳ Upcoming Appointments</h3>
                <div className="space-y-4">
                  {upcomingAppointments.map(renderAppointmentCard)}
                </div>
              </section>
            )}

            {/* Other Appointments */}
            <section>
              <h3 className="text-xl font-semibold mb-4">📋 Other Appointments</h3>
              {otherAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No other appointments found.</p>
              ) : (
                <div className="space-y-4">
                  {otherAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Modal: View Appointment Details */}
      {selectedAppointment && (
        <Modal onClose={() => setSelectedAppointment(null)}>
          <h2 className="text-lg font-bold mb-4">Appointment Details</h2>
          <p><strong>Elder:</strong> {selectedAppointment.elder?.firstName} {selectedAppointment.elder?.lastName}</p>
          <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleString()}</p>
          <p><strong>Status:</strong> {selectedAppointment.status}</p>
          <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
          <p><strong>Symptoms:</strong> {selectedAppointment.symptoms || 'N/A'}</p>
          <p><strong>Notes:</strong> {selectedAppointment.notes || 'N/A'}</p>
        </Modal>
      )}
    </RoleLayout>
  );
};

export default AppointmentManagement;

