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
      { id: 1, date: '2024-06-10', activity: 'Morning medication', status: 'completed' },
      { id: 2, date: '2024-06-10', activity: 'Physical therapy', status: 'pending' },
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
              Activity Reports
            </button>
          </div>

          {/* Care Management Tab */}
          {activeTab === 'care' && (
            <div className="space-y-8">
              {/* Elder Selection */}
              <div className="flex flex-col md:flex-row md:gap-8">
                {/* Elder Details and Selection */}
                <div className="md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Elder</label>
                  <select
                    value={selectedElder.id}
                    onChange={e => {
                      const elder = eldersData.find(el => el.id === Number(e.target.value));
                      setSelectedElder(elder);
                      setShowReportForm(false);
                    }}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md mb-4"
                  >
                    {eldersData.map(elder => (
                      <option key={elder.id} value={elder.id}>{elder.name}</option>
                    ))}
                  </select>
                  <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                    <FileText size={22} className="text-blue-600" />
                    {selectedElder.name}
                  </h2>
                  <div className="mt-2 text-gray-700">
                    <div>Age: {selectedElder.age}</div>
                    <div>Gender: {selectedElder.gender}</div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 mb-1">Medical History</h3>
                    <ul className="list-disc ml-6 text-gray-700">
                      {selectedElder.medicalHistory.map((item, idx) => (
                        <li key={idx}>{item}</li>
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

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              {/* Add Care Activity Form */}
              <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <Plus size={22} className="text-blue-600" />
                  Add Care Activity
                </h2>
                <form onSubmit={handleAdd} className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="elderName"
                      value={form.elderName}
                      onChange={handleChange}
                      placeholder="Elder Name"
                      className="border border-gray-300 p-3 rounded-md"
                      required
                    />
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-md"
                      required
                    />
                  </div>
                  <input
                    name="careManagement"
                    value={form.careManagement}
                    onChange={handleChange}
                    placeholder="Care Management Details"
                    className="w-full border border-gray-300 p-3 rounded-md"
                    required
                  />
                  <input
                    name="healthMonitoring"
                    value={form.healthMonitoring}
                    onChange={handleChange}
                    placeholder="Health Monitoring Details"
                    className="w-full border border-gray-300 p-3 rounded-md"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold shadow flex items-center gap-2"
                  >
                    <Plus size={25} />
                    Add Activity
                  </button>
                </form>
              </div>

              {/* Generate Report Button */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleGenerateReportPDF}
                  className="mt-2 bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold shadow flex items-center gap-2"
                >
                  <FileText size={25} />
                  Generate PDF Report
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting || activities.length === 0}
                  className={`mt-2 px-3 py-1 rounded text-xs font-semibold shadow flex items-center gap-2 ${
                    isSubmitting || activities.length === 0
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-500 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Submit Report
                    </>
                  )}
                </button>
              </div>

              {/* Submission Status */}
              {submissionStatus && (
                <div className={`p-4 rounded-md ${
                  submissionStatus === 'success' 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  {submissionStatus === 'success' 
                    ? 'Report submitted successfully!' 
                    : 'Failed to submit report. Please try again.'}
                </div>
              )}

              {/* Weekly Care Activity Report */}
              <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={22} className="text-blue-600" />
                  Weekly Care Activity Report
                </h2>
                {(() => {
                  const grouped = groupByElderAndWeek();
                  return Object.keys(grouped).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No care activities added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(grouped).map(([elderName, weeks]) =>
                        Object.entries(weeks).map(([week, acts]) => (
                          <div key={elderName + week} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">{elderName}</h3>
                                <p className="text-sm text-gray-600">Week: {week}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteWeek(elderName, week)}
                                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold shadow"
                              >
                                Delete Week
                              </button>
                            </div>
                            <div className="space-y-4">
                              {acts.map((activity, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-md">
                                  <div className="font-medium text-gray-800 mb-2">{activity.date}</div>
                                  <div className="space-y-1">
                                    <div>
                                      <span className="font-medium text-blue-600">Care Management:</span> {activity.careManagement}
                                    </div>
                                    <div>
                                      <span className="font-medium text-green-600">Health Monitoring:</span> {activity.healthMonitoring}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default CareManagement;
