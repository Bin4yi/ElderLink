// src/components/staff/mental/MentalHealthManagement.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { CheckCircle2, BarChart3, ClipboardList, FileText } from 'lucide-react';



const MentalHealthManagement = () => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'assessments'
  const [editingProgress, setEditingProgress] = useState({}); // Track which plan is being edited

  // Mental Health Assessments state
  const [mentalPlans, setMentalPlans] = useState([
    {
      id: 1,
      activity: 'Cognitive Stimulation Program',
      elderName: 'Margaret Thompson',
      assessmentType: 'Cognitive Therapy',
      date: '2024-06-10',
      duration: '45 minutes',
      status: 'pending',
    },
    {
      id: 2,
      activity: 'Emotional Support Session',
      elderName: 'Robert Johnson',
      assessmentType: 'Emotional Counseling',
      date: '2024-06-10',
      duration: '60 minutes',
      status: 'pending',
    },
    {
      id: 3,
      activity: 'Mindfulness & Relaxation',
      elderName: 'Sarah Williams',
      assessmentType: 'Stress Management',
      date: '2024-06-10',
      duration: '30 minutes',
      status: 'pending',
    },
    {
      id: 4,
      activity: 'Family Engagement Activity',
      elderName: 'James Brown',
      assessmentType: 'Social Therapy',
      date: '2024-06-10',
      duration: '90 minutes',
      status: 'pending',
    },
    {
      id: 5,
      activity: 'Behavioral Monitoring',
      elderName: 'Mary Davis',
      assessmentType: 'Behavioral Assessment',
      date: '2024-06-10',
      duration: '40 minutes',
      status: 'pending',
    },
  ]);

  // Treatment Plans state
  const [assessmentPlans, setAssessmentPlans] = useState([
    {
      id: 1,
      planTitle: 'Cognitive Function Enhancement Program',
      elderName: 'Margaret Thompson',
      startDate: '2024-06-12',
      targetedDate: '2024-09-12',
      progress: 75,
      status: 'pending',
      priority: 'high',
    },
    {
      id: 2,
      planTitle: 'Depression Management & Support Plan',
      elderName: 'Robert Johnson',
      startDate: '2024-06-13',
      targetedDate: '2024-08-13',
      progress: 45,
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 3,
      planTitle: 'Anxiety Reduction Therapy',
      elderName: 'Sarah Williams',
      startDate: '2024-06-14',
      targetedDate: '2024-07-14',
      progress: 90,
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 4,
      planTitle: 'Memory Enhancement & Cognitive Training',
      elderName: 'James Brown',
      startDate: '2024-06-15',
      targetedDate: '2024-10-15',
      progress: 60,
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: 5,
      planTitle: 'Social Engagement & Communication Skills',
      elderName: 'Mary Davis',
      startDate: '2024-06-16',
      targetedDate: '2024-08-16',
      progress: 30,
      status: 'pending',
      priority: 'low',
    },
  ]);

  const handleMentalPlanAction = (planId) => {
    setMentalPlans(prev =>
      prev.map(plan =>
        plan.id === planId ? { ...plan, status: 'completed' } : plan
      )
    );
  };

  const handleAssessmentAction = (assessmentId) => {
    setAssessmentPlans(prev =>
      prev.map(assessment =>
        assessment.id === assessmentId ? { ...assessment, status: 'completed' } : assessment
      )
    );
  };

  const handleProgressChange = (planId, newProgress) => {
    setEditingProgress(prev => ({
      ...prev,
      [planId]: newProgress
    }));
  };

  const handleUpdateProgress = (planId) => {
    const newProgress = editingProgress[planId];
    if (newProgress !== undefined && newProgress >= 0 && newProgress <= 100) {
      setAssessmentPlans(prev =>
        prev.map(plan =>
          plan.id === planId ? { ...plan, progress: parseInt(newProgress) } : plan
        )
      );
      // Clear the editing state for this plan
      setEditingProgress(prev => {
        const updated = { ...prev };
        delete updated[planId];
        return updated;
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssessmentDescription = (type) => {
    switch (type) {
      case 'cognitive':
        return 'Comprehensive evaluation of cognitive abilities including memory, attention, and problem-solving skills.';
      case 'mood':
        return 'Standardized depression screening to assess mood changes and emotional well-being.';
      case 'anxiety':
        return 'Assessment of anxiety levels and identification of anxiety-related symptoms and triggers.';
      case 'memory':
        return 'Detailed evaluation of short-term and long-term memory function and recall abilities.';
      case 'social':
        return 'Assessment of social engagement, communication skills, and interpersonal relationships.';
      default:
        return 'Mental health assessment to evaluate overall psychological well-being.';
    }
  };

  return (
    <RoleLayout title="Mental Health Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="inline mr-2" size={16} />
              Mental Health Assessments
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'assessments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="inline mr-2" size={16} />
              Treatment Plans
            </button>
          </div>

          {/* Mental Health Assessments Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-8">
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-600" />
                  Mental Health Assessments
                </h3>
                <div className="space-y-4">
                  {mentalPlans.filter(plan => plan.status !== 'completed').map(plan => (
                    <div
                      key={plan.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between p-5 border rounded-lg shadow-sm bg-white border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-blue-700 mb-2">{plan.activity}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-500" />
                            <span className="text-gray-600">
                              <span className="font-medium">Elder:</span> {plan.elderName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClipboardList size={16} className="text-gray-500" />
                            <span className="text-gray-600">
                              <span className="font-medium">Type:</span> {plan.assessmentType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-gray-500" />
                            <span className="text-gray-600">
                              <span className="font-medium">Date:</span> {plan.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-gray-500" />
                            <span className="text-gray-600">
                              <span className="font-medium">Duration:</span> {plan.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMentalPlanAction(plan.id)}
                        className="mt-4 md:mt-0 md:ml-6 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md flex items-center gap-2 transition-all"
                      >
                        <CheckCircle2 size={18} />
                        Mark as Done
                      </button>
                    </div>
                  ))}
                  {mentalPlans.filter(plan => plan.status !== 'completed').length === 0 && (
                    <p className="text-gray-500">No mental health assessments assigned for today.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Treatment Plans Tab */}
          {activeTab === 'assessments' && (
            <div className="space-y-8">
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-600" />
                  Treatment Plans
                </h3>
                <div className="space-y-4">
                  {assessmentPlans.map(plan => (
                    <div
                      key={plan.id}
                      className="flex flex-col p-5 border rounded-lg shadow-sm bg-white border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="font-semibold text-lg text-blue-700">{plan.planTitle}</div>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(plan.priority)}`}>
                            {plan.priority} priority
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-500" />
                            <span className="text-gray-600">
                              <span className="font-medium">Elder:</span> {plan.elderName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-gray-500" />
                            <span className="text-gray-600">
                              <span className="font-medium">Start Date:</span> {plan.startDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-gray-500" />
                            <span className="text-gray-600">
                              <span className="font-medium">Target Date:</span> {plan.targetedDate}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Treatment Progress</span>
                            <span className={`text-sm font-bold ${
                              plan.progress === 100 ? 'text-green-600' :
                              plan.progress >= 75 ? 'text-blue-600' :
                              plan.progress >= 50 ? 'text-yellow-600' :
                              'text-orange-600'
                            }`}>
                              {plan.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                plan.progress === 100 ? 'bg-green-500' :
                                plan.progress >= 75 ? 'bg-blue-500' :
                                plan.progress >= 50 ? 'bg-yellow-500' :
                                'bg-orange-500'
                              }`}
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                          
                          {/* Update Progress Input */}
                          <div className="flex items-center gap-2 mt-3">
                            <label htmlFor={`progress-${plan.id}`} className="text-sm font-medium text-gray-700">
                              Update Progress:
                            </label>
                            <input
                              id={`progress-${plan.id}`}
                              type="number"
                              min="0"
                              max="100"
                              placeholder={plan.progress.toString()}
                              value={editingProgress[plan.id] ?? ''}
                              onChange={(e) => handleProgressChange(plan.id, e.target.value)}
                              className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">%</span>
                            <button
                              onClick={() => handleUpdateProgress(plan.id)}
                              disabled={!editingProgress[plan.id]}
                              className={`px-4 py-1 rounded-md text-sm font-semibold transition-all ${
                                editingProgress[plan.id]
                                  ? 'bg-blue-500 hover:bg-blue-700 text-white shadow-md'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {assessmentPlans.length === 0 && (
                    <p className="text-gray-500">No treatment plans scheduled.</p>
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

export default MentalHealthManagement;
