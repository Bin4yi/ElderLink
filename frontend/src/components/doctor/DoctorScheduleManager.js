// frontend/src/components/doctor/DoctorScheduleManager.js
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const DoctorScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    isAvailable: true
  });

  useEffect(() => {
    fetchSchedules();
  }, [selectedMonth]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      
      const response = await axios.get('/api/doctor/schedules', {
        params: { year, month }
      });
      
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.date || !newSchedule.startTime || !newSchedule.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/doctor/schedules', newSchedule);
      toast.success('Schedule added successfully');
      setShowAddModal(false);
      setNewSchedule({
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        isAvailable: true
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error('Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async (days) => {
    try {
      setLoading(true);
      const today = new Date();
      const schedulesToAdd = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.getDay();

        // Skip Sundays
        if (dayOfWeek === 0) continue;

        const dateStr = date.toISOString().split('T')[0];

        // Morning session
        schedulesToAdd.push({
          date: dateStr,
          startTime: '09:00:00',
          endTime: '12:00:00',
          slotDuration: 30,
          isAvailable: true
        });

        // Afternoon session (Monday to Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          schedulesToAdd.push({
            date: dateStr,
            startTime: '14:00:00',
            endTime: '17:00:00',
            slotDuration: 30,
            isAvailable: true
          });
        }

        // Evening session (Monday, Wednesday, Friday)
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
          schedulesToAdd.push({
            date: dateStr,
            startTime: '18:00:00',
            endTime: '20:00:00',
            slotDuration: 30,
            isAvailable: true
          });
        }
      }

      await axios.post('/api/doctor/schedules/bulk', { schedules: schedulesToAdd });
      toast.success(`Added schedules for next ${days} days`);
      fetchSchedules();
    } catch (error) {
      console.error('Error adding bulk schedules:', error);
      toast.error('Failed to add bulk schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await axios.delete(`/api/doctor/schedules/${scheduleId}`);
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const groupSchedulesByDate = () => {
    const grouped = {};
    schedules.forEach(schedule => {
      if (!grouped[schedule.date]) {
        grouped[schedule.date] = [];
      }
      grouped[schedule.date].push(schedule);
    });
    return grouped;
  };

  const groupedSchedules = groupSchedulesByDate();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Schedule</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkAdd(7)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Add Next 7 Days
          </button>
          <button
            onClick={() => handleBulkAdd(30)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Add Next 30 Days
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Custom Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedSchedules).length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No schedules found</p>
              <button
                onClick={() => handleBulkAdd(30)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Create Default Schedule (30 Days)
              </button>
            </div>
          ) : (
            Object.keys(groupedSchedules)
              .sort()
              .map(date => (
                <div key={date} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupedSchedules[date].map(schedule => (
                      <div
                        key={schedule.id}
                        className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {schedule.slotDuration || 30} min slots
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Custom Schedule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slot Duration (minutes)</label>
                <select
                  value={newSchedule.slotDuration}
                  onChange={(e) => setNewSchedule({ ...newSchedule, slotDuration: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
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
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorScheduleManager;
