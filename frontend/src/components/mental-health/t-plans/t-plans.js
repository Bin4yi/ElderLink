import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout"; // Add this import for sidebar layout

const TreatmentPlans = () => {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  // Mock clients for dropdown
  const mockClients = [
    { id: "C001", name: "Margaret Johnson" },
    { id: "C002", name: "Robert Chen" },
    { id: "C003", name: "Dorothy Williams" },
  ];

  // State for new plan form
  const [newPlan, setNewPlan] = useState({
    clientId: "",
    clientName: "",
    state: "active",
    priority: "medium",
    goals: "",
    interventions: "",
    notes: "",
  });

  // Mock data
  const mockTreatmentPlans = [
    {
      id: 1,
      clientName: "Margaret Johnson",
      clientId: "C001",
      planTitle: "Anxiety Management Treatment Plan",
      status: "active",
      priority: "medium",
      startDate: "2024-12-01",
      endDate: "2025-03-01",
      progress: 65,
      primaryDiagnosis: "Generalized Anxiety Disorder",
      secondaryDiagnosis: "Mild Depression",
      therapist: "Dr. Sarah Mitchell",
      goals: [
        {
          id: 1,
          description: "Reduce anxiety symptoms by 50%",
          status: "in_progress",
          targetDate: "2025-02-01",
          progress: 70,
        },
        {
          id: 2,
          description: "Improve sleep quality",
          status: "completed",
          targetDate: "2025-01-15",
          progress: 100,
        },
        {
          id: 3,
          description: "Develop coping mechanisms",
          status: "in_progress",
          targetDate: "2025-02-15",
          progress: 60,
        },
      ],
      interventions: [
        "Cognitive Behavioral Therapy - 2x weekly",
        "Mindfulness exercises - daily",
        "Medication management",
        "Support group participation",
      ],
      nextReview: "2025-01-20",
      lastUpdated: "2025-01-10",
    },
    {
      id: 2,
      clientName: "Robert Chen",
      clientId: "C002",
      planTitle: "Social Isolation Recovery Plan",
      status: "active",
      priority: "high",
      startDate: "2024-11-15",
      endDate: "2025-02-15",
      progress: 40,
      primaryDiagnosis: "Social Isolation",
      secondaryDiagnosis: "PTSD",
      therapist: "Dr. Sarah Mitchell",
      goals: [
        {
          id: 1,
          description: "Increase social interactions",
          status: "in_progress",
          targetDate: "2025-01-30",
          progress: 45,
        },
        {
          id: 2,
          description: "Join community activities",
          status: "not_started",
          targetDate: "2025-02-10",
          progress: 0,
        },
        {
          id: 3,
          description: "Reduce PTSD symptoms",
          status: "in_progress",
          targetDate: "2025-02-15",
          progress: 35,
        },
      ],
      interventions: [
        "Group therapy - weekly",
        "Individual counseling - weekly",
        "Community engagement activities",
        "PTSD-focused therapy",
      ],
      nextReview: "2025-01-18",
      lastUpdated: "2025-01-08",
    },
    {
      id: 3,
      clientName: "Dorothy Williams",
      clientId: "C003",
      planTitle: "Crisis Intervention and Safety Plan",
      status: "critical",
      priority: "critical",
      startDate: "2025-01-10",
      endDate: "2025-04-10",
      progress: 15,
      primaryDiagnosis: "Major Depressive Disorder",
      secondaryDiagnosis: "Suicidal Ideation",
      therapist: "Dr. Sarah Mitchell",
      goals: [
        {
          id: 1,
          description: "Ensure immediate safety",
          status: "completed",
          targetDate: "2025-01-12",
          progress: 100,
        },
        {
          id: 2,
          description: "Implement safety plan",
          status: "in_progress",
          targetDate: "2025-01-15",
          progress: 80,
        },
        {
          id: 3,
          description: "Stabilize mood",
          status: "in_progress",
          targetDate: "2025-02-01",
          progress: 20,
        },
      ],
      interventions: [
        "Daily check-ins",
        "Crisis intervention therapy",
        "Medication adjustment",
        "Family support coordination",
        "24/7 emergency contact available",
      ],
      nextReview: "2025-01-13",
      lastUpdated: "2025-01-11",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setTreatmentPlans(mockTreatmentPlans);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPlans = treatmentPlans.filter((plan) => {
    const matchesSearch =
      plan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && plan.status === "active") ||
      (selectedFilter === "completed" && plan.status === "completed") ||
      (selectedFilter === "critical" && plan.status === "critical") ||
      (selectedFilter === "high_priority" && plan.priority === "high") ||
      (selectedFilter === "critical_priority" && plan.priority === "critical");

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "critical":
        return "bg-red-100 text-red-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
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

  const getGoalStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle form input changes
  const handleNewPlanChange = (e) => {
    const { name, value } = e.target;
    setNewPlan((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "clientId" && {
        clientName: mockClients.find((c) => c.id === value)?.name || "",
      }),
    }));
  };

  // Handle new plan submit (demo only, just closes modal)
  const handleCreatePlan = (e) => {
    e.preventDefault();
    // Add logic to save new plan if needed
    setShowNewPlanModal(false);
    setNewPlan({
      clientId: "",
      clientName: "",
      state: "active",
      priority: "medium",
      goals: "",
      interventions: "",
      notes: "",
    });
  };

  if (loading) {
    return (
      <RoleLayout active="treatment-plans">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <FileText className="w-8 h-8 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading treatment plans...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout active="treatment-plans">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Treatment Plans
              </h1>
              <p className="text-gray-600">
                Create and manage comprehensive treatment plans
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowNewPlanModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Plan
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Activity className="w-4 h-4" />
                Progress Review
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatmentPlans.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatmentPlans.filter((p) => p.status === "active").length}
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
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatmentPlans.filter((p) => p.status === "critical").length}
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
                <p className="text-sm font-medium text-gray-600">
                  Avg Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    treatmentPlans.reduce((acc, p) => acc + p.progress, 0) /
                      treatmentPlans.length
                  )}
                  %
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
                  placeholder="Search treatment plans by client name, plan title, or diagnosis..."
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
                <option value="all">All Plans</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="critical">Critical</option>
                <option value="high_priority">High Priority</option>
                <option value="critical_priority">Critical Priority</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Treatment Plans List */}
        <div className="space-y-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Plan Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {plan.planTitle}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          plan.status
                        )}`}
                      >
                        {plan.status.toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          plan.priority
                        )}`}
                      >
                        {plan.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {plan.clientName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {plan.startDate} - {plan.endDate}
                      </div>
                      <div>Therapist: {plan.therapist}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {plan.progress}%
                      </div>
                      <div className="text-sm text-gray-500">Progress</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Activity className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Diagnosis */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Diagnosis
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-sm text-gray-700">
                          Primary: {plan.primaryDiagnosis}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="text-sm text-gray-700">
                          Secondary: {plan.secondaryDiagnosis}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Dates */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Key Dates
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>Next Review: {plan.nextReview}</div>
                      <div>Last Updated: {plan.lastUpdated}</div>
                      <div>End Date: {plan.endDate}</div>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Treatment Goals
                  </h4>
                  <div className="space-y-3">
                    {plan.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {goal.description}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getGoalStatusColor(
                                goal.status
                              )}`}
                            >
                              {goal.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-2 ml-7">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Target: {goal.targetDate}</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  goal.status === "completed"
                                    ? "bg-green-500"
                                    : goal.status === "in_progress"
                                    ? "bg-blue-500"
                                    : "bg-gray-400"
                                }`}
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interventions */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Interventions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.interventions.map((intervention, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {intervention}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Treatment Plan Modal */}
        {showNewPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Treatment Plan
                </h2>
                <button
                  onClick={() => setShowNewPlanModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleCreatePlan}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Client Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client
                    </label>
                    <select
                      name="clientId"
                      value={newPlan.clientId}
                      onChange={handleNewPlanChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select client</option>
                      {mockClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* State Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      name="state"
                      value={newPlan.state}
                      onChange={handleNewPlanChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="critical">Critical</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  {/* Priority Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={newPlan.priority}
                      onChange={handleNewPlanChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Goals
                  </label>
                  <textarea
                    name="goals"
                    rows="4"
                    value={newPlan.goals}
                    onChange={handleNewPlanChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter treatment goals and objectives..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interventions
                  </label>
                  <textarea
                    name="interventions"
                    rows="4"
                    value={newPlan.interventions}
                    onChange={handleNewPlanChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="List planned interventions and treatments..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={newPlan.notes}
                    onChange={handleNewPlanChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional notes and observations..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewPlanModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Treatment Plan
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

export default TreatmentPlans;
