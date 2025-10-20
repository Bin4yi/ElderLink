// frontend/src/components/mental-health/sessions/sessions.js
import React, { useState, useEffect } from "react";
import {
  Video,
  Calendar,
  Clock,
  User,
  Search,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout";
import mentalHealthService from "../../../services/mentalHealthService";
import toast from "react-hot-toast";

const TherapySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [assignedElders, setAssignedElders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    elderId: "",
    sessionType: "individual",
    therapyType: "Cognitive Behavioral Therapy",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    location: "video_call",
    zoomLink: "",
    sessionGoals: "",
    notes: "",
    isFirstSession: false,
  });

  useEffect(() => {
    loadSessions();
    loadAssignedElders();
  }, [selectedFilter]);

  const loadAssignedElders = async () => {
    try {
      const response = await mentalHealthService.getAssignedElders();
      setAssignedElders(response.elders || []);
    } catch (error) {
      console.error("Error loading assigned elders:", error);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const filters =
        selectedFilter !== "all" ? { status: selectedFilter } : {};
      const response = await mentalHealthService.getSpecialistSessions(filters);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await mentalHealthService.completeSession(sessionId, {
        sessionNotes: "Session completed successfully",
        homework: "Continue with assigned exercises",
      });
      toast.success("Session completed and next session scheduled!");
      loadSessions();
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete session");
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!sessionForm.elderId) {
      toast.error("Please select a client");
      return;
    }

    if (!sessionForm.scheduledDate || !sessionForm.scheduledTime) {
      toast.error("Please select date and time");
      return;
    }

    try {
      setSubmitting(true);

      // Convert sessionGoals string to array
      const goalsArray = sessionForm.sessionGoals
        .split("\n")
        .filter((goal) => goal.trim() !== "");

      const sessionData = {
        ...sessionForm,
        sessionGoals: goalsArray.length > 0 ? goalsArray : [],
      };

      await mentalHealthService.createSession(sessionData);

      toast.success("Session scheduled successfully!");
      setShowNewSessionModal(false);

      // Reset form
      setSessionForm({
        elderId: "",
        sessionType: "individual",
        therapyType: "Cognitive Behavioral Therapy",
        scheduledDate: "",
        scheduledTime: "",
        duration: 60,
        location: "video_call",
        zoomLink: "",
        sessionGoals: "",
        notes: "",
        isFirstSession: false,
      });

      loadSessions();
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error(
        error.response?.data?.message || "Failed to schedule session"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setSessionForm((prev) => ({ ...prev, [field]: value }));
  };

  const filteredSessions = sessions.filter((session) => {
    const clientName =
      `${session.elder?.firstName} ${session.elder?.lastName}`.toLowerCase();
    return clientName.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <RoleLayout active="sessions">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Calendar className="w-8 h-8 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading therapy sessions...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout active="sessions">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Therapy Sessions
              </h1>
              <p className="text-gray-600">
                Manage and conduct therapy sessions
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Session
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter((s) => s.status === "scheduled").length}
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
                  {sessions.filter((s) => s.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter((s) => s.status === "overdue").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Clients
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(sessions.map((s) => s.elderId)).size}
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
                  placeholder="Search sessions by client name..."
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
                <option value="all">All Sessions</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid gap-6 p-6">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                    session.status === "overdue"
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.elder?.firstName} {session.elder?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {session.sessionType} - {session.therapyType}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {session.scheduledDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.scheduledTime} ({session.duration}min)
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      {/* Session Goals */}
                      {session.sessionGoals &&
                        session.sessionGoals.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Session Goals:
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {session.sessionGoals.map((goal, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      {session.zoomLink && session.status === "scheduled" && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Video className="w-4 h-4" />
                          Join Call
                        </button>
                      )}
                      {session.status === "scheduled" && (
                        <button
                          onClick={() => handleCompleteSession(session.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Edit className="w-4 h-4" />
                        Edit Session
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">
                  No Sessions Found
                </h2>
                <p className="text-gray-500">
                  No therapy sessions match your current filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Schedule New Session
                  </h2>
                </div>
                <button
                  onClick={() => setShowNewSessionModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Client *
                </label>
                <select
                  value={sessionForm.elderId}
                  onChange={(e) => handleFormChange("elderId", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a client...</option>
                  {assignedElders.map((elder) => (
                    <option key={elder.id} value={elder.id}>
                      {elder.firstName} {elder.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type and Therapy Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Type *
                  </label>
                  <select
                    value={sessionForm.sessionType}
                    onChange={(e) =>
                      handleFormChange("sessionType", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                    <option value="family">Family</option>
                    <option value="crisis">Crisis</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Therapy Type *
                  </label>
                  <select
                    value={sessionForm.therapyType}
                    onChange={(e) =>
                      handleFormChange("therapyType", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="Cognitive Behavioral Therapy">
                      Cognitive Behavioral Therapy
                    </option>
                    <option value="Dialectical Behavior Therapy">
                      Dialectical Behavior Therapy
                    </option>
                    <option value="Psychodynamic Therapy">
                      Psychodynamic Therapy
                    </option>
                    <option value="Humanistic Therapy">
                      Humanistic Therapy
                    </option>
                    <option value="Mindfulness-Based Therapy">
                      Mindfulness-Based Therapy
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={sessionForm.scheduledDate}
                    onChange={(e) =>
                      handleFormChange("scheduledDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={sessionForm.scheduledTime}
                    onChange={(e) =>
                      handleFormChange("scheduledTime", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Duration and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <select
                    value={sessionForm.duration}
                    onChange={(e) =>
                      handleFormChange("duration", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    value={sessionForm.location}
                    onChange={(e) =>
                      handleFormChange("location", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="video_call">Video Call</option>
                    <option value="in_person">In Person</option>
                    <option value="phone_call">Phone Call</option>
                  </select>
                </div>
              </div>

              {/* Zoom Link (if video call) */}
              {sessionForm.location === "video_call" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zoom/Meeting Link
                  </label>
                  <input
                    type="url"
                    value={sessionForm.zoomLink}
                    onChange={(e) =>
                      handleFormChange("zoomLink", e.target.value)
                    }
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Session Goals */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Session Goals
                </label>
                <textarea
                  value={sessionForm.sessionGoals}
                  onChange={(e) =>
                    handleFormChange("sessionGoals", e.target.value)
                  }
                  rows="3"
                  placeholder="Enter each goal on a new line..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter each goal on a new line
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  rows="3"
                  placeholder="Add any additional notes or preparation details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* First Session Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFirstSession"
                  checked={sessionForm.isFirstSession}
                  onChange={(e) =>
                    handleFormChange("isFirstSession", e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="isFirstSession"
                  className="ml-2 text-sm text-gray-700"
                >
                  This is the first session with this client
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Scheduling..." : "Schedule Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default TherapySessions;
