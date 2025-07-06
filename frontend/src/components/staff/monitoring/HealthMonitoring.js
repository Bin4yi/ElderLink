import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { PlusCircle, Trash2 } from 'lucide-react';

const statusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 border-green-200';
    case 'in-progress':
      return 'bg-yellow-50 border-yellow-200';
    case 'pending':
      return 'bg-gray-50 border-gray-200';
    default:
      return '';
  }
};

const HealthMonitoring = () => {
  const [todaySchedule, setTodaySchedule] = useState([
    {
      id: 1,
      time: '08:00 AM',
      elder: 'Margaret Thompson',
      task: 'Morning medication check',
      status: 'completed',
      vitals: { heartRate: 72, bloodPressure: '120/80' }
    },
    {
      id: 2,
      time: '09:30 AM',
      elder: 'Robert Wilson',
      task: 'Health monitoring',
      status: 'completed',
      vitals: { heartRate: 80, bloodPressure: '130/85' }
    },
    // ...other activities...
  ]);

  const [newActivity, setNewActivity] = useState({
    time: '',
    elder: '',
    task: '',
    status: 'pending',
    vitals: { heartRate: '', bloodPressure: '' }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'heartRate' || name === 'bloodPressure') {
      setNewActivity({
        ...newActivity,
        vitals: { ...newActivity.vitals, [name]: value }
      });
    } else {
      setNewActivity({ ...newActivity, [name]: value });
    }
  };

  const handleAdd = () => {
    const { time, elder, task, status, vitals } = newActivity;
    if (time && elder && task && status) {
      const newItem = {
        id: todaySchedule.length + 1,
        ...newActivity,
        vitals: {
          heartRate: vitals.heartRate || null,
          bloodPressure: vitals.bloodPressure || null
        }
      };
      setTodaySchedule([...todaySchedule, newItem]);
      setNewActivity({
        time: '',
        elder: '',
        task: '',
        status: 'pending',
        vitals: { heartRate: '', bloodPressure: '' }
      });
    }
  };

  // Delete an activity by id
  const handleDelete = (id) => {
    setTodaySchedule(todaySchedule.filter((activity) => activity.id !== id));
  };

  // ...statusColor as before...

  return (
    <RoleLayout title="Health Monitoring">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-10 space-y-12">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Health Monitoring Activities</h2>
            <p className="text-gray-500 mt-2">
              Review, assign, and view vital signs for elderly residents.( heart rate, blood pressure )
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
                  {/* Vitals Visuals */}
                  {activity.vitals && (activity.vitals.heartRate || activity.vitals.bloodPressure) && (
                    <div className="mt-2 flex gap-4 text-xs">
                      {activity.vitals.heartRate && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          ❤️ {activity.vitals.heartRate} bpm
                        </span>
                      )}
                      {activity.vitals.bloodPressure && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          🩺 {activity.vitals.bloodPressure}
                        </span>
                      )}
                    </div>
                  )}
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
              {/* Existing fields */}
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
                // New vitals fields
                { name: 'heartRate', label: 'Heart Rate (bpm)', placeholder: 'e.g., 75', vitals: true },
                { name: 'bloodPressure', label: 'Blood Pressure', placeholder: 'e.g., 120/80', vitals: true },
              ].map(({ name, label, placeholder, type, options, vitals }) => (
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
                      value={vitals ? newActivity.vitals[name] : newActivity[name]}
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
export default HealthMonitoring;