import React, { useState, useEffect } from "react";
import {
  Brain,
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Calendar,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout"; // Add this import for sidebar layout

const MentalHealthAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);

  // Mock data
  const mockAssessments = [
    {
      id: 1,
      clientName: "Margaret Johnson",
      clientId: "C001",
      assessmentType: "Initial Mental Health Evaluation",
      status: "completed",
      priority: "medium",
      scheduledDate: "2025-01-05",
      completedDate: "2025-01-05",
      duration: "45 minutes",
      score: "PHQ-9: 8/27 (Mild Depression)",
      findings: "Mild depressive symptoms with good coping mechanisms",
      recommendations: "CBT sessions twice weekly, mindfulness exercises",
      nextAssessment: "2025-02-05",
      assessor: "Dr. Sarah Mitchell",
      riskLevel: "low",
    },
    {
      id: 2,
      clientName: "Robert Chen",
      clientId: "C002",
      assessmentType: "PTSD Assessment",
      status: "in_progress",
      priority: "high",
      scheduledDate: "2025-01-12",
      completedDate: null,
      duration: "60 minutes",
      score: "PCL-5: In Progress",
      findings: "Assessment in progress",
      recommendations: "To be determined",
      nextAssessment: "TBD",
      assessor: "Dr. Sarah Mitchell",
      riskLevel: "medium",
    },
    {
      id: 3,
      clientName: "Dorothy Williams",
      clientId: "C003",
      assessmentType: "Suicide Risk Assessment",
      status: "urgent",
      priority: "critical",
      scheduledDate: "2025-01-10",
      completedDate: "2025-01-10",
      duration: "90 minutes",
      score: "Columbia Scale: High Risk",
      findings: "Immediate intervention required",
      recommendations: "Daily check-ins, safety plan implementation",
      nextAssessment: "2025-01-17",
      assessor: "Dr. Sarah Mitchell",
      riskLevel: "high",
    },
    {
      id: 4,
      clientName: "James Patterson",
      clientId: "C004",
      assessmentType: "Cognitive Assessment",
      status: "scheduled",
      priority: "medium",
      scheduledDate: "2025-01-15",
      completedDate: null,
      duration: "30 minutes",
      score: "Pending",
      findings: "Scheduled for assessment",
      recommendations: "Pending assessment",
      nextAssessment: "TBD",
      assessor: "Dr. Sarah Mitchell",
      riskLevel: "low",
    },
  ];

  const assessmentTypes = [
    "Initial Mental Health Evaluation",
    "Depression Screening (PHQ-9)",
    "Anxiety Assessment (GAD-7)",
    "PTSD Assessment (PCL-5)",
    "Cognitive Assessment (MMSE)",
    "Suicide Risk Assessment",
    "Substance Abuse Screening",
    "Sleep Disorder Assessment",
    "Social Isolation Evaluation",
  ];

  useEffect(() => {
    setTimeout(() => {
      setAssessments(mockAssessments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.assessmentType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.clientId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "completed" && assessment.status === "completed") ||
      (selectedFilter === "in_progress" &&
        assessment.status === "in_progress") ||
      (selectedFilter === "scheduled" && assessment.status === "scheduled") ||
      (selectedFilter === "urgent" && assessment.status === "urgent") ||
      (selectedFilter === "high_risk" && assessment.riskLevel === "high") ||
      (selectedFilter === "medium_risk" && assessment.riskLevel === "medium") ||
      (selectedFilter === "low_risk" && assessment.riskLevel === "low");

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "scheduled":
        return <Calendar className="w-5 h-5 text-yellow-600" />;
      case "urgent":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <RoleLayout active="assessments">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Brain className="w-8 h-8 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading assessments...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout active="assessments">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mental Health Assessments
              </h1>
              <p className="text-gray-600">
                Conduct and manage mental health evaluations
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowNewAssessmentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Assessment
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4" />
                Schedule Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Assessments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.filter((a) => a.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.filter((a) => a.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.filter((a) => a.status === "urgent").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search assessments by client name, type, or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Assessments</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="urgent">Urgent</option>
                <option value="high_risk">High Risk</option>
                <option value="medium_risk">Medium Risk</option>
                <option value="low_risk">Low Risk</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score/Results
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {assessment.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {assessment.clientId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {assessment.assessmentType}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assessment.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(assessment.status)}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {assessment.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          assessment.priority
                        )}`}
                      >
                        {assessment.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assessment.scheduledDate}
                      </div>
                      {assessment.completedDate && (
                        <div className="text-sm text-gray-500">
                          Completed: {assessment.completedDate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {assessment.score}
                      </div>
                      {assessment.findings && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {assessment.findings}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Assessment Modal */}
        {showNewAssessmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Schedule New Assessment
                </h2>
                <button
                  onClick={() => setShowNewAssessmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Select a client</option>
                      <option value="1">Margaret Johnson</option>
                      <option value="2">Robert Chen</option>
                      <option value="3">Dorothy Williams</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assessment Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Select assessment type</option>
                      {assessmentTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional notes for the assessment..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewAssessmentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Schedule Assessment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default MentalHealthAssessments;
