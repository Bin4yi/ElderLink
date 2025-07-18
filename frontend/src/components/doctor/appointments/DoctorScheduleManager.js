import React, { useState } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';

const timeSlots = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' }
];

const DoctorScheduleManager = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [dateSlots, setDateSlots] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSlotToggle = (date, slotIdx) => {
    setDateSlots(prev => {
      const slots = prev[date] || timeSlots.map(ts => ({ ...ts, isAvailable: false }));
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

  // Render a simple calendar for 31 days
  const renderCalendar = () => {
    const today = new Date();
    return (
      <div className="grid grid-cols-7 gap-2">
        {[...Array(31)].map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          return (
            <button
              key={dateStr}
              className={`p-2 rounded ${dateSlots[dateStr] ? 'bg-green-200' : 'bg-gray-100'}`}
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
    <div>
      <h2 className="text-xl font-bold mb-4">Configure Your Availability</h2>
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