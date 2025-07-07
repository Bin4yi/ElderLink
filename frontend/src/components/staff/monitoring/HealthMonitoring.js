import React, { useState } from 'react';
import { generateObservationPDF } from './observationPDF';
import RoleLayout from '../../common/RoleLayout';


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

  // Track which activity is being edited and its vitals
  const [editId, setEditId] = useState(null);
  const [editVitals, setEditVitals] = useState({ heartRate: '', bloodPressure: '' });

  const handleDelete = (id) => {
    setTodaySchedule(todaySchedule.filter((activity) => activity.id !== id));
  };

  const handleEditClick = (activity) => {
    setEditId(activity.id);
    setEditVitals({
      heartRate: activity.vitals?.heartRate || '',
      bloodPressure: activity.vitals?.bloodPressure || ''
    });
  };

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setEditVitals((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalsSave = (id) => {
    setTodaySchedule((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              vitals: {
                heartRate: editVitals.heartRate,
                bloodPressure: editVitals.bloodPressure
              }
            }
          : activity
      )
    );
    setEditId(null);
    setEditVitals({ heartRate: '', bloodPressure: '' });
  };

  const handleVitalsCancel = () => {
    setEditId(null);
    setEditVitals({ heartRate: '', bloodPressure: '' });
  };

  return (
    <RoleLayout title="Health Monitoring">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-10 space-y-12">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Health Monitoring Activities</h2>
            <p className="text-gray-500 mt-2">
              Review, update, and view vital signs for elderly residents. (heart rate, blood pressure)
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
                <div className="flex-1">
                  <p className="text-sm font-semibold">{activity.time} - {activity.elder}</p>
                  <p className="text-sm text-gray-700">{activity.task}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-opacity-30 font-medium capitalize">
                    {activity.status}
                  </span>
                  {/* Vitals Visuals or Edit Form */}
                  {editId === activity.id ? (
                    <div className="mt-2 flex flex-col gap-2 text-xs max-w-xs">
                      <div className="flex gap-2 items-center">
                        <label className="w-24 text-gray-700 font-medium" htmlFor={`heartRate-${activity.id}`}>Heart Rate:</label>
                        <input
                          id={`heartRate-${activity.id}`}
                          type="text"
                          name="heartRate"
                          value={editVitals.heartRate}
                          onChange={handleVitalsChange}
                          placeholder="Heart Rate (bpm)"
                          className="px-2 py-1 border rounded w-32"
                        />
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <label className="w-24 text-gray-700 font-medium" htmlFor={`bloodPressure-${activity.id}`}>Blood Pressure:</label>
                        <input
                          id={`bloodPressure-${activity.id}`}
                          type="text"
                          name="bloodPressure"
                          value={editVitals.bloodPressure}
                          onChange={handleVitalsChange}
                          placeholder="Blood Pressure"
                          className="px-2 py-1 border rounded w-32"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleVitalsSave(activity.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleVitalsCancel}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    activity.vitals && (activity.vitals.heartRate || activity.vitals.bloodPressure) && (
                      <div className="mt-2 flex gap-4 text-xs">
                        {activity.vitals.heartRate && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                            <span className="font-semibold">Heart Rate:</span> ❤ {activity.vitals.heartRate} bpm
                          </span>
                        )}
                        {activity.vitals.bloodPressure && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                            <span className="font-semibold">Blood Pressure:</span> 🩺 {activity.vitals.bloodPressure}
                          </span>
                        )}
                      </div>
                    )
                  )}
                  {/* Document Daily Observations Button for each patient */}
                  <button
                    className="mt-2 bg-green-500 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-semibold shadow"
                    onClick={() => generateObservationPDF(activity)}
                  >
                    Document Daily Observations
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(activity)}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold shadow"
                  >
                    Update Vitals
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="mt-2 bg-green-500 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-semibold shadow"
                    title="Delete"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};
export default HealthMonitoring;