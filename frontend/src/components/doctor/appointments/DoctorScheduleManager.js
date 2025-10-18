import React, { useState, useEffect } from 'react';
import { doctorAppointmentService } from '../../../services/doctorAppointment';
import toast from 'react-hot-toast';

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

  const [currentMonth, setCurrentMonth] = useState(todayObj.getMonth());
  const [currentYear, setCurrentYear] = useState(todayObj.getFullYear());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedDateForSlots, setSelectedDateForSlots] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [customSchedule, setCustomSchedule] = useState({
    date: todayStr,
    startTime: '09:00',
    endTime: '10:00',
    slotDuration: 30
  });

  // Predefined time slots
  const predefinedSlots = [
    { startTime: '09:00', endTime: '10:00', label: '9:00 AM - 10:00 AM' },
    { startTime: '10:00', endTime: '11:00', label: '10:00 AM - 11:00 AM' },
    { startTime: '11:00', endTime: '12:00', label: '11:00 AM - 12:00 PM' },
    { startTime: '12:00', endTime: '13:00', label: '12:00 PM - 1:00 PM' },
    { startTime: '13:00', endTime: '14:00', label: '1:00 PM - 2:00 PM' },
    { startTime: '14:00', endTime: '15:00', label: '2:00 PM - 3:00 PM' },
    { startTime: '15:00', endTime: '16:00', label: '3:00 PM - 4:00 PM' },
    { startTime: '16:00', endTime: '17:00', label: '4:00 PM - 5:00 PM' },
    { startTime: '17:00', endTime: '18:00', label: '5:00 PM - 6:00 PM' },
    { startTime: '18:00', endTime: '19:00', label: '6:00 PM - 7:00 PM' },
    { startTime: '19:00', endTime: '20:00', label: '7:00 PM - 8:00 PM' },
  ];

  // Fetch schedules when month changes
  useEffect(() => {
    fetchSchedules();
  }, [currentMonth, currentYear]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await doctorAppointmentService.getDoctorSchedule({
        month: currentMonth + 1, // Backend expects 1-12
        year: currentYear
      });
      
      if (response.success && response.data) {
        setSchedules(response.data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomSchedule = async () => {
    try {
      setLoading(true);
      await doctorAppointmentService.addSchedule(customSchedule);
      toast.success('Schedule added successfully!');
      setShowAddModal(false);
      fetchSchedules();
      // Reset form
      setCustomSchedule({
        date: todayStr,
        startTime: '09:00',
        endTime: '10:00',
        slotDuration: 30
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async (days) => {
    try {
      setLoading(true);
      const startDate = new Date();
      
      const response = await doctorAppointmentService.addBulkSchedules({
        startDate: getLocalDateString(startDate),
        days: days,
        timeSlots: [
          { startTime: '09:00', endTime: '12:00', slotDuration: 30 }, // Morning
          { startTime: '14:00', endTime: '17:00', slotDuration: 30 }, // Afternoon
        ],
        skipSunday: true
      });
      
      toast.success(`Successfully added schedules for ${days} days!`);
      fetchSchedules();
    } catch (error) {
      console.error('Error adding bulk schedules:', error);
      toast.error(error.response?.data?.message || 'Failed to add schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTimeSlotSelector = (date) => {
    setSelectedDateForSlots(date);
    setSelectedTimeSlots([]);
    setShowTimeSlotModal(true);
  };

  const handleToggleTimeSlot = (slot) => {
    const exists = selectedTimeSlots.find(
      s => s.startTime === slot.startTime && s.endTime === slot.endTime
    );
    
    if (exists) {
      setSelectedTimeSlots(selectedTimeSlots.filter(
        s => !(s.startTime === slot.startTime && s.endTime === slot.endTime)
      ));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const handleSaveTimeSlots = async () => {
    if (selectedTimeSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    try {
      setLoading(true);
      
      const schedulesToAdd = selectedTimeSlots.map(slot => ({
        date: selectedDateForSlots,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotDuration: 30,
        isAvailable: true
      }));

      await doctorAppointmentService.addBulkSchedules({
        schedules: schedulesToAdd
      });

      toast.success(`Added ${selectedTimeSlots.length} time slots successfully!`);
      setShowTimeSlotModal(false);
      setSelectedTimeSlots([]);
      fetchSchedules();
    } catch (error) {
      console.error('Error saving time slots:', error);
      toast.error(error.response?.data?.message || 'Failed to save time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      setLoading(true);
      await doctorAppointmentService.deleteSchedule(scheduleId);
      toast.success('Schedule deleted successfully!');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  // Get current month/year
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  // Calendar grid: get first day of month (0=Sun, 1=Mon, ...)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Group schedules by date
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.date]) {
      acc[schedule.date] = [];
    }
    acc[schedule.date].push(schedule);
    return acc;
  }, {});

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
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
      const dateObj = new Date(currentYear, currentMonth, day);
      const dateStr = getLocalDateString(dateObj);
      const hasSchedules = schedulesByDate[dateStr] && schedulesByDate[dateStr].length > 0;
      const isToday = dateStr === todayStr;
      const isPastDate = dateObj < todayObj && dateStr !== todayStr;
      
      calendarCells.push(
        <div
          key={dateStr}
          className={`p-2 rounded h-24 text-center border transition relative cursor-pointer
            ${isPastDate 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : hasSchedules 
                ? 'bg-green-100 border-green-400 hover:bg-green-200' 
                : 'bg-white border-gray-200 hover:bg-blue-50'
            }
            ${isToday ? 'ring-2 ring-blue-500' : ''}
          `}
          onClick={() => !isPastDate && handleOpenTimeSlotSelector(dateStr)}
        >
          <div className={`font-semibold ${isToday ? 'text-blue-600' : ''}`}>{day}</div>
          {hasSchedules && (
            <div className="text-xs text-green-700 mt-1">
              {schedulesByDate[dateStr].length} slot{schedulesByDate[dateStr].length > 1 ? 's' : ''}
            </div>
          )}
          {!isPastDate && !hasSchedules && (
            <div className="text-xs text-gray-400 mt-1">Click to add</div>
          )}
        </div>
      );
    }
    
    // Render grid
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            ← Previous
          </button>
          <h3 className="text-xl font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Next →
          </button>
        </div>
        
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Manage Your Availability
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400"
          >
            + Add Custom Schedule
          </button>
          <button
            onClick={() => handleBulkAdd(7)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400"
          >
            + Add Next 7 Days
          </button>
          <button
            onClick={() => handleBulkAdd(30)}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:bg-gray-400"
          >
            + Add Next 30 Days
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {renderCalendar()}
      </div>
      
      <div className="flex gap-4 text-sm mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
          <span>Has schedules</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
          <span>Click to add time slots</span>
        </div>
      </div>

      {/* List all schedules grouped by date */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          All Schedules for {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        {schedules.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No schedules found for this month. Click "Add Custom Schedule" or "Add Next 7/30 Days" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(schedulesByDate)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, dateSchedules]) => (
                <div key={date} className="border rounded-lg p-4 bg-white">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dateSchedules.map(schedule => (
                      <div 
                        key={schedule.id} 
                        className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                      >
                        <span className="text-sm font-medium">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                          title="Delete this schedule"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Custom Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add Custom Schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={customSchedule.date}
                  onChange={(e) => setCustomSchedule({ ...customSchedule, date: e.target.value })}
                  min={todayStr}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={customSchedule.startTime}
                  onChange={(e) => setCustomSchedule({ ...customSchedule, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={customSchedule.endTime}
                  onChange={(e) => setCustomSchedule({ ...customSchedule, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                <select
                  value={customSchedule.slotDuration}
                  onChange={(e) => setCustomSchedule({ ...customSchedule, slotDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddCustomSchedule}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400"
              >
                {loading ? 'Adding...' : 'Add Schedule'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg disabled:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Selection Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">Select Time Slots</h3>
            <p className="text-gray-600 mb-4">
              Date: {new Date(selectedDateForSlots + 'T00:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Click on time slots to select/deselect. Selected: {selectedTimeSlots.length}
              </p>
            </div>

            {/* Check if date already has schedules */}
            {schedulesByDate[selectedDateForSlots] && schedulesByDate[selectedDateForSlots].length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ This date already has {schedulesByDate[selectedDateForSlots].length} schedule(s). 
                  You can add more slots or delete existing ones below.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {predefinedSlots.map((slot) => {
                const isSelected = selectedTimeSlots.some(
                  s => s.startTime === slot.startTime && s.endTime === slot.endTime
                );
                const alreadyExists = schedulesByDate[selectedDateForSlots]?.some(
                  s => s.startTime === `${slot.startTime}:00` && s.endTime === `${slot.endTime}:00`
                );
                
                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    onClick={() => !alreadyExists && handleToggleTimeSlot(slot)}
                    disabled={alreadyExists}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm
                      ${alreadyExists
                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                        : isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                      }`}
                  >
                    {slot.label}
                    {alreadyExists && <div className="text-xs mt-1">Already added</div>}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSaveTimeSlots}
                disabled={loading || selectedTimeSlots.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : `Add ${selectedTimeSlots.length} Selected Slot${selectedTimeSlots.length !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => {
                  setShowTimeSlotModal(false);
                  setSelectedTimeSlots([]);
                }}
                disabled={loading}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg disabled:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorScheduleManager;