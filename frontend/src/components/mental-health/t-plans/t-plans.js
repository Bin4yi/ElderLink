// frontend/src/components/mental-health/t-plans/t-plans.js
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
  Activity,
  Target,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout";
import mentalHealthService from "../../../services/mentalHealthService";
import toast from "react-hot-toast";

const TreatmentPlans = () => {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const filters =
        selectedFilter !== "all" ? { status: selectedFilter } : {};
      const plansResponse =
        await mentalHealthService.getSpecialistTreatmentPlans(filters);
      setTreatmentPlans(plansResponse.treatmentPlans || []);

      const clientsResponse = await mentalHealthService.getSpecialistClients();
      setClients(clientsResponse.clients || []);
    } catch (error) {
      console.error("Error loading treatment plans:", error);
      toast.error("Failed to load treatment plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await mentalHealthService.createTreatmentPlan({
        elderId: formData.get("elderId"),
        planTitle: formData.get("planTitle"),
        priority: formData.get("priority"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        primaryDiagnosis: formData.get("primaryDiagnosis"),
        goals: [],
        interventions: [],
      });

      toast.success("Treatment plan created successfully!");
      setShowNewPlanModal(false);
      loadData();
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      toast.error("Failed to create treatment plan");
    }
  };

  const filteredPlans = treatmentPlans.filter((plan) => {
    const clientName =
      `${plan.elder?.firstName} ${plan.elder?.lastName}`.toLowerCase();
    const title = plan.planTitle.toLowerCase();
    return (
      clientName.includes(searchTerm.toLowerCase()) ||
      title.includes(searchTerm.toLowerCase())
    );
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
                  {treatmentPlans.length > 0
                    ? Math.round(
                        treatmentPlans.reduce(
                          (acc, p) => acc + (p.progress || 0),
                          0
                        ) / treatmentPlans.length
                      )
                    : 0}
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
                  placeholder="Search treatment plans by client name or plan title..."
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
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {plan.planTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <FileText className="w-4 h-4" />
                          <span>
                            Client: {plan.elder?.firstName}{" "}
                            {plan.elder?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          <span>Diagnosis: {plan.primaryDiagnosis}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            plan.status
                          )}`}
                        >
                          {plan.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            plan.priority
                          )}`}
                        >
                          {plan.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Overall Progress
                        </span>
                        <span className="text-sm font-semibold text-purple-600">
                          {plan.progress || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${plan.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Goals Summary */}
                    {plan.goals && plan.goals.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Treatment Goals ({plan.goals.length})
                        </h4>
                        <div className="space-y-2">
                          {plan.goals.slice(0, 3).map((goal, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  goal.status === "completed"
                                    ? "bg-green-500"
                                    : goal.status === "in_progress"
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <span className="text-gray-700">
                                {goal.description}
                              </span>
                              <span className="text-gray-500 text-xs">
                                ({goal.progress || 0}%)
                              </span>
                            </div>
                          ))}
                          {plan.goals.length > 3 && (
                            <p className="text-sm text-gray-500 ml-4">
                              +{plan.goals.length - 3} more goals
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interventions */}
                    {plan.interventions && plan.interventions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Key Interventions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {plan.interventions
                            .slice(0, 3)
                            .map((intervention, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                              >
                                {intervention}
                              </span>
                            ))}
                          {plan.interventions.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{plan.interventions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dates and Actions */}
                  <div className="lg:w-64 flex flex-col gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Start Date
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(plan.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        {plan.endDate && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              End Date
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(plan.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Last Updated
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(plan.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Edit className="w-4 h-4" />
                        Edit Plan
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Activity className="w-4 h-4" />
                        Update Progress
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-16 text-center">
              <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                No Treatment Plans Found
              </h2>
              <p className="text-gray-500 mb-8">
                Create your first treatment plan to get started.
              </p>
              <button
                onClick={() => setShowNewPlanModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Treatment Plan
              </button>
            </div>
          )}
        </div>

        {/* New Plan Modal */}
        {showNewPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Create Treatment Plan
                </h2>
                <button
                  onClick={() => setShowNewPlanModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <select
                    name="elderId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.elderId}>
                        {client.elder?.firstName} {client.elder?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Title
                  </label>
                  <input
                    type="text"
                    name="planTitle"
                    placeholder="e.g., Anxiety Management Treatment Plan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Diagnosis
                    </label>
                    <input
                      type="text"
                      name="primaryDiagnosis"
                      placeholder="e.g., Generalized Anxiety Disorder"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
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
                    Create Plan
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
