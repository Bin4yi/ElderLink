// src/components/staff/care/CareManagement.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { FileText, CheckCircle2, ClipboardList, Plus, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';

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
    ],
    careActivities: [
      { id: 1, time: '08:00 AM', elder: 'Margaret Thompson', activity: 'Morning medication check', status: 'completed' },
      { id: 2, time: '09:30 AM', elder: 'Robert Wilson', activity: 'Health monitoring', status: 'completed' },
      { id: 3, time: '11:00 AM', elder: 'Dorothy Davis', activity: 'Physical therapy session', status: 'in-progress' },
      { id: 4, time: '02:00 PM', elder: 'Harold Johnson', activity: 'Meal assistance', status: 'pending' },
      { id: 5, time: '04:00 PM', elder: 'Betty Miller', activity: 'Evening medication', status: 'pending' },
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
  // Mental Specialist Plans state
  const [mentalPlans, setMentalPlans] = useState([
    {
      id: 1,
      activity: 'Cognitive Stimulation Program',
      date: '2024-06-10',
      status: 'pending',
    },
    {
      id: 2,
      activity: 'Emotional Support Session',
      date: '2024-06-10',
      status: 'pending',
    },
    {
      id: 3,
      activity: 'Mindfulness & Relaxation',
      date: '2024-06-10',
      status: 'pending',
    },
    {
      id: 4,
      activity: 'Family Engagement Activity',
      date: '2024-06-10',
      status: 'pending',
    },
    {
      id: 5,
      activity: 'Behavioral Monitoring',
      date: '2024-06-10',
      status: 'pending',
    },
  ]);

  const handleMentalPlanAction = (planId) => {
    setMentalPlans(prev =>
      prev.map(plan =>
        plan.id === planId ? { ...plan, status: 'completed' } : plan
      )
    );
  };
  const [selectedElder, setSelectedElder] = useState(eldersData[0]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportText, setReportText] = useState('');
  const [activeTab, setActiveTab] = useState('care'); // 'care' or 'reports'
  
  // Report state
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    elderName: '',
    date: '',
    careManagement: '',
    healthMonitoring: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActivityAction = (activityId) => {
    setSelectedElder((prev) => ({
      ...prev,
      careActivities: prev.careActivities.map((a) =>
        a.id === activityId ? { ...a, status: 'completed' } : a
      ),
    }));
  };

  const handleCreateReport = () => {
    if (reportText.trim()) {
      setSelectedElder((prev) => ({
        ...prev,
        weeklyReport: [
          ...prev.weeklyReport,
          { date: new Date().toISOString().slice(0, 10), content: reportText },
        ],
      }));
      setReportText('');
      setShowReportForm(false);
    }
  };

  // Handle form input changes for reports
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new activity
  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.elderName || !form.date || !form.careManagement || !form.healthMonitoring) return;
    setActivities([...activities, { ...form }]);
    setForm({ elderName: '', date: '', careManagement: '', healthMonitoring: '' });
  };

  // Delete all activities for a given elder and week
  const handleDeleteWeek = (elderName, weekKey) => {
    setActivities(
      activities.filter((a) => {
        const weekStart = getWeekStart(a.date);
        const currentWeekKey = `${weekStart} to ${getWeekEnd(weekStart)}`;
        return !(a.elderName === elderName && currentWeekKey === weekKey);
      })
    );
  };

  // Group activities by elder and week
  const groupByElderAndWeek = () => {
    const grouped = {};
    activities.forEach((a) => {
      const weekStart = getWeekStart(a.date);
      const weekKey = `${weekStart} to ${getWeekEnd(weekStart)}`;
      if (!grouped[a.elderName]) grouped[a.elderName] = {};
      if (!grouped[a.elderName][weekKey]) grouped[a.elderName][weekKey] = [];
      grouped[a.elderName][weekKey].push(a);
    });
    return grouped;
  };

  // Helper to get week start (Monday) from date
  function getWeekStart(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }

  // Helper to get week end (Sunday) from week start
  function getWeekEnd(weekStartStr) {
    const d = new Date(weekStartStr);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }

  // Generate care report as PDF
  const handleGenerateReportPDF = () => {
    const grouped = groupByElderAndWeek();
    const doc = new jsPDF();
    let y = 10;
    let page = 1;

    Object.entries(grouped).forEach(([elderName, weeks]) => {
      Object.entries(weeks).forEach(([week, acts]) => {
        doc.setFontSize(14);
        doc.text(`Elder: ${elderName}`, 10, y);
        y += 8;
        doc.setFontSize(12);
        doc.text(`Week: ${week}`, 10, y);
        y += 8;
        acts.forEach((activity) => {
          doc.text(`  ${activity.date}`, 12, y);
          y += 7;
          doc.text(`    Care Management: ${activity.careManagement}`, 14, y);
          y += 7;
          doc.text(`    Health Monitoring: ${activity.healthMonitoring}`, 14, y);
          y += 10;
          if (y > 270) {
            doc.addPage();
            y = 10;
            page += 1;
          }
        });
        y += 5;
      });
    });

    if (activities.length === 0) {
      doc.text('No care activities to report.', 10, y);
    }

    doc.save('care_report.pdf');
  };

  // Submit weekly care activity report to the system
  const handleSubmitReport = async () => {
    if (activities.length === 0) {
      setSubmissionStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('');

    try {
      const grouped = groupByElderAndWeek();
      const reportData = {
        submittedBy: 'Staff Member', // This would come from auth context
        submissionDate: new Date().toISOString(),
        reportType: 'weekly_care_activity',
        data: grouped,
        totalActivities: activities.length,
        elders: Object.keys(grouped)
      };

      // This would be replaced with actual API call
      const response = await fetch('/api/care-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token auth
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        setSubmissionStatus('success');
        // Optionally clear activities after successful submission
        // setActivities([]);
      } else {
        setSubmissionStatus('error');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleLayout title="Elder Care Management & Reports">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('care')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'care'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="inline mr-2" size={16} />
              Care Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="inline mr-2" size={16} />
              Mental Specialist plans
            </button>
          </div>

          {/* Care Management Tab */}
          {activeTab === 'care' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:gap-8">
                {/* Elder Details (single assigned elder) */}
                <div className="md:w-1/2">
                  <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                    <FileText size={22} className="text-blue-600" />
                    <span>{selectedElder.name}</span>
                  </h2>
                  <div className="mt-2 text-gray-700 text-lg">
                    <div className="mb-1">&nbsp;</div>
                    <div className="mb-1 font-semibold">Age: {selectedElder.age}</div>
                    <div className="font-semibold">Gender: {selectedElder.gender}</div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 mb-1 text-xl">Medical History</h3>
                    <ul className="list-disc ml-6 text-gray-700 text-lg">
                      {selectedElder.medicalHistory.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Daily Care Activities */}
                <div className="md:w-1/2 mt-8 md:mt-0">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <ClipboardList size={20} className="text-blue-600" />
                    Care Activities
                  </h3>
                  {selectedElder.careActivities.length === 0 ? (
                    <p className="text-gray-500">No care activities assigned for today.</p>
                  ) : (
                    <div className="space-y-3">
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
                          <div>
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
          )}

          {/* Mental Specialist Plans Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-600" />
                  Mental Specialist Plans
                </h3>
                <div className="space-y-3">
                  {mentalPlans.map(plan => (
                    <div
                      key={plan.id}
                      className={`flex flex-col md:flex-row md:items-center md:justify-between p-3 border rounded-md ${
                        plan.status === 'completed'
                          ? 'bg-green-50 border-green-200'
                          : plan.status === 'in-progress'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-blue-700">{plan.activity}</div>
                        <div className="text-gray-600 text-sm">
                          {plan.id === 1 && 'Daily memory games, puzzles, and group discussions to enhance cognitive function.'}
                          {plan.id === 2 && 'Weekly one-on-one counseling with a mental health specialist to address anxiety, depression, or loneliness.'}
                          {plan.id === 3 && 'Guided meditation and breathing exercises every morning to reduce stress and promote calmness.'}
                          {plan.id === 4 && 'Monthly family video calls and shared activities to strengthen social bonds and reduce isolation.'}
                          {plan.id === 5 && 'Regular check-ins and behavioral assessments to identify early signs of mental health concerns.'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{plan.date}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-opacity-30 font-medium capitalize">
                          {plan.status}
                        </span>
                      </div>
                      {plan.status !== 'completed' && (
                        <button
                          onClick={() => handleMentalPlanAction(plan.id)}
                          className="mt-2 md:mt-0 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold shadow flex items-center gap-1"
                        >
                          <CheckCircle2 size={25} />
                          Mark as Done
                        </button>
                      )}
                    </div>
                  ))}
                  {mentalPlans.length === 0 && (
                    <p className="text-gray-500">No mental specialist plans assigned for today.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        
        </div>
      </div>
    </RoleLayout>
  );
};

export default CareManagement;
