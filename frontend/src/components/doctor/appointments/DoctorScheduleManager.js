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
        console.log('🔄 Saving schedule...', dateSlots);
        
        // Format data correctly for backend
        const schedules = [];
        
        Object.entries(dateSlots).forEach(([date, slots]) => {
        slots.forEach(slot => {
            if (slot.isAvailable) {
            schedules.push({
                date: date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: true
            });
            }
        });
        });
        
        console.log('📅 Formatted schedules to send:', schedules);
        
        if (schedules.length === 0) {
        toast.error('Please select at least one time slot');
        return;
        }
        
        // Send with correct structure
        const response = await doctorAppointmentService.updateSchedule({ schedules });
        
        if (response && response.success !== false) {
        toast.success('Availability updated successfully!');
        } else {
        toast.error(response?.message || 'Failed to update schedule');
        }
        
    } catch (error) {
        console.error('❌ Failed to update schedule:', error);
        
        if (error.response?.status === 404) {
        toast.error('Schedule endpoint not found.');
        } else if (error.response?.status === 401) {
        toast.error('Unauthorized. Please log in again.');
        } else {
        toast.error(error.response?.data?.message || 'Failed to update schedule');
        }
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
      const isPastDate = dateObj < todayObj && dateStr !== todayStr;
      
      calendarCells.push(
        <button
          key={dateStr}
          className={`p-2 rounded w-10 h-10 text-center border transition
            ${isPastDate 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : isSelected 
                ? 'bg-blue-500 text-white' 
                : hasSlots 
                  ? 'bg-green-200 hover:bg-green-300' 
                  : 'bg-gray-100 hover:bg-blue-100'
            }
            ${isToday ? 'border-2 border-red-500 font-bold' : 'border-gray-300'}
          `}
          onClick={() => !isPastDate && setSelectedDate(dateStr)}
          disabled={isPastDate}
          title={isPastDate ? 'Cannot schedule for past dates' : `Select ${dateStr}`}
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
            <div key={w} className="text-center font-semibold text-gray-600 p-2">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarCells}
        </div>
      </div>
    );
  };

  // Check if selected date is in the past
  const isSelectedDatePast = () => {
    const selected = new Date(selectedDate + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    return selected < today;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configure Your Availability for {todayObj.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      
      <div className="mb-6">
        {renderCalendar()}
      </div>
      
      <div className="flex gap-4 text-sm mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border rounded"></div>
          <span>Has available slots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 border rounded"></div>
          <span>Selected date</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
          <span>Today</span>
        </div>
      </div>
      
      {selectedDate && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Select Available Slots for {selectedDate}
            {isSelectedDatePast() && (
              <span className="text-red-500 text-sm ml-2">(Past date - cannot schedule)</span>
            )}
          </h3>
          
          {isSelectedDatePast() ? (
            <div className="text-gray-500 text-center py-8">
              Cannot schedule appointments for past dates. Please select a future date.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {(dateSlots[selectedDate] || timeSlots.map(ts => ({ ...ts, isAvailable: false }))).map((slot, idx) => (
                  <button
                    key={slot.startTime}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium
                      ${slot.isAvailable 
                        ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    onClick={() => handleSlotToggle(selectedDate, idx)}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
              
              <button
                className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-200
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  }`}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Availability'
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorScheduleManager;