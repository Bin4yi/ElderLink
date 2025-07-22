// frontend/src/components/family/appointments/AppointmentList.js
import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Repeat } from 'lucide-react';
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const navigate = useNavigate();

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

  const renderAppointmentCard = (appointment) => (
    <div
      key={appointment.id}
      className="border rounded p-4 shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
    >
      <div>
        <p className="font-medium">
          <CalendarCheck className="inline w-4 h-4 mr-2" />
          {new Date(appointment.appointmentDate).toLocaleString()}
        </p>
        <p>
          <Clock className="inline w-4 h-4 mr-2" />
          <span className="capitalize">{appointment.status}</span>
        </p>
        <p>
          <span className="font-medium">Doctor:</span>{' '}
          {appointment.doctorName || 'Unknown'}
        </p>
        <p>
          <span className="font-medium">Status:</span>{' '}
          {appointment.status === 'approved' ? (
            <span className="text-green-600 font-semibold">Approved</span>
          ) : (
            <span className="text-yellow-600 font-semibold">Pending</span>
          )}
        </p>
      </div>

      {appointment.status !== 'approved' && (
        <div>
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            onClick={() => openRescheduleModal(appointment.id)}
          >
            <Repeat className="inline w-4 h-4 mr-1" />
            Reschedule
          </button>
        </div>
      )}
    </div>
  );

  const approvedAppointments = appointments.filter(
    (a) => a.status === 'approved'
  );
  const pendingAppointments = appointments.filter(
    (a) => a.status !== 'approved'
  );

  return (
    <RoleLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Appointments</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/appointment-booking')}
        >
          📅 Book Appointment
        </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments available.</p>
        ) : (
          <>
            {/* Pending Appointments */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-yellow-600">
                ⏳ Pending Appointments
              </h3>
              {pendingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pendingAppointments.map((appointment) =>
                    renderAppointmentCard(appointment)
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No pending appointments.</p>
              )}
            </div>

            {/* Approved Appointments */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-green-600">
                ✅ Approved Appointments
              </h3>
              {approvedAppointments.length > 0 ? (
                <div className="space-y-4">
                  {approvedAppointments.map((appointment) =>
                    renderAppointmentCard(appointment)
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No approved appointments.</p>
              )}
            </div>
          </>
        )}

        {/* Reschedule Modal */}
        {rescheduleModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 shadow w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Reschedule Appointment
              </h3>

              <label className="block mb-2">New Date</label>
              <input
                type="date"
                className="w-full border p-2 rounded mb-4"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />

              <label className="block mb-2">New Time</label>
              <input
                type="time"
                className="w-full border p-2 rounded mb-4"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />

              <label className="block mb-2">Reason</label>
              <textarea
                className="w-full border p-2 rounded mb-4"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Enter reschedule reason"
              />

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setRescheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleRescheduleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default AppointmentList;








