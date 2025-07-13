import React, { useState } from 'react';
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
      elder: 'Margaret Thompson',
      status: 'completed',
      vitals: { 
        heartRate: 72, 
        bloodPressure: '120/80',
        steps: 2850,
        sleep: '7.5 hours'
      }
    }
  ]);

  // Track which activity is being edited and its vitals
  const [editId, setEditId] = useState(null);
  const [editVitals, setEditVitals] = useState({ heartRate: '', bloodPressure: '', steps: '', sleep: '' });

  const handleDelete = (id) => {
    setTodaySchedule(todaySchedule.filter((activity) => activity.id !== id));
  };

  const handleEditClick = (activity) => {
    setEditId(activity.id);
    setEditVitals({
      heartRate: activity.vitals?.heartRate || '',
      bloodPressure: activity.vitals?.bloodPressure || '',
      steps: activity.vitals?.steps || '',
      sleep: activity.vitals?.sleep || ''
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
                bloodPressure: editVitals.bloodPressure,
                steps: editVitals.steps,
                sleep: editVitals.sleep
              }
            }
          : activity
      )
    );
    setEditId(null);
    setEditVitals({ heartRate: '', bloodPressure: '', steps: '', sleep: '' });
  };

  const handleVitalsCancel = () => {
    setEditId(null);
    setEditVitals({ heartRate: '', bloodPressure: '', steps: '', sleep: '' });
  };

  return (
    <RoleLayout title="Health Monitoring">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-10 space-y-12">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Health Monitoring Activities</h2>
            <p className="text-gray-500 mt-2">
              Review, update, and view vital signs for elderly residents. (heart rate, blood pressure, steps, sleep)
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
                className={`p-4 border rounded-md ${statusColor(activity.status)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-3xl font-bold">{activity.elder}</p>
                  <button
                    onClick={() => handleEditClick(activity)}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold shadow"
                  >
                    Update Vitals
                  </button>
                </div>
                <div className="flex-1">
                  {/* Vitals Visuals or Edit Form */}
                  {editId === activity.id ? (
                    <div className="mt-2 flex flex-col gap-2 text-base max-w-xs">
                      <div className="flex gap-2 items-center">
                        <label className="w-28 text-gray-700 font-semibold" htmlFor={`heartRate-${activity.id}`}>Heart Rate:</label>
                        <input
                          id={`heartRate-${activity.id}`}
                          type="text"
                          name="heartRate"
                          value={editVitals.heartRate}
                          onChange={handleVitalsChange}
                          placeholder="Heart Rate (bpm)"
                          className="px-2 py-1 border rounded w-36"
                        />
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <label className="w-28 text-gray-700 font-semibold" htmlFor={`bloodPressure-${activity.id}`}>Blood Pressure:</label>
                        <input
                          id={`bloodPressure-${activity.id}`}
                          type="text"
                          name="bloodPressure"
                          value={editVitals.bloodPressure}
                          onChange={handleVitalsChange}
                          placeholder="Blood Pressure"
                          className="px-2 py-1 border rounded w-36"
                        />
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <label className="w-28 text-gray-700 font-semibold" htmlFor={`steps-${activity.id}`}>Steps Today:</label>
                        <input
                          id={`steps-${activity.id}`}
                          type="text"
                          name="steps"
                          value={editVitals.steps}
                          onChange={handleVitalsChange}
                          placeholder="Steps"
                          className="px-2 py-1 border rounded w-36"
                        />
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <label className="w-28 text-gray-700 font-semibold" htmlFor={`sleep-${activity.id}`}>Sleep:</label>
                        <input
                          id={`sleep-${activity.id}`}
                          type="text"
                          name="sleep"
                          value={editVitals.sleep}
                          onChange={handleVitalsChange}
                          placeholder="Sleep hours"
                          className="px-2 py-1 border rounded w-36"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleVitalsSave(activity.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-base font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleVitalsCancel}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-base font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    activity.vitals && (activity.vitals.heartRate || activity.vitals.bloodPressure || activity.vitals.steps || activity.vitals.sleep) && (
                      <div className="mt-4 flex flex-col gap-2 text-lg">
                        {activity.vitals.heartRate && (
                          <span className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded text-lg">
                            <span className="font-bold">Heart Rate:</span> ❤ {activity.vitals.heartRate} bpm
                          </span>
                        )}
                        {activity.vitals.bloodPressure && (
                          <span className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded text-lg">
                            <span className="font-bold">Blood Pressure:</span> 🩺 {activity.vitals.bloodPressure}
                          </span>
                        )}
                        {activity.vitals.steps && (
                          <span className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded text-lg">
                            <span className="font-bold">Steps Today:</span> 👟 {activity.vitals.steps} steps
                          </span>
                        )}
                        {activity.vitals.sleep && (
                          <span className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded text-lg">
                            <span className="font-bold">Sleep:</span> 😴 {activity.vitals.sleep}
                          </span>
                        )}
                      </div>
                    )
                  )}
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
