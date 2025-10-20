import React, { useState, useEffect } from "react";
import RoleLayout from "../../common/RoleLayout";
import mentalHealthService from "../../../services/mentalHealthService";
import toast from "react-hot-toast";
import {
  Brain,
  Calendar,
  Clock,
  Video,
  User,
  MapPin,
  Phone,
  CheckCircle,
  Target,
  MessageCircle,
  FileText,
} from "lucide-react";

const ElderMentalWellness = () => {
  const [therapySessions, setTherapySessions] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    loadTherapySessions();
  }, []);

  const loadTherapySessions = async () => {
    try {
      setLoading(true);
      const response = await mentalHealthService.getElderSessions();
      setTherapySessions(response.sessions || []);
      setSessionStats(response.statistics || null);
    } catch (error) {
      console.error("Error loading therapy sessions:", error);
      toast.error("Failed to load therapy sessions");
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case "video_call":
        return <Video className="w-4 h-4" />;
      case "in_person":
        return <MapPin className="w-4 h-4" />;
      case "phone_call":
        return <Phone className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleJoinCall = (zoomLink) => {
    if (zoomLink) {
      window.open(zoomLink, "_blank");
    }
  };

  // Filter sessions
  const filteredSessions = therapySessions.filter((session) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "upcoming") {
      return (
        session.status === "scheduled" &&
        new Date(session.scheduledDate) >= new Date()
      );
    }
    if (selectedFilter === "completed") {
      return session.status === "completed";
    }
    return true;
  });

  return (
    <RoleLayout title="Mental Wellness">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Brain className="w-10 h-10 mr-3" />
                Mental Health Support
              </h1>
              <p className="text-purple-100 text-lg">
                Your therapy sessions and mental wellness care
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {sessionStats?.total || 0}
                </div>
                <div className="text-purple-600 font-medium mt-1">
                  Total Sessions
                </div>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {sessionStats?.upcoming || 0}
                </div>
                <div className="text-blue-600 font-medium mt-1">
                  Upcoming Sessions
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {sessionStats?.completed || 0}
                </div>
                <div className="text-green-600 font-medium mt-1">
                  Completed Sessions
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-indigo-600">
                  {sessionStats?.scheduled || 0}
                </div>
                <div className="text-indigo-600 font-medium mt-1">
                  Scheduled
                </div>
              </div>
              <Clock className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* My Therapy Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
              <Brain className="w-7 h-7 mr-3 text-purple-600" />
              My Therapy Sessions
            </h3>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === "all"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-purple-50 border border-gray-200"
                }`}
              >
                All Sessions
              </button>
              <button
                onClick={() => setSelectedFilter("upcoming")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === "upcoming"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setSelectedFilter("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === "completed"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-green-50 border border-gray-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Loading your therapy sessions...
                </p>
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="space-y-6">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30"
                  >
                    {/* Specialist Info */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {session.specialist?.firstName?.[0]}
                        {session.specialist?.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900">
                          {session.specialist?.firstName}{" "}
                          {session.specialist?.lastName}
                        </h4>
                        <p className="text-sm text-purple-600 font-medium">
                          Mental Health Specialist
                        </p>
                      </div>
                      <span
                        className={`px-4 py-1.5 text-xs font-bold rounded-full border-2 ${getSessionStatusColor(
                          session.status
                        )}`}
                      >
                        {session.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Session Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      {/* Date */}
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center gap-2 text-purple-700 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase">
                            Date
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(session.scheduledDate)}
                        </p>
                      </div>

                      {/* Time & Duration */}
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase">
                            Time
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatTime(session.scheduledTime)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {session.duration} minutes
                        </p>
                      </div>

                      {/* Location */}
                      <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-700 mb-1">
                          {getLocationIcon(session.location)}
                          <span className="text-xs font-semibold uppercase">
                            Location
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {session.location?.replace("_", " ")}
                        </p>
                      </div>

                      {/* Therapy Type */}
                      <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                          <Brain className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase">
                            Type
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {session.therapyType}
                        </p>
                      </div>
                    </div>

                    {/* Session Goals */}
                    {session.sessionGoals &&
                      session.sessionGoals.length > 0 && (
                        <div className="mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-purple-600" />
                            <h5 className="font-bold text-gray-900">
                              Session Goals
                            </h5>
                          </div>
                          <ul className="space-y-2">
                            {session.sessionGoals.map((goal, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-gray-700"
                              >
                                <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Session Notes */}
                    {session.sessionNotes && (
                      <div className="mb-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                          <h5 className="font-bold text-gray-900">
                            Session Notes
                          </h5>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          "{session.sessionNotes}"
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      {session.status === "scheduled" &&
                        session.location === "video_call" &&
                        session.zoomLink && (
                          <button
                            onClick={() => handleJoinCall(session.zoomLink)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 px-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Video className="w-5 h-5" />
                            Join Video Call
                          </button>
                        )}

                      {session.status === "scheduled" &&
                        session.location === "video_call" &&
                        !session.zoomLink && (
                          <div className="flex-1 bg-yellow-50 border-2 border-yellow-300 text-yellow-800 rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2">
                            <Clock className="w-5 h-5" />
                            Meeting link not available yet
                          </div>
                        )}

                      {session.status === "scheduled" &&
                        session.location !== "video_call" && (
                          <div className="flex-1 bg-green-50 border-2 border-green-300 text-green-800 rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2">
                            {getLocationIcon(session.location)}
                            {session.location === "in_person"
                              ? "In-Person Session"
                              : "Phone Session"}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-700 mb-2">
                  {selectedFilter === "all" && "No Therapy Sessions Yet"}
                  {selectedFilter === "upcoming" && "No Upcoming Sessions"}
                  {selectedFilter === "completed" && "No Completed Sessions"}
                </h4>
                <p className="text-gray-500 mb-6">
                  {selectedFilter === "all"
                    ? "You don't have any therapy sessions scheduled at the moment."
                    : selectedFilter === "upcoming"
                    ? "You don't have any upcoming therapy sessions."
                    : "You haven't completed any therapy sessions yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-blue-100 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-center gap-3 text-center">
            <MessageCircle className="w-6 h-6 text-purple-700" />
            <div>
              <h3 className="text-lg font-bold text-purple-900">
                Need Help or Have Questions?
              </h3>
              <p className="text-purple-700">
                Contact your mental health specialist for support and guidance
              </p>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default ElderMentalWellness;
