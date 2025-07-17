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
} from "lucide-react";

// Add this import for the layout with sidebar
import RoleLayout from "../../common/RoleLayout"; // Adjust path if needed

const MentalHealthClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedClients, setSelectedClients] = useState([]);

  // Mock data - replace with actual API call
  const mockClients = [
    {
      id: 1,
      name: "Margaret Johnson",
      age: 78,
      gender: "Female",
      profileImage: "/api/placeholder/150/150",
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
    },
    {
      id: 2,
      name: "Robert Chen",
      age: 82,
      gender: "Male",
      profileImage: "/api/placeholder/150/150",
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
    },
    {
      id: 3,
      name: "Dorothy Williams",
      age: 85,
      gender: "Female",
      profileImage: "/api/placeholder/150/150",
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <RoleLayout active="clients">
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
    <RoleLayout active="clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Client Management
              </h1>
              <p className="text-gray-600">
                Monitor and manage mental health clients
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add New Client
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Clients
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stable</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    clients.filter((c) => c.mentalHealthStatus === "stable")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Needs Attention
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    clients.filter(
                      (c) => c.mentalHealthStatus === "needs_attention"
                    ).length
                  }
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
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">
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
                    </div>
                  </div>

                  {/* Status and Risk */}
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        client.mentalHealthStatus
                      )}`}
                    >
                      {client.mentalHealthStatus
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
                      {client.conditions.map((condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {condition}
                        </span>
                      ))}
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
                      {client.nextAppointment}
                    </p>
                    <p className="text-xs text-gray-600">Next Appointment</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
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
      </div>
    </RoleLayout>
  );
};

export default MentalHealthClients;
