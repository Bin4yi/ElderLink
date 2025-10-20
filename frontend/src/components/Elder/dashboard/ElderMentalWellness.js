import React, { useState, useEffect } from "react";
import RoleLayout from "../../common/RoleLayout";
import mentalHealthService from "../../../services/mentalHealthService";
import toast from "react-hot-toast";
import {
  Brain,
  Heart,
  Smile,
  Frown,
  Meh,
  Plus,
  Calendar,
  Clock,
  TrendingUp,
  Book,
  Music,
  Users,
  Phone,
  Play,
  CheckCircle,
  Star,
  Video,
  User,
  MapPin,
  AlertCircle,
} from "lucide-react";

const ElderMentalWellness = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [therapySessions, setTherapySessions] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Dummy mood tracking data
  const moodHistory = [
    {
      date: "2025-07-20",
      mood: "happy",
      score: 8,
      note: "Had a great video call with grandchildren",
    },
    {
      date: "2025-07-19",
      mood: "neutral",
      score: 6,
      note: "Quiet day at home, read a good book",
    },
    {
      date: "2025-07-18",
      mood: "happy",
      score: 9,
      note: "Enjoyed the senior center activities",
    },
    {
      date: "2025-07-17",
      mood: "sad",
      score: 4,
      note: "Feeling a bit lonely today",
    },
    {
      date: "2025-07-16",
      mood: "happy",
      score: 7,
      note: "Nice walk in the park with friends",
    },
  ];

  // Dummy wellness activities
  const activities = [
    {
      id: 1,
      title: "Morning Meditation",
      description: "Start your day with a peaceful 10-minute guided meditation",
      duration: "10 min",
      category: "mindfulness",
      completed: true,
      icon: Brain,
      color: "bg-purple-500",
    },
    {
      id: 2,
      title: "Gratitude Journal",
      description: "Write down three things you're grateful for today",
      duration: "5 min",
      category: "journaling",
      completed: false,
      icon: Book,
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Relaxing Music",
      description: "Listen to calming classical music for stress relief",
      duration: "20 min",
      category: "music",
      completed: false,
      icon: Music,
      color: "bg-blue-500",
    },
    {
      id: 4,
      title: "Social Connection",
      description: "Call a friend or family member to catch up",
      duration: "15 min",
      category: "social",
      completed: true,
      icon: Phone,
      color: "bg-pink-500",
    },
  ];

  // Dummy resources
  const resources = [
    {
      id: 1,
      title: "Mindfulness for Seniors",
      type: "Video Course",
      duration: "45 min",
      rating: 4.8,
      description:
        "Learn meditation techniques designed specifically for older adults",
    },
    {
      id: 2,
      title: "Senior Support Group",
      type: "Weekly Meeting",
      duration: "1 hour",
      rating: 4.9,
      description: "Connect with peers in a supportive group environment",
    },
    {
      id: 3,
      title: "Brain Training Games",
      type: "Interactive",
      duration: "Flexible",
      rating: 4.7,
      description: "Fun cognitive exercises to keep your mind sharp",
    },
    {
      id: 4,
      title: "Gentle Yoga for Mental Health",
      type: "Exercise Program",
      duration: "30 min",
      rating: 4.9,
      description: "Combine physical movement with mental wellness",
    },
  ];

  const getMoodIcon = (mood) => {
    switch (mood) {
      case "happy":
        return <Smile className="w-6 h-6 text-green-600" />;
      case "neutral":
        return <Meh className="w-6 h-6 text-yellow-600" />;
      case "sad":
        return <Frown className="w-6 h-6 text-red-600" />;
      default:
        return <Meh className="w-6 h-6 text-gray-600" />;
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case "happy":
        return "bg-green-100 border-green-200";
      case "neutral":
        return "bg-yellow-100 border-yellow-200";
      case "sad":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const averageMood =
    moodHistory.reduce((sum, entry) => sum + entry.score, 0) /
    moodHistory.length;

  return (
    <RoleLayout title="Mental Wellness">
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Brain className="w-8 h-8 mr-3" />
                Mental Wellness Hub
              </h1>
              <p className="text-purple-100 text-lg">
                Nurture your mind and emotional well-being
              </p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Log Mood
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-600">
              {averageMood.toFixed(1)}/10
            </div>
            <div className="text-purple-500 font-medium">Average Mood</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-600">
              {activities.filter((a) => a.completed).length}/{activities.length}
            </div>
            <div className="text-green-500 font-medium">Today's Activities</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-600">
              {moodHistory.length}
            </div>
            <div className="text-blue-500 font-medium">Days Tracked</div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-pink-600">7</div>
            <div className="text-pink-500 font-medium">Streak Days</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-purple-600" />
                Today's Wellness Activities
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {activities.map((activity) => {
                const IconComponent = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className={`rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                      activity.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`${activity.color} rounded-lg p-2 text-white`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {activity.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {activity.completed ? (
                          <div className="bg-green-500 rounded-full p-1">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center">
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mood Tracker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Heart className="w-6 h-6 mr-3 text-purple-600" />
                Recent Mood History
              </h3>
            </div>

            <div className="p-6 space-y-3">
              {moodHistory.slice(0, 5).map((entry, index) => (
                <div
                  key={index}
                  className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-sm ${getMoodColor(
                    entry.mood
                  )}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getMoodIcon(entry.mood)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          Mood Score: {entry.score}/10
                        </div>
                      </div>
                    </div>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-gray-700 mt-2 italic">
                      "{entry.note}"
                    </p>
                  )}
                </div>
              ))}

              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Full Mood History
              </button>
            </div>
          </div>
        </div>

        {/* My Therapy Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-3 text-purple-600" />
                My Therapy Sessions
              </h3>
              {sessionStats && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {sessionStats.upcoming} Upcoming
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    {sessionStats.completed} Completed
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                <p className="text-gray-600">
                  Loading your therapy sessions...
                </p>
              </div>
            ) : therapySessions.length > 0 ? (
              <div className="space-y-4">
                {therapySessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-purple-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {session.specialist?.firstName}{" "}
                              {session.specialist?.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Mental Health Specialist
                            </p>
                          </div>
                        </div>

                        <div className="ml-13 space-y-2">
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-purple-500" />
                              <span>{formatDate(session.scheduledDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span>
                                {formatTime(session.scheduledTime)} (
                                {session.duration} min)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              {getLocationIcon(session.location)}
                              <span className="capitalize">
                                {session.location?.replace("_", " ")}
                              </span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700 font-medium">
                              {session.therapyType}
                            </span>
                          </div>

                          {session.sessionGoals &&
                            session.sessionGoals.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                  Session Goals:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {session.sessionGoals
                                    .slice(0, 2)
                                    .map((goal, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                                      >
                                        {goal}
                                      </span>
                                    ))}
                                  {session.sessionGoals.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{session.sessionGoals.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                          {session.sessionNotes && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 italic">
                                "{session.sessionNotes}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSessionStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status.toUpperCase()}
                        </span>

                        {session.status === "scheduled" &&
                          session.location === "video_call" &&
                          session.zoomLink && (
                            <a
                              href={session.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                            >
                              <Video className="w-3 h-3" />
                              Join Call
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                {therapySessions.length > 5 && (
                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    View All Sessions ({therapySessions.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  No Therapy Sessions Yet
                </h4>
                <p className="text-gray-500 mb-4">
                  You don't have any scheduled therapy sessions at the moment.
                </p>
                <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-6 py-3 font-medium transition-colors inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Request a Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Wellness Resources */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Book className="w-6 h-6 mr-3 text-purple-600" />
              Recommended Wellness Resources
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {resource.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          {resource.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {resource.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {resource.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {resource.description}
                  </p>

                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2 font-medium transition-colors flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Start Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Mood Check */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8 border border-purple-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              How are you feeling today?
            </h3>
            <div className="flex justify-center space-x-6 mb-6">
              {[
                {
                  mood: "happy",
                  icon: Smile,
                  label: "Great",
                  color: "text-green-600 hover:bg-green-100",
                },
                {
                  mood: "neutral",
                  icon: Meh,
                  label: "Okay",
                  color: "text-yellow-600 hover:bg-yellow-100",
                },
                {
                  mood: "sad",
                  icon: Frown,
                  label: "Struggling",
                  color: "text-red-600 hover:bg-red-100",
                },
              ].map(({ mood, icon: Icon, label, color }) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
                    selectedMood === mood
                      ? "bg-white shadow-lg scale-105"
                      : "bg-white/50 hover:bg-white/80"
                  } ${color}`}
                >
                  <Icon className="w-8 h-8 mb-2" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
            {selectedMood && (
              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 py-3 font-medium transition-colors">
                Log My Mood
              </button>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default ElderMentalWellness;
