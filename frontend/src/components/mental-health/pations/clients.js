import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  Users,
  Brain,
  AlertCircle,
  Clock,
  CheckCircle,
  UserPlus,
  Edit,
  FileText,
  BarChart3,
  Heart,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout"; // Add this import for sidebar layout

const menuItems = [
  { path: "/mental-health/dashboard", icon: Brain, label: "Dashboard" },
  { path: "/mental-health/clients", icon: Users, label: "Clients" },
  { path: "/mental-health/assessments", icon: Brain, label: "Assessments" },
  {
    path: "/mental-health/therapy-sessions",
    icon: Calendar,
    label: "Therapy Sessions",
  },
  {
    path: "/mental-health/treatment-plans",
    icon: FileText,
    label: "Treatment Plans",
  },
  {
    path: "/mental-health/progress-reports",
    icon: BarChart3,
    label: "Progress Reports",
  },
  { path: "/mental-health/resources", icon: Heart, label: "Resources" },
  { path: "/profile", icon: Edit, label: "Profile" },
];

const MentalHealthClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Add state for scheduling first session modal
  const [showFirstSessionModal, setShowFirstSessionModal] = useState(false);
  const [firstSessionClient, setFirstSessionClient] = useState(null);

  // Enhanced mock data with different client states
  const mockClients = [
    {
      id: 1,
      name: "Margaret Johnson",
      age: 78,
      gender: "Female",
      profileImage: "/api/placeholder/150/150",
      status: "evaluated", // evaluated, pending_assessment, new_assignment
      mentalHealthStatus: "stable",
      lastAssessment: "2025-01-05",
      nextAppointment: "2025-01-20",
      riskLevel: "low",
      conditions: ["Mild Depression", "Anxiety"],
      emergencyContact: {
        name: "Sarah Johnson",
        relationship: "Daughter",
        phone: "+1 (555) 123-4567",
      },
      location: "Sunny Vale Care Center",
      therapyType: "Cognitive Behavioral Therapy",
      sessionCount: 12,
      notes: "Showing good progress with anxiety management",
      assignedDate: "2024-12-15",
      firstSessionDate: "2024-12-18",
    },
    {
      id: 2,
      name: "Robert Chen",
      age: 82,
      gender: "Male",
      profileImage: "/api/placeholder/150/150",
      status: "evaluated",
      mentalHealthStatus: "needs_attention",
      lastAssessment: "2025-01-08",
      nextAppointment: "2025-01-15",
      riskLevel: "medium",
      conditions: ["PTSD", "Social Isolation"],
      emergencyContact: {
        name: "Lisa Chen",
        relationship: "Daughter-in-law",
        phone: "+1 (555) 987-6543",
      },
      location: "Golden Years Facility",
      therapyType: "Group Therapy",
      sessionCount: 8,
      notes: "Requires more frequent check-ins",
      assignedDate: "2024-12-20",
      firstSessionDate: "2024-12-22",
    },
    {
      id: 3,
      name: "Dorothy Williams",
      age: 85,
      gender: "Female",
      profileImage: "/api/placeholder/150/150",
      status: "evaluated",
      mentalHealthStatus: "critical",
      lastAssessment: "2025-01-10",
      nextAppointment: "2025-01-12",
      riskLevel: "high",
      conditions: ["Severe Depression", "Suicidal Ideation"],
      emergencyContact: {
        name: "Michael Williams",
        relationship: "Son",
        phone: "+1 (555) 456-7890",
      },
      location: "Peaceful Gardens Care",
      therapyType: "Individual Therapy",
      sessionCount: 3,
      notes: "Immediate intervention required",
      assignedDate: "2025-01-05",
      firstSessionDate: "2025-01-08",
    },
    {
      id: 4,
      name: "James Thompson",
      age: 72,
      gender: "Male",
      profileImage: "/api/placeholder/150/150",
      status: "pending_assessment",
      mentalHealthStatus: "pending",
      lastAssessment: null,
      nextAppointment: "2025-01-18",
      riskLevel: "unknown",
      conditions: [],
      emergencyContact: {
        name: "Emma Thompson",
        relationship: "Wife",
        phone: "+1 (555) 234-5678",
      },
      location: "Sunny Vale Care Center",
      therapyType: "TBD",
      sessionCount: 0,
      notes: "Initial assessment scheduled",
      assignedDate: "2025-01-15",
      firstSessionDate: "2025-01-18",
    },
    {
      id: 5,
      name: "Maria Rodriguez",
      age: 69,
      gender: "Female",
      profileImage: "/api/placeholder/150/150",
      status: "new_assignment",
      mentalHealthStatus: "pending",
      lastAssessment: null,
      nextAppointment: null,
      riskLevel: "unknown",
      conditions: [],
      emergencyContact: {
        name: "Carlos Rodriguez",
        relationship: "Son",
        phone: "+1 (555) 345-6789",
      },
      location: "Golden Years Facility",
      therapyType: "TBD",
      sessionCount: 0,
      notes: "Newly assigned, awaiting first session scheduling",
      assignedDate: "2025-01-17",
      firstSessionDate: null,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setClients(mockClients);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.conditions.some((condition) =>
        condition.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "stable" && client.mentalHealthStatus === "stable") ||
      (selectedFilter === "needs_attention" &&
        client.mentalHealthStatus === "needs_attention") ||
      (selectedFilter === "critical" &&
        client.mentalHealthStatus === "critical") ||
      (selectedFilter === "pending" &&
        client.mentalHealthStatus === "pending") ||
      (selectedFilter === "new_assignments" &&
        client.status === "new_assignment") ||
      (selectedFilter === "pending_assessment" &&
        client.status === "pending_assessment") ||
      (selectedFilter === "high_risk" && client.riskLevel === "high") ||
      (selectedFilter === "medium_risk" && client.riskLevel === "medium") ||
      (selectedFilter === "low_risk" && client.riskLevel === "low");

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-800";
      case "needs_attention":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      case "unknown":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClientStatusBadge = (client) => {
    switch (client.status) {
      case "new_assignment":
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
            <UserPlus className="w-3 h-3" />
            New Assignment
          </span>
        );
      case "pending_assessment":
        return (
          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Assessment
          </span>
        );
      case "evaluated":
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Evaluated
          </span>
        );
      default:
        return null;
    }
  };

  const handleScheduleFirstSession = (client) => {
    setFirstSessionClient(client);
    setShowFirstSessionModal(true);
  };

  // Handle submit for first session details
  const handleFirstSessionSubmit = (sessionData) => {
    setClients(
      clients.map((c) =>
        c.id === firstSessionClient.id
          ? {
              ...c,
              status: "pending_assessment",
              firstSessionDate: sessionData.firstSessionDate,
              nextAppointment: sessionData.firstSessionDate,
              therapyType: sessionData.therapyType,
              notes: sessionData.notes,
            }
          : c
      )
    );
    setShowFirstSessionModal(false);
    setFirstSessionClient(null);
  };

  const handleCompleteAssessment = (client) => {
    setSelectedClient(client);
    setShowAssessmentModal(true);
  };

  const handleAssessmentSubmit = (assessmentData) => {
    setClients(
      clients.map((c) =>
        c.id === selectedClient.id
          ? {
              ...c,
              status: "evaluated",
              mentalHealthStatus: assessmentData.mentalHealthStatus,
              riskLevel: assessmentData.riskLevel,
              conditions: assessmentData.conditions,
              notes: assessmentData.notes,
              lastAssessment: new Date().toISOString().split("T")[0],
              sessionCount: 1,
              therapyType: assessmentData.therapyType,
            }
          : c
      )
    );
    setShowAssessmentModal(false);
    setSelectedClient(null);
  };

  const AssessmentModal = () => {
    const [formData, setFormData] = useState({
      mentalHealthStatus: "stable",
      riskLevel: "low",
      conditions: "",
      notes: "",
      therapyType: "Individual Therapy",
    });

    if (!showAssessmentModal || !selectedClient) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">
            Complete Assessment - {selectedClient.name}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Mental Health Status
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.mentalHealthStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mentalHealthStatus: e.target.value,
                  })
                }
              >
                <option value="stable">Stable</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Risk Level
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.riskLevel}
                onChange={(e) =>
                  setFormData({ ...formData, riskLevel: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Conditions (comma-separated)
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.conditions}
                onChange={(e) =>
                  setFormData({ ...formData, conditions: e.target.value })
                }
                placeholder="e.g., Depression, Anxiety, PTSD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Therapy Type
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.therapyType}
                onChange={(e) =>
                  setFormData({ ...formData, therapyType: e.target.value })
                }
              >
                <option value="Individual Therapy">Individual Therapy</option>
                <option value="Group Therapy">Group Therapy</option>
                <option value="Cognitive Behavioral Therapy">
                  Cognitive Behavioral Therapy
                </option>
                <option value="Family Therapy">Family Therapy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Assessment Notes
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Assessment findings and recommendations..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() =>
                handleAssessmentSubmit({
                  ...formData,
                  conditions: formData.conditions
                    .split(",")
                    .map((c) => c.trim())
                    .filter((c) => c),
                })
              }
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Complete Assessment
            </button>
            <button
              onClick={() => setShowAssessmentModal(false)}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // First Session Modal Component
  const FirstSessionModal = () => {
    const [formData, setFormData] = useState({
      firstSessionDate: "",
      therapyType: "Individual Therapy",
      notes: "",
    });

    if (!showFirstSessionModal || !firstSessionClient) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">
            Schedule First Session - {firstSessionClient.name}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Session Date
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.firstSessionDate}
                onChange={(e) =>
                  setFormData({ ...formData, firstSessionDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Therapy Type
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={formData.therapyType}
                onChange={(e) =>
                  setFormData({ ...formData, therapyType: e.target.value })
                }
              >
                <option value="Individual Therapy">Individual Therapy</option>
                <option value="Group Therapy">Group Therapy</option>
                <option value="Cognitive Behavioral Therapy">
                  Cognitive Behavioral Therapy
                </option>
                <option value="Family Therapy">Family Therapy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Session notes or special instructions..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleFirstSessionSubmit(formData)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              disabled={!formData.firstSessionDate}
            >
              Save Session
            </button>
            <button
              onClick={() => setShowFirstSessionModal(false)}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RoleLayout title="Mental Health Client Management" menuItems={menuItems}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Brain className="w-8 h-8 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Mental Health Client Management" menuItems={menuItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mental Health Client Management
              </h1>
              <p className="text-gray-600">
                Monitor and manage mental health clients through their care
                journey
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Removed Add New Client button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4" />
                Schedule Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">
                  Total Clients
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {clients.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">
                  New Assignments
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {clients.filter((c) => c.status === "new_assignment").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">
                  Pending Assessment
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {
                    clients.filter((c) => c.status === "pending_assessment")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Stable</p>
                <p className="text-xl font-bold text-gray-900">
                  {
                    clients.filter((c) => c.mentalHealthStatus === "stable")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">
                  Needs Attention
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {
                    clients.filter(
                      (c) => c.mentalHealthStatus === "needs_attention"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Critical</p>
                <p className="text-xl font-bold text-gray-900">
                  {
                    clients.filter((c) => c.mentalHealthStatus === "critical")
                      .length
                  }
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
                  placeholder="Search clients by name, location, or condition..."
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
                <option value="all">All Clients</option>
                <option value="new_assignments">New Assignments</option>
                <option value="pending_assessment">Pending Assessment</option>
                <option value="stable">Stable</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="critical">Critical</option>
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

        {/* Clients List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid gap-6 p-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Client Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Age: {client.age} • {client.gender}
                      </p>
                      <p className="text-sm text-gray-600">{client.location}</p>
                      <div className="mt-1">{getClientStatusBadge(client)}</div>
                    </div>
                  </div>

                  {/* Status and Risk */}
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        client.mentalHealthStatus
                      )}`}
                    >
                      {client.mentalHealthStatus === "pending"
                        ? "PENDING"
                        : client.mentalHealthStatus
                            .replace("_", " ")
                            .toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getRiskColor(
                        client.riskLevel
                      )}`}
                    >
                      {client.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>

                  {/* Conditions */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Conditions:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {client.conditions.length > 0 ? (
                        client.conditions.map((condition, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {condition}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          Not assessed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {client.sessionCount}
                    </p>
                    <p className="text-xs text-gray-600">Sessions</p>
                  </div>

                  {/* Next Appointment */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {client.nextAppointment || "Not scheduled"}
                    </p>
                    <p className="text-xs text-gray-600">Next Appointment</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {client.status === "new_assignment" && (
                      <button
                        onClick={() => handleScheduleFirstSession(client)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Schedule First Session
                      </button>
                    )}
                    {client.status === "pending_assessment" && (
                      <button
                        onClick={() => handleCompleteAssessment(client)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Complete Assessment
                      </button>
                    )}
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Calendar className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>
                        Emergency Contact: {client.emergencyContact.name} (
                        {client.emergencyContact.relationship})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {client.emergencyContact.phone}
                    </span>
                  </div>
                </div>

                {/* Assignment and Session Info */}
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span>Assigned: {client.assignedDate}</span>
                  {client.firstSessionDate && (
                    <span>First Session: {client.firstSessionDate}</span>
                  )}
                </div>

                {/* Notes */}
                {client.notes && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {client.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <AssessmentModal />
        <FirstSessionModal />
      </div>
    </RoleLayout>
  );
};

export default MentalHealthClients;
