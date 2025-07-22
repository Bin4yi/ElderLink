// src/components/staff/mental/MentalHealthManagement.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { CheckCircle2, BarChart3, ClipboardList, FileText } from 'lucide-react';



const MentalHealthManagement = () => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'assessments'

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

  // Assessment Plans state
  const [assessmentPlans, setAssessmentPlans] = useState([
    {
      id: 1,
      assessment: 'Cognitive Function Assessment',
      elderName: 'Margaret Thompson',
      date: '2024-06-12',
      type: 'cognitive',
      status: 'pending',
      priority: 'high',
    },
    {
      id: 2,
      assessment: 'Depression Screening (PHQ-9)',
      elderName: 'Margaret Thompson',
      date: '2024-06-13',
      type: 'mood',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 3,
      assessment: 'Anxiety Assessment (GAD-7)',
      elderName: 'Margaret Thompson',
      date: '2024-06-14',
      type: 'anxiety',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: 4,
      assessment: 'Memory and Recall Evaluation',
      elderName: 'Margaret Thompson',
      date: '2024-06-15',
      type: 'memory',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: 5,
      assessment: 'Social Interaction Assessment',
      elderName: 'Margaret Thompson',
      date: '2024-06-16',
      type: 'social',
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
              Mental Specialist Plans
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
              Assessment Plans
            </button>
          </div>

          {/* Mental Specialist Plans Tab */}
          {activeTab === 'plans' && (
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

          {/* Assessment Plans Tab */}
          {activeTab === 'assessments' && (
            <div className="space-y-8">
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-600" />
                  Mental Health Assessment Plans
                </h3>
                <div className="space-y-3">
                  {assessmentPlans.map(assessment => (
                    <div
                      key={assessment.id}
                      className={`flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-md ${
                        assessment.status === 'completed'
                          ? 'bg-green-50 border-green-200'
                          : assessment.status === 'in-progress'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium text-blue-700">{assessment.assessment}</div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(assessment.priority)}`}>
                            {assessment.priority} priority
                          </span>
                        </div>
                        <div className="text-gray-600 text-sm mb-2">
                          {getAssessmentDescription(assessment.type)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FileText size={14} />
                            Elder: {assessment.elderName}
                          </div>
                          <div>Scheduled: {assessment.date}</div>
                          <span className="inline-block px-2 py-0.5 rounded bg-opacity-30 font-medium capitalize">
                            {assessment.status}
                          </span>
                        </div>
                      </div>
                      {assessment.status !== 'completed' && (
                        <button
                          onClick={() => handleAssessmentAction(assessment.id)}
                          className="mt-3 md:mt-0 md:ml-4 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-semibold shadow flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          {assessment.status === 'in-progress' ? 'Complete Assessment' : 'Start Assessment'}
                        </button>
                      )}
                    </div>
                  ))}
                  {assessmentPlans.length === 0 && (
                    <p className="text-gray-500">No mental health assessments scheduled.</p>
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
