appointments/DoctorCalendarModal.js
import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../../services/appointment';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const DoctorCalendarModal = ({ doctor, onClose, onSlotSelect }) => {
  const todayObj = new Date();
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calendar navigation state
  const [calendarYear, setCalendarYear] = useState(todayObj.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(todayObj.getMonth()); // 0-indexed

  useEffect(() => {
    // Always fetch for the visible month (could be optimized for range)
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

  // Standard calendar for current month, with navigation
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
    const calendarCells = [];

    // Fill empty cells before the first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Fill days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(calendarYear, calendarMonth, day);
      const dateStr = getLocalDateString(dateObj);
      const isAvailable = availableDates.includes(dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === getLocalDateString(new Date());
      const isPast = dateObj < new Date(getLocalDateString(new Date()) + 'T00:00:00');

      calendarCells.push(
        <button
          key={dateStr}
          disabled={isPast || !isAvailable}
          className={`p-2 rounded w-10 h-10 text-center border transition
            ${isPast
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isAvailable
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-black border-black'}
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            ${isToday ? 'border-2 border-red-500 font-bold' : ''}
            hover:bg-blue-100`}
          onClick={() => !isPast && isAvailable && setSelectedDate(dateStr)}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(calendarYear - 1);
              } else {
                setCalendarMonth(calendarMonth - 1);
              }
            }}
          >
            &lt;
          </button>
          <span className="font-semibold">
            {new Date(calendarYear, calendarMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric'
            })}
          </span>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(calendarYear + 1);
              } else {
                setCalendarMonth(calendarMonth + 1);
              }
            }}
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {weekdays.map(w => (
            <div key={w} className="text-center font-semibold text-gray-600">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells}
        </div>
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