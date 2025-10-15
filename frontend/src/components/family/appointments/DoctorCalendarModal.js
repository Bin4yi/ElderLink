// frontend/src/components/family/appointments/DoctorCalendarModal.js
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
  const [loadingDates, setLoadingDates] = useState(false);

  // Calendar navigation state
  const [calendarYear, setCalendarYear] = useState(todayObj.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(todayObj.getMonth()); // 0-indexed

  useEffect(() => {
    if (!doctor?.id) return;
    setLoadingDates(true);
    appointmentService.getDoctorAvailableDates(doctor.id)
      .then((dates) => {
        console.log('Available dates from API:', dates); // <-- Add this line
        setAvailableDates(dates || []);
      })
      .catch(() => setAvailableDates([]))
      .finally(() => setLoadingDates(false));
  }, [doctor]);

  useEffect(() => {
    if (selectedDate) {
      const loadAvailability = async () => {
        setLoading(true);
        try {
          const response = await appointmentService.getDoctorAvailability(doctor.id, selectedDate);
          // Use only response.availableSlots
          setAvailableSlots(response.availableSlots || []);
        } catch (error) {
          console.error('Error loading availability:', error);
          setAvailableSlots([]);
        } finally {
          setLoading(false);
        }
      };
      
      loadAvailability();
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
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'}
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            ${isToday ? 'border-2 border-red-500 font-bold' : 'border-gray-300'}
          `}
          onClick={() => !isPast && isAvailable && setSelectedDate(dateStr)}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            onClick={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(calendarYear - 1);
              } else {
                setCalendarMonth(calendarMonth - 1);
              }
            }}
          >
            ‹
          </button>
          <span className="font-semibold text-lg">
            {new Date(calendarYear, calendarMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric'
            })}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            onClick={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(calendarYear + 1);
              } else {
                setCalendarMonth(calendarMonth + 1);
              }
            }}
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {weekdays.map(w => (
            <div key={w} className="text-center font-semibold text-gray-600 p-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Dr. {doctor.user?.firstName} {doctor.user?.lastName}
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              <p>Experience: {doctor.experience} years</p>
              <p>Qualifications: {doctor.qualifications}</p>
              {doctor.rating && <p>Rating: ⭐ {doctor.rating}/5</p>}
              <p className="text-green-600 font-semibold">Fee: ${doctor.consultationFee}</p>
              <p>Email: {doctor.user?.email}</p>
              <p>Phone: {doctor.user?.phone}</p>
            </div>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold" 
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {doctor.about && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{doctor.about}</p>
          </div>
        )}

        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Select Date</h3>
          <div className="mb-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
          {renderCalendar()}
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">
              Available Time Slots - {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3">Loading available times...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    disabled={slot.status !== 'available'}
                    onClick={() => onSlotSelect(selectedDate, slot.startTime)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      slot.status === 'booked'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                        : slot.status === 'reserved'
                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed border-yellow-300'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-300 hover:border-green-400'
                    }`}
                  >
                    <div>{slot.startTime}</div>
                    {slot.status === 'booked' && (
                      <div className="text-xs mt-1">Booked</div>
                    )}
                    {slot.status === 'reserved' && (
                      <div className="text-xs mt-1">Reserved</div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>No available slots for this date</p>
                <p className="text-sm">Please select another date</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!selectedDate && (
          <div className="text-center text-gray-500 p-6 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2">📅</div>
            <p className="font-medium">Select a date to view available time slots</p>
            <p className="text-sm mt-1">Green dates have availability</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendarModal;