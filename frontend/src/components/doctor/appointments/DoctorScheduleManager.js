import React, { useState } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';

// Define your slot times
const timeSlots = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' }
];

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to get YYYY-MM-DD in local time
function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year, month) {
  // month is 0-indexed
  return new Date(year, month + 1, 0).getDate();
}

const DoctorScheduleManager = () => {
  const todayObj = new Date();
  const todayStr = getLocalDateString(todayObj);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dateSlots, setDateSlots] = useState({});
  const [loading, setLoading] = useState(false);

  // Get current month/year
  const year = todayObj.getFullYear();
  const month = todayObj.getMonth(); // 0-indexed
  const daysInMonth = getDaysInMonth(year, month);

  // Calendar grid: get first day of month (0=Sun, 1=Mon, ...)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handleSlotToggle = (date, slotIdx) => {
    setDateSlots(prev => {
      const slots = prev[date]
        ? prev[date].map(s => ({ ...s }))
        : timeSlots.map(ts => ({ ...ts, isAvailable: false }));
      slots[slotIdx].isAvailable = !slots[slotIdx].isAvailable;
      return { ...prev, [date]: slots };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const schedules = Object.entries(dateSlots).flatMap(([date, slots]) =>
        slots.filter(s => s.isAvailable).map(s => ({
          date,
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: true
        }))
      );
      await doctorAppointmentService.updateSchedule(schedules);
      toast.success('Availability updated!');
    } catch (e) {
      toast.error('Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  // Render a standard calendar for the current month
  const renderCalendar = () => {
    const calendarCells = [];
    // Fill empty cells before the first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="p-2" />);
    }
    // Fill days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = getLocalDateString(dateObj);
      const isSelected = selectedDate === dateStr;
      const hasSlots = dateSlots[dateStr] && dateSlots[dateStr].some(s => s.isAvailable);
      const isToday = dateStr === todayStr;
      const isPast = dateObj < new Date(todayStr + 'T00:00:00');

      calendarCells.push(
        <button
          key={dateStr}
          disabled={isPast}
          className={`p-2 rounded w-10 h-10 text-center border transition
            ${isPast
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : hasSlots
              ? 'bg-green-500 text-white'
              : 'bg-black text-white'}
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            ${isToday ? 'border-2 border-red-500 font-bold' : ''}
            hover:bg-blue-100`}
          onClick={() => !isPast && setSelectedDate(dateStr)}
        >
          {day}
        </button>
      );
    }
    // Render grid
    return (
      <div>
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
    <div>
      <h2 className="text-xl font-bold mb-4">
        Configure Your Availability for {todayObj.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      {renderCalendar()}
      {selectedDate && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Select Available Slots for {selectedDate}</h3>
          <div className="flex gap-2 flex-wrap">
            {(dateSlots[selectedDate] || timeSlots.map(ts => ({ ...ts, isAvailable: false }))).map((slot, idx) => (
              <button
                key={slot.startTime}
                className={`px-4 py-2 rounded border ${slot.isAvailable ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handleSlotToggle(selectedDate, idx)}
              >
                {slot.startTime}-{slot.endTime}
              </button>
            ))}
          </div>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorScheduleManager;