// src/components/staff/mental/MentalHealthManagement.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Brain,
  User,
  Calendar,
  Clock,
  Play,
  Loader,
  AlertCircle,
  Activity
} from 'lucide-react';
import mentalHealthService from '../../../services/mentalHealthService';
import toast from 'react-hot-toast';

const MentalHealthManagement = () => {
  // Staff Mental Health Assessment Management - API Integration
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    scheduled: 0,
    notStarted: 0,
    started: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch assessments and stats on component mount and filter change
  useEffect(() => {
    fetchAssessments();
    fetchStats();
  }, [statusFilter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const filterStatus = statusFilter !== 'all' ? statusFilter : null;
      const response = await mentalHealthService.getStaffAssessments(null, filterStatus);
      setAssessments(response.assessments || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await mentalHealthService.getStaffAssessmentStats();
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (assessmentId, newStatus, notes = '') => {
    try {
      setUpdating(true);
      await mentalHealthService.updateStaffAssessmentStatus(assessmentId, {
        status: newStatus,
        notes: notes
      });
      toast.success(`Assessment status updated to ${newStatus.replace('_', ' ')}`);
      await fetchAssessments();
      await fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'scheduled': 'not_started',
      'not_started': 'started',
      'started': 'in_progress',
      'in_progress': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const getStatusButton = (assessment) => {
    const nextStatus = getNextStatus(assessment.status);
    
    if (!nextStatus || assessment.status === 'completed') return null;

    const buttonLabels = {
      'not_started': 'Mark Not Started',
      'started': 'Start Assessment',
      'in_progress': 'Mark In Progress',
      'completed': 'Complete'
    };

    const handleClick = () => {
      if (nextStatus === 'completed') {
        setSelectedAssessment(assessment);
        setShowNotesModal(true);
      } else {
        handleStatusUpdate(assessment.id, nextStatus);
      }
    };

    return (
      <button
        onClick={handleClick}
        disabled={updating}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {updating ? (
          <>
            <Loader className="animate-spin" size={16} />
            Updating...
          </>
        ) : (
          <>
            <Play size={16} />
            {buttonLabels[nextStatus]}
          </>
        )}
      </button>
    );
  };

  const handleCompleteWithNotes = async () => {
    if (selectedAssessment) {
      await handleStatusUpdate(selectedAssessment.id, 'completed', completionNotes);
      setShowNotesModal(false);
      setCompletionNotes('');
      setSelectedAssessment(null);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'started':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssessmentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'cognitive':
        return <Brain size={18} className="text-purple-600" />;
      case 'mood':
      case 'depression':
        return <Activity size={18} className="text-blue-600" />;
      case 'anxiety':
        return <AlertCircle size={18} className="text-orange-600" />;
      default:
        return <ClipboardList size={18} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <RoleLayout title="Mental Health Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.totalAssessments}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-purple-50 rounded-lg shadow p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-800">{stats.scheduled}</div>
              <div className="text-sm text-purple-600">Scheduled</div>
            </div>
            <div className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{stats.notStarted}</div>
              <div className="text-sm text-gray-600">Not Started</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-800">{stats.started}</div>
              <div className="text-sm text-yellow-600">Started</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">{stats.inProgress}</div>
              <div className="text-sm text-blue-600">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-800">{stats.urgent}</div>
              <div className="text-sm text-red-600">Urgent</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Assessments
              </button>
              <button
                onClick={() => setStatusFilter('scheduled')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === 'scheduled'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setStatusFilter('not_started')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === 'not_started'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => setStatusFilter('started')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === 'started'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Started
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === 'in_progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('urgent')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === 'urgent'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Urgent
              </button>
            </div>
          </div>

          {/* Assessments List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardList size={24} className="text-blue-600" />
                Mental Health Assessments
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600" size={48} />
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No assessments found for the selected filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Assessment Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          {getAssessmentTypeIcon(assessment.assessmentType)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {assessment.assessmentType || 'Mental Health Assessment'}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full border font-medium ${getStatusBadgeColor(assessment.status)}`}>
                                {assessment.status?.replace('_', ' ').toUpperCase()}
                              </span>
                              {assessment.priority === 'urgent' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200 font-medium">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {assessment.recommendations || 'Comprehensive mental health evaluation'}
                            </p>
                          </div>
                        </div>

                        {/* Elder and Specialist Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={16} />
                            <span>Elder: {assessment.Elder?.firstName} {assessment.Elder?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Brain size={16} />
                            <span>Specialist: {assessment.Specialist?.firstName} {assessment.Specialist?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>Scheduled: {formatDate(assessment.scheduledDate)}</span>
                          </div>
                          {assessment.completedDate && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={16} className="text-green-600" />
                              <span>Completed: {formatDate(assessment.completedDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Findings/Notes */}
                        {assessment.findings && (
                          <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs font-medium text-gray-700 mb-1">Notes:</div>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {assessment.findings}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="lg:ml-4">
                        {getStatusButton(assessment)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Complete Assessment
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add any final notes or observations before completing this assessment:
            </p>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              placeholder="Enter completion notes (optional)..."
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setCompletionNotes('');
                  setSelectedAssessment(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteWithNotes}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader className="animate-spin inline mr-2" size={16} />
                    Completing...
                  </>
                ) : (
                  'Complete Assessment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default MentalHealthManagement;
