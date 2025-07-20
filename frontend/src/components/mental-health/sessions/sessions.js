import React, { useState, useEffect } from "react";
import {
  Video,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Search,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  CalendarPlus,
  Plus,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout"; // Add this import for sidebar layout

const clients = [
  {
    id: "C001",
    name: "Margaret Johnson",
    phone: "+1 (555) 123-4567",
    emergencyContact: {
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
    },
  },
  {
    id: "C002",
    name: "Robert Chen",
    phone: "+1 (555) 987-6543",
    emergencyContact: {
      name: "Lisa Chen",
      phone: "+1 (555) 987-6543",
    },
  },
  {
    id: "C003",
    name: "Dorothy Williams",
    phone: "+1 (555) 456-7890",
    emergencyContact: {
      name: "Michael Williams",
      phone: "+1 (555) 456-7890",
    },
  },
  {
    id: "C004",
    name: "James Rodriguez",
    phone: "+1 (555) 321-0987",
    emergencyContact: {
      name: "Maria Rodriguez",
      phone: "+1 (555) 321-0987",
    },
  },
  {
    id: "C005",
    name: "Sarah Thompson",
    phone: "+1 (555) 654-3210",
    emergencyContact: {
      name: "David Thompson",
      phone: "+1 (555) 654-3210",
    },
  },
];

const TherapySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  const sessionTypes = [
    "Individual Therapy",
    "Group Therapy",
    "Family Therapy",
    "Crisis Intervention",
    "Couples Therapy",
    "Art Therapy",
    "Music Therapy",
    "Occupational Therapy",
  ];

  const therapyTypes = [
    "Cognitive Behavioral Therapy",
    "Dialectical Behavior Therapy",
    "Psychodynamic Therapy",
    "Humanistic Therapy",
    "Support Group",
    "Emergency Support",
    "Family Counseling",
    "Grief Counseling",
  ];

  // Mock data with monthly session logic
  const mockSessions = [
    {
      id: 1,
      clientName: "Margaret Johnson",
      clientId: "C001",
      sessionType: "Individual Therapy",
      therapyType: "Cognitive Behavioral Therapy",
      status: "completed",
      date: "2024-12-15",
      time: "10:00 AM",
      duration: 60,
      location: "Video Call",
      zoomLink: "https://zoom.us/j/123456789",
      sessionNumber: 1,
      isFirstSession: true,
      isMonthlySession: false,
      completedDate: "2024-12-15",
      nextSessionDate: "2025-01-15",
      autoScheduled: false,
      notes: "Initial assessment and treatment plan established",
      goals: ["Complete initial assessment", "Establish therapy goals"],
      homework: "Complete intake forms and daily mood tracking",
      emergencyContact: {
        name: "Sarah Johnson",
        phone: "+1 (555) 123-4567",
      },
    },
    {
      id: 2,
      clientName: "Margaret Johnson",
      clientId: "C001",
      sessionType: "Individual Therapy",
      therapyType: "Cognitive Behavioral Therapy",
      status: "scheduled",
      date: "2025-01-15",
      time: "10:00 AM",
      duration: 60,
      location: "Video Call",
      zoomLink: "https://zoom.us/j/123456789",
      sessionNumber: 2,
      isFirstSession: false,
      isMonthlySession: true,
      completedDate: "2024-12-20",
      nextSessionDate: "2025-02-15",
      autoScheduled: true,
      notes: "Monthly follow-up session - review progress",
      goals: ["Review progress from previous month", "Adjust treatment plan"],
      homework: "Continue anxiety management techniques",
      emergencyContact: {
        name: "Sarah Johnson",
        phone: "+1 (555) 123-4567",
      },
    },
    {
      id: 3,
      clientName: "Robert Chen",
      clientId: "C002",
      sessionType: "Group Therapy",
      therapyType: "Support Group",
      status: "completed",
      date: "2024-11-20",
      time: "2:00 PM",
      duration: 90,
      location: "Community Room A",
      zoomLink: null,
      sessionNumber: 1,
      isFirstSession: true,
      isMonthlySession: false,
      completedDate: "2024-11-20",
      nextSessionDate: "2024-12-20",
      autoScheduled: false,
      notes: "First group session - introductions and ground rules",
      goals: ["Introduce to group", "Establish comfort level"],
      homework: "Reflect on personal goals for group therapy",
      emergencyContact: {
        name: "Lisa Chen",
        phone: "+1 (555) 987-6543",
      },
    },
    {
      id: 4,
      clientName: "Robert Chen",
      clientId: "C002",
      sessionType: "Group Therapy",
      therapyType: "Support Group",
      status: "completed",
      date: "2024-12-20",
      time: "2:00 PM",
      duration: 90,
      location: "Community Room A",
      zoomLink: null,
      sessionNumber: 2,
      isFirstSession: false,
      isMonthlySession: true,
      completedDate: "2024-12-20",
      nextSessionDate: "2025-01-20",
      autoScheduled: true,
      notes: "Monthly group session - focus on social interaction",
      goals: ["Improve social connections", "Share experiences"],
      homework: "Practice social skills in daily life",
      emergencyContact: {
        name: "Lisa Chen",
        phone: "+1 (555) 987-6543",
      },
    },
    {
      id: 5,
      clientName: "Robert Chen",
      clientId: "C002",
      sessionType: "Group Therapy",
      therapyType: "Support Group",
      status: "scheduled",
      date: "2025-01-20",
      time: "2:00 PM",
      duration: 90,
      location: "Community Room A",
      zoomLink: null,
      sessionNumber: 3,
      isFirstSession: false,
      isMonthlySession: true,
      completedDate: null,
      nextSessionDate: "2025-02-20",
      autoScheduled: true,
      notes: "Monthly group session - continue progress",
      goals: ["Continue building social connections", "Address new challenges"],
      homework: "Join one community activity this week",
      emergencyContact: {
        name: "Lisa Chen",
        phone: "+1 (555) 987-6543",
      },
    },
    {
      id: 6,
      clientName: "Dorothy Williams",
      clientId: "C003",
      sessionType: "Crisis Intervention",
      therapyType: "Emergency Support",
      status: "overdue",
      date: "2025-01-10",
      time: "11:30 AM",
      duration: 120,
      location: "In-Person",
      zoomLink: null,
      sessionNumber: 1,
      isFirstSession: true,
      isMonthlySession: false,
      completedDate: null,
      nextSessionDate: "2025-02-10",
      autoScheduled: false,
      notes: "Emergency session for crisis management",
      goals: ["Ensure safety", "Develop safety plan"],
      homework: "Use safety plan when feeling overwhelmed",
      emergencyContact: {
        name: "Michael Williams",
        phone: "+1 (555) 456-7890",
      },
    },
  ];

  // Function to automatically create next monthly session
  const createNextMonthlySession = (completedSession) => {
    const nextSessionDate = new Date(completedSession.nextSessionDate);
    const newSession = {
      ...completedSession,
      id: Date.now() + Math.random(),
      status: "scheduled",
      date: nextSessionDate.toISOString().split("T")[0],
      sessionNumber: completedSession.sessionNumber + 1,
      isFirstSession: false,
      isMonthlySession: true,
      completedDate: null,
      nextSessionDate: new Date(
        nextSessionDate.getFullYear(),
        nextSessionDate.getMonth() + 1,
        nextSessionDate.getDate()
      )
        .toISOString()
        .split("T")[0],
      autoScheduled: true,
      notes: `Monthly follow-up session #${
        completedSession.sessionNumber + 1
      } - auto-scheduled`,
      goals: ["Review monthly progress", "Adjust treatment plan as needed"],
    };
    return newSession;
  };

  // Function to check and create overdue sessions
  const checkAndCreateOverdueSessions = () => {
    const today = new Date();
    const updatedSessions = [...sessions];

    sessions.forEach((session) => {
      if (session.status === "scheduled" && new Date(session.date) < today) {
        // Mark as overdue
        const sessionIndex = updatedSessions.findIndex(
          (s) => s.id === session.id
        );
        if (sessionIndex !== -1) {
          updatedSessions[sessionIndex].status = "overdue";
        }
      }
    });

    setSessions(updatedSessions);
  };

  // Function to complete a session and auto-schedule next monthly session
  const completeSession = (sessionId) => {
    const updatedSessions = [...sessions];
    const sessionIndex = updatedSessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex !== -1) {
      const session = updatedSessions[sessionIndex];

      // Mark current session as completed
      updatedSessions[sessionIndex] = {
        ...session,
        status: "completed",
        completedDate: new Date().toISOString().split("T")[0],
      };

      // Create next monthly session if this was the first session or completed monthly session
      if (session.isFirstSession || session.isMonthlySession) {
        const nextSession = createNextMonthlySession(
          updatedSessions[sessionIndex]
        );
        updatedSessions.push(nextSession);
      }

      setSessions(
        updatedSessions.sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setSessions(
        mockSessions.sort((a, b) => new Date(a.date) - new Date(b.date))
      );
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      checkAndCreateOverdueSessions();
    }
  }, [sessions]);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.therapyType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "today" &&
        session.date === new Date().toISOString().split("T")[0]) ||
      (selectedFilter === "scheduled" && session.status === "scheduled") ||
      (selectedFilter === "completed" && session.status === "completed") ||
      (selectedFilter === "overdue" && session.status === "overdue") ||
      (selectedFilter === "first_session" && session.isFirstSession) ||
      (selectedFilter === "monthly" && session.isMonthlySession) ||
      (selectedFilter === "auto_scheduled" && session.autoScheduled);

    return matchesSearch && matchesFilter;
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

  const getLocationIcon = (location) => {
    if (location === "Video Call") {
      return <Video className="w-4 h-4 text-blue-600" />;
    } else if (location === "In-Person") {
      return <MapPin className="w-4 h-4 text-green-600" />;
    } else {
      return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSessionTypeIcon = (session) => {
    if (session.isFirstSession) {
      return <CalendarPlus className="w-4 h-4 text-purple-600" />;
    } else if (session.isMonthlySession) {
      return <RotateCcw className="w-4 h-4 text-blue-600" />;
    }
    return <Calendar className="w-4 h-4 text-gray-600" />;
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
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Video className="w-4 h-4" />
                Start Video Call
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
                <RotateCcw className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Monthly Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter((s) => s.isMonthlySession).length}
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
                  {new Set(sessions.map((s) => s.clientId)).size}
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
                  placeholder="Search sessions by client name, session type, or therapy type..."
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
                <option value="today">Today</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="first_session">First Sessions</option>
                <option value="monthly">Monthly Sessions</option>
                <option value="auto_scheduled">Auto-Scheduled</option>
              </select>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid gap-6 p-6">
            {filteredSessions.map((session) => (
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
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.clientName}
                          </h3>
                          {getSessionTypeIcon(session)}
                          {session.autoScheduled && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Auto-Scheduled
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {session.sessionType} - {session.therapyType}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {session.isFirstSession
                            ? "First Session"
                            : session.isMonthlySession
                            ? "Monthly Session"
                            : "Regular Session"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {session.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.time} ({session.duration}min)
                          </div>
                          <div className="flex items-center gap-1">
                            {getLocationIcon(session.location)}
                            {session.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Session {session.sessionNumber}
                        </span>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Session Goals:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {session.goals.map((goal, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Emergency Contact:
                        </h4>
                        <div className="text-sm text-gray-600">
                          <p>{session.emergencyContact.name}</p>
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {session.emergencyContact.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes and Next Session */}
                    {session.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Notes:
                        </h4>
                        <p className="text-sm text-gray-600">{session.notes}</p>
                      </div>
                    )}

                    {session.nextSessionDate &&
                      session.status === "completed" && (
                        <div className="text-sm text-green-600 font-medium">
                          Next monthly session: {session.nextSessionDate}
                        </div>
                      )}

                    {session.nextSessionDate &&
                      session.status === "scheduled" && (
                        <div className="text-sm text-blue-600 font-medium">
                          Next session scheduled: {session.nextSessionDate}
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
                        onClick={() => completeSession(session.id)}
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
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Add Notes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Session Modal */}
        {showNewSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Schedule New Session
                </h2>
                <button
                  onClick={() => setShowNewSessionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form className="space-y-6">
                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">Choose a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} (ID: {client.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Select session type</option>
                      {sessionTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Therapy Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Select therapy type</option>
                      {therapyTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="75">75 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="Video Call">Video Call</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Phone Call">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Goals
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter session goals and objectives..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional notes for the session..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewSessionModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Schedule Session
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

export default TherapySessions;
