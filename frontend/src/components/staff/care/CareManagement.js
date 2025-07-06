// src/components/staff/care/CareManagement.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { PlusCircle, Trash2 } from 'lucide-react';

const CareManagement = () => {
  const [todaySchedule, setTodaySchedule] = useState([
    { id: 1, time: '08:00 AM', elder: 'Margaret Thompson', task: 'Morning medication check', status: 'completed' },
    { id: 2, time: '09:30 AM', elder: 'Robert Wilson', task: 'Health monitoring', status: 'completed' },
    { id: 3, time: '11:00 AM', elder: 'Dorothy Davis', task: 'Physical therapy session', status: 'in-progress' },
    { id: 4, time: '02:00 PM', elder: 'Harold Johnson', task: 'Meal assistance', status: 'pending' },
    { id: 5, time: '04:00 PM', elder: 'Betty Miller', task: 'Evening medication', status: 'pending' },
  ]);

  const [newActivity, setNewActivity] = useState({
    time: '',
    elder: '',
    task: '',
    status: 'pending',
  });

  const handleChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const { time, elder, task, status } = newActivity;
    if (time && elder && task && status) {
      const newItem = {
        id: todaySchedule.length + 1,
        ...newActivity,
      };
      setTodaySchedule([...todaySchedule, newItem]);
      setNewActivity({
        time: '',
        elder: '',
        task: '',
        status: 'pending',
      });
    }
  };

  const handleDelete = (id) => {
    setTodaySchedule(todaySchedule.filter((item) => item.id !== id));
  };

  const statusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'pending':
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <RoleLayout title="Care Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-10 space-y-12">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Daily Care Activities</h2>
            <p className="text-gray-500 mt-2">
              Review and assign daily care activities for elderly residents.
            </p>
          </div>

          {/* Today's Schedule */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Today's Schedule</h3>
            {todaySchedule.length === 0 && (
              <p className="text-gray-500">No activities scheduled for today.</p>
            )}
            {todaySchedule.map((activity) => (
              <div
                key={activity.id}
                className={`flex justify-between items-center p-4 border rounded-md ${statusColor(activity.status)}`}
              >
                <div>
                  <p className="text-sm font-semibold">{activity.time} - {activity.elder}</p>
                  <p className="text-sm text-gray-700">{activity.task}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-opacity-30 font-medium capitalize">
                    {activity.status}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* New Activity Form */}
          <div className="border-t pt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <PlusCircle size={24} className="text-blue-600" />
              Assign New Activity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'time', label: 'Time', placeholder: 'e.g., 10:00 AM' },
                { name: 'elder', label: 'Elder Name', placeholder: 'e.g., Alice Brown' },
                { name: 'task', label: 'Task', placeholder: 'e.g., Blood pressure check' },
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                  ],
                },
              ].map(({ name, label, placeholder, type, options }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  {type === 'select' ? (
                    <select
                      name={name}
                      value={newActivity[name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={name}
                      value={newActivity[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm transition"
              >
                Assign Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default CareManagement;