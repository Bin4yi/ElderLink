// src/components/staff/care/CareManagement.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { FileText, CheckCircle2, ClipboardList } from 'lucide-react';

const eldersData = [
  {
    id: 1,
    name: 'Margaret Thompson',
    age: 82,
    gender: 'Female',
    medicalHistory: [
      'Hypertension',
      'Osteoporosis',
      'Mild cognitive impairment',
      'Chronic pain in lower back',
      'Anxiety and depression',
      'High cholesterol',

    ],
    careActivities: [
      { id: 1, time: '08:00 AM', elder: 'Margaret Thompson', activity: 'Morning medication check', status: 'completed' },
      { id: 2, time: '09:30 AM', elder: 'Margaret Thompson', activity: 'Health monitoring', status: 'completed' },
      { id: 3, time: '11:00 AM', elder: 'Margaret Thompson', activity: 'Physical therapy session', status: 'in-progress' },
      { id: 4, time: '02:00 PM', elder: 'Margaret Thompson', activity: 'Meal assistance', status: 'pending' },
      { id: 5, time: '04:00 PM', elder: 'Margaret Thompson', activity: 'Evening medication', status: 'pending' },
    ],
    weeklyReport: [],
  },
  {
    id: 2,
    name: 'Robert Wilson',
    age: 79,
    gender: 'Male',
    medicalHistory: [
      'Type 2 Diabetes',
      'Arthritis',
    ],
    careActivities: [
      { id: 1, date: '2024-06-10', activity: 'Weekly checkup', status: 'pending' },
    ],
    weeklyReport: [],
  },
];

const CareManagement = () => {
  const [selectedElder, setSelectedElder] = useState(eldersData[0]);

  const handleActivityAction = (activityId) => {
    setSelectedElder((prev) => ({
      ...prev,
      careActivities: prev.careActivities.map((a) =>
        a.id === activityId ? { ...a, status: 'completed' } : a
      ),
    }));
  };

  return (
    <RoleLayout title="Elder Care Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="space-y-8">
            {/* Daily Care Activities */}
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <ClipboardList size={20} className="text-blue-600" />
                Care Activities
              </h3>
                {selectedElder.careActivities.length === 0 ? (
                  <p className="text-gray-500">No care activities assigned for today.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedElder.careActivities.map(activity => (
                      <div
                        key={activity.id}
                        className={`flex justify-between items-center p-3 border rounded-md ${
                          activity.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : activity.status === 'in-progress'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-1 pr-4">
                          <div className="font-medium">{activity.activity}</div>
                          <div className="text-xs text-gray-500">{activity.date}</div>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-opacity-30 font-medium capitalize">
                            {activity.status}
                          </span>
                        </div>
                        {activity.status !== 'completed' && (
                          <button
                            onClick={() => handleActivityAction(activity.id)}
                            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold shadow flex items-center gap-1"
                          >
                            <CheckCircle2 size={25} />
                            Mark as Done
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default CareManagement;
