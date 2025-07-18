// frontend/src/components/doctor/appointments/AppointmentManagement.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout';
import Modal from '../../common/Modal';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await doctorAppointmentService.getDoctorAppointments({});
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getDateOnly = dateStr => new Date(dateStr).toISOString().split('T')[0];

  const todayAppointments = appointments.filter(
    a => a.status === 'approved' && getDateOnly(a.appointmentDate) === today
  );

  const upcomingAppointments = appointments.filter(
    a => a.status === 'approved' && getDateOnly(a.appointmentDate) > today
  );

  const finishedAppointments = appointments.filter(
    a => getDateOnly(a.appointmentDate) < today
  );

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
                : appointment.status === 'cancelled' || appointment.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {appointment.status}
          </span>

          <button
            onClick={() => setSelectedAppointment(appointment)}
            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded"
            title="View Details"
          >
            📄
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <RoleLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">My Consultations</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Today */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">📅 Today’s Consultations</h3>
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No consultations for today.</p>
              ) : (
                <div className="space-y-4">{todayAppointments.map(renderAppointmentCard)}</div>
              )}
            </section>

            {/* Upcoming */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">⏳ Upcoming Consultations</h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming consultations.</p>
              ) : (
                <div className="space-y-4">{upcomingAppointments.map(renderAppointmentCard)}</div>
              )}
            </section>

            {/* Finished */}
            <section>
              <h3 className="text-xl font-semibold mb-4">✅ Finished Consultations</h3>
              {finishedAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No finished consultations.</p>
              ) : (
                <div className="space-y-4">{finishedAppointments.map(renderAppointmentCard)}</div>
              )}
            </section>
          </>
        )}
      </div>

      {selectedAppointment && (
        <Modal onClose={() => setSelectedAppointment(null)}>
          <h2 className="text-lg font-bold mb-4">Consultation Details</h2>
          <p>
            <strong>Elder:</strong> {selectedAppointment.elder?.firstName}{' '}
            {selectedAppointment.elder?.lastName}
          </p>
          <p>
            <strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {selectedAppointment.status}
          </p>
          <p>
            <strong>Reason:</strong> {selectedAppointment.reason}
          </p>
          <p>
            <strong>Symptoms:</strong> {selectedAppointment.symptoms || 'N/A'}
          </p>
          <p>
            <strong>Notes:</strong> {selectedAppointment.notes || 'N/A'}
          </p>
        </Modal>
      )}
    </RoleLayout>
  );
};

export default AppointmentManagement;