import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../../services/appointment';

const DoctorCalendarModal = ({ doctor, onClose, onSlotSelect }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    appointmentService.getDoctorAvailableDates(doctor.id)
      .then(res => setAvailableDates(res.availableDates || []));
  }, [doctor.id]);

  useEffect(() => {
    if (selectedDate) {
      setLoading(true);
      appointmentService.getDoctorAvailability(doctor.id, selectedDate)
        .then(res => setAvailableSlots(res.availableSlots || []))
        .finally(() => setLoading(false));
    }
  }, [selectedDate, doctor.id]);

  // Render calendar for 31 days
  const renderCalendar = () => {
    const today = new Date();
    return (
      <div className="grid grid-cols-7 gap-2">
        {[...Array(31)].map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const isAvailable = availableDates.includes(dateStr);
          return (
            <button
              key={dateStr}
              disabled={!isAvailable}
              className={`p-2 rounded ${isAvailable ? 'bg-green-200' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => setSelectedDate(dateStr)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full relative">
        <button className="absolute top-2 right-2 text-gray-400" onClick={onClose}>✕</button>
        <h2 className="text-2xl font-bold mb-2">Dr. {doctor.user.firstName} {doctor.user.lastName}</h2>
        <p className="mb-2 text-blue-600">{doctor.specialization}</p>
        <p className="mb-2">Experience: {doctor.experience} years</p>
        <p className="mb-2">Qualifications: {doctor.qualifications}</p>
        <p className="mb-2">Rating: {doctor.rating || 'N/A'}</p>
        <p className="mb-2">Fee: <span className="text-green-600">${doctor.consultationFee}</span></p>
        <p className="mb-2">Email: {doctor.user.email}</p>
        <p className="mb-4">Phone: {doctor.user.phone}</p>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Date</label>
          {renderCalendar()}
        </div>
        <div>
          <label className="block mb-1 font-medium">Available Time Slots</label>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  disabled={slot.status !== 'available'}
                  onClick={() => onSlotSelect(selectedDate, slot.startTime)}
                  className={`p-2 rounded border text-sm ${
                    slot.status === 'booked'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : slot.status === 'reserved'
                      ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {slot.startTime} {slot.status === 'booked' && '(Booked)'}
                  {slot.status === 'reserved' && '(Reserved)'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendarModal;