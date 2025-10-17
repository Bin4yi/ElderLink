// src/components/staff/mental/TreatmentTasks.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { 
  ClipboardList, 
  User, 
  Calendar, 
  TrendingUp, 
  FileText,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import mentalHealthService from '../../../services/mentalHealthService';
import toast from 'react-hot-toast';

const TreatmentTasks = () => {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedElder, setSelectedElder] = useState('all');
  const [progressUpdates, setProgressUpdates] = useState({});
  const [notesUpdates, setNotesUpdates] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchTreatmentPlans();
  }, [selectedElder]);

  const fetchTreatmentPlans = async () => {
    try {
      setLoading(true);
      const elderId = selectedElder === 'all' ? null : selectedElder;
      const response = await mentalHealthService.getCaregiverTreatmentPlans(elderId);
      
      setTreatmentPlans(response.treatmentPlans || []);
      
      if (response.treatmentPlans.length === 0) {
        toast.info('No treatment plans assigned to your elders');
      }
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      toast.error('Failed to load treatment plans');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = (planId, value) => {
    setProgressUpdates(prev => ({
      ...prev,
      [planId]: value
    }));
  };

  const handleNotesChange = (planId, value) => {
    setNotesUpdates(prev => ({
      ...prev,
      [planId]: value
    }));
  };

  const handleSubmitProgress = async (planId, planTitle) => {
    const progressPercentage = progressUpdates[planId];
    const notes = notesUpdates[planId];

    // Validation
    if (!progressPercentage || progressPercentage < 0 || progressPercentage > 100) {
      toast.error('Please enter a valid progress percentage (0-100)');
      return;
    }

    try {
      setSubmitting(prev => ({ ...prev, [planId]: true }));

      const response = await mentalHealthService.submitProgressReport(planId, {
        progressPercentage: parseInt(progressPercentage),
        notes: notes || '',
        attachments: []
      });

      // Update the treatment plan's progress in the local state
      setTreatmentPlans(prev =>
        prev.map(plan =>
          plan.id === planId
            ? { ...plan, progress: response.updatedProgress || parseInt(progressPercentage) }
            : plan
        )
      );

      // Clear the input fields
      setProgressUpdates(prev => {
        const updated = { ...prev };
        delete updated[planId];
        return updated;
      });

      setNotesUpdates(prev => {
        const updated = { ...prev };
        delete updated[planId];
        return updated;
      });

      toast.success(`Progress updated for "${planTitle}"`);
      
      // Refresh to get latest data including all progress reports
      await fetchTreatmentPlans();
    } catch (error) {
      console.error('Error submitting progress:', error);
      if (error.response?.status === 403) {
        toast.error('You are not assigned to this elder');
      } else {
        toast.error('Failed to update progress. Please try again.');
      }
    } finally {
      setSubmitting(prev => ({ ...prev, [planId]: false }));
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      critical: 'bg-red-100 text-red-800',
      on_hold: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.active;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique elders for filter
  const uniqueElders = [...new Set(treatmentPlans.map(plan => ({
    id: plan.elder?.id,
    name: `${plan.elder?.firstName} ${plan.elder?.lastName}`
  })))];

  if (loading && treatmentPlans.length === 0) {
    return (
      <RoleLayout title="Treatment Plan Tasks">
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading treatment plans...</p>
              </div>
            </div>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Treatment Plan Tasks">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Treatment Plan Tasks
                </h1>
                <p className="text-gray-600">
                  Update progress for treatment plans assigned by mental health specialists
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchTreatmentPlans}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter by Elder */}
            {uniqueElders.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter by Elder:</label>
                <select
                  value={selectedElder}
                  onChange={(e) => setSelectedElder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Elders</option>
                  {uniqueElders.map(elder => (
                    <option key={elder.id} value={elder.id}>
                      {elder.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Plans</p>
                  <p className="text-3xl font-bold text-blue-600">{treatmentPlans.length}</p>
                </div>
                <ClipboardList className="text-blue-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Plans</p>
                  <p className="text-3xl font-bold text-green-600">
                    {treatmentPlans.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <CheckCircle2 className="text-green-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">High Priority</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {treatmentPlans.filter(p => p.priority === 'high' || p.priority === 'critical').length}
                  </p>
                </div>
                <AlertCircle className="text-orange-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Progress</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {treatmentPlans.length > 0
                      ? Math.round(
                          treatmentPlans.reduce((sum, p) => sum + p.progress, 0) /
                            treatmentPlans.length
                        )
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="text-purple-600" size={40} />
              </div>
            </div>
          </div>

          {/* Treatment Plans List */}
          <div className="space-y-6">
            {treatmentPlans.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <ClipboardList className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Treatment Plans Found
                </h3>
                <p className="text-gray-600">
                  There are no treatment plans assigned to your elders at the moment.
                </p>
              </div>
            ) : (
              treatmentPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Plan Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{plan.planTitle}</h3>
                        <div className="flex items-center gap-2 text-blue-100">
                          <User size={16} />
                          <span className="font-medium">
                            {plan.elder?.firstName} {plan.elder?.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(plan.status)}`}>
                          {plan.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityBadge(plan.priority)}`}>
                          {plan.priority?.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="p-6">
                    {/* Specialist Info & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <User className="text-blue-600 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">Mental Health Specialist</p>
                          <p className="font-semibold text-gray-800">
                            {plan.specialist?.firstName} {plan.specialist?.lastName}
                          </p>
                          {plan.specialist?.specialization && (
                            <p className="text-xs text-gray-500">{plan.specialist.specialization}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="text-green-600 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-semibold text-gray-800">{formatDate(plan.startDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="text-orange-600 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">Target Date</p>
                          <p className="font-semibold text-gray-800">{formatDate(plan.endDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    {(plan.primaryDiagnosis || plan.secondaryDiagnosis) && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-2">Diagnosis</p>
                        {plan.primaryDiagnosis && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Primary:</span> {plan.primaryDiagnosis}
                          </p>
                        )}
                        {plan.secondaryDiagnosis && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Secondary:</span> {plan.secondaryDiagnosis}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Current Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Current Progress</span>
                        <span className={`text-lg font-bold ${getProgressTextColor(plan.progress)}`}>
                          {plan.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(plan.progress)}`}
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Previous Progress Reports */}
                    {plan.progressReports && plan.progressReports.length > 0 && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FileText size={16} />
                          Your Recent Progress Reports
                        </p>
                        <div className="space-y-2">
                          {plan.progressReports.slice(0, 3).map((report, idx) => (
                            <div key={idx} className="text-sm bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-700">
                                  {report.progressPercentage}% Progress
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(report.reportDate)}
                                </span>
                              </div>
                              {report.notes && (
                                <p className="text-gray-600 text-xs mt-1">{report.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Update Progress Form */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        Submit Progress Update
                      </h4>

                      <div className="space-y-4">
                        {/* Progress Percentage Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Progress Percentage (0-100) *
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Enter progress %"
                              value={progressUpdates[plan.id] || ''}
                              onChange={(e) => handleProgressChange(plan.id, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-600 font-medium">%</span>
                          </div>
                        </div>

                        {/* Progress Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Progress Notes (Optional)
                          </label>
                          <textarea
                            placeholder="Describe the elder's progress, achievements, challenges, or observations..."
                            value={notesUpdates[plan.id] || ''}
                            onChange={(e) => handleNotesChange(plan.id, e.target.value)}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Add any relevant observations, achievements, or challenges faced during treatment
                          </p>
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={() => handleSubmitProgress(plan.id, plan.planTitle)}
                          disabled={submitting[plan.id] || !progressUpdates[plan.id]}
                          className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                            submitting[plan.id] || !progressUpdates[plan.id]
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                          }`}
                        >
                          {submitting[plan.id] ? (
                            <>
                              <RefreshCw size={18} className="animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Submit Progress Update
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default TreatmentTasks;
