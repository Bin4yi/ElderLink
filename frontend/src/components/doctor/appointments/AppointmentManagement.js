// frontend/src/components/doctor/appointments/AppointmentManagement.js
import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';
import RoleLayout from '../../common/RoleLayout'; // ✅ Import sidebar layout (update the path if different)

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
      if (!appointmentId) {
        toast.error('Invalid appointment ID');
        return;
      }

      await doctorAppointmentService.reviewAppointment(appointmentId, action);
      toast.success(`Appointment ${action}d successfully`);
      loadAppointments();
    } catch (error) {
      console.error('❌ Error reviewing appointment:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} appointment`);
    }
  };

  return (
    <RoleLayout> {/* ✅ Added sidebar layout wrapper */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">My Appointments</h2>

        {/* Filter buttons */}
        <div className="mb-6 flex gap-2">
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

        {/* Appointments list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No appointments found.</p>
            <p className="text-gray-400 text-sm mt-2">
              {filter !== 'all' ? `No ${filter} appointments` : 'No appointments scheduled'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
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

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewAppointment(appointment.id, 'approve')}
                          className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewAppointment(appointment.id, 'reject')}
                          className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default AppointmentManagement;
