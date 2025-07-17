// src/components/family/appointments/AppointmentList.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import {
  CalendarCheck,
  Plus,
  RefreshCw,
  User,
  Stethoscope
} from 'lucide-react';
import AppointmentBooking from './AppointmentBooking';
import { appointmentService } from '../../../services/appointment';
import toast from 'react-hot-toast';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await appointmentService.getAppointments();
        if (response && response.appointments) {
          setAppointments(response.appointments);
        } else {
          setAppointments([]);
          toast.error('No appointments found or response format invalid.');
        }
      } catch (error) {
        toast.error('Failed to fetch appointments');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [refresh]);

  useEffect(() => {
    const filtered = appointments.filter((appt) => {
      const apptDate = new Date(appt.appointmentDate);
      const apptDateOnly = apptDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

      const matchesStatus =
        statusFilter === 'all' || appt.status === statusFilter;

      const matchesDoctor =
        doctorFilter === 'all' || appt.doctor?.id === doctorFilter;

      const matchesDate =
        !selectedDate || apptDateOnly === selectedDate;

      return matchesStatus && matchesDoctor && matchesDate;
    });

    setFilteredAppointments(filtered);
  }, [statusFilter, doctorFilter, selectedDate, appointments]);

  const handleBookingSuccess = () => {
    setShowBooking(false);
    toast.success('Appointment successfully booked!');
    setRefresh((prev) => !prev);
  };

  const uniqueDoctors = [
    ...new Map(
      appointments.map((appt) => [appt.doctor?.id, appt.doctor])
    ).values(),
  ];

  return (
    <RoleLayout title="Appointments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6" />
            My Appointments
          </h2>
          <button
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Book Appointment
          </button>
        </div>

        {/* Filters */}
        {!showBooking && (
          <div className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Doctor Filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Doctors</option>
              {uniqueDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.user?.firstName} {doc.user?.lastName}
                </option>
              ))}
            </select>

            {/* Exact Date Filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Appointment Date"
            />
          </div>
        )}

        {/* Booking or Table */}
        {showBooking ? (
          <AppointmentBooking
            onBack={() => setShowBooking(false)}
            onSuccess={handleBookingSuccess}
          />
        ) : (
          <div className="bg-white rounded-lg shadow w-full overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No appointments found.</div>
            ) : (
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Elder</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Doctor</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Date</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Time</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Reason</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                        {appt.elder?.photo ? (
                          <img
                            src={`/uploads/elders/${appt.elder.photo}`}
                            alt="Elder"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                        <span>{appt.elder?.firstName} {appt.elder?.lastName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        <span>Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(appt.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(appt.appointmentDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{appt.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full capitalize text-sm font-medium ${
                            appt.status === 'approved'
                              ? 'bg-green-100 text-green-600'
                              : appt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-600'
                              : appt.status === 'completed'
                              ? 'bg-blue-100 text-blue-600'
                              : appt.status === 'cancelled'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default AppointmentList;






