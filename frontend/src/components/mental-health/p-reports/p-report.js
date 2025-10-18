// frontend/src/components/mental-health/p-reports/p-reports.js
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout";
import mentalHealthService from "../../../services/mentalHealthService";
import toast from "react-hot-toast";

const ProgressReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const filters =
        selectedFilter !== "all" ? { status: selectedFilter } : {};
      const reportsResponse =
        await mentalHealthService.getSpecialistProgressReports(filters);
      setReports(reportsResponse.progressReports || []);

      const clientsResponse = await mentalHealthService.getSpecialistClients();
      setClients(clientsResponse.clients || []);
    } catch (error) {
      console.error("Error loading progress reports:", error);
      toast.error("Failed to load progress reports");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await mentalHealthService.createProgressReport({
        elderId: formData.get("elderId"),
        reportType: formData.get("reportType"),
        period: formData.get("period"),
        overallProgress: parseInt(formData.get("overallProgress")),
        mentalHealthScore: parseFloat(formData.get("mentalHealthScore")),
        previousScore: parseFloat(formData.get("previousScore")),
        highlights: [],
        concerns: [],
        recommendations: [],
      });

      toast.success("Progress report created successfully!");
      setShowNewReportModal(false);
      loadData();
    } catch (error) {
      console.error("Error creating progress report:", error);
      toast.error("Failed to create progress report");
    }
  };

  const filteredReports = reports.filter((report) => {
    const clientName =
      `${report.elder?.firstName} ${report.elder?.lastName}`.toLowerCase();
    return clientName.includes(searchTerm.toLowerCase());
  });

  const getTrendIcon = (current, previous) => {
    if (current > previous) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return "text-green-600";
    if (current < previous) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <RoleLayout active="progress-reports">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading progress reports...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout active="progress-reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Progress Reports
              </h1>
              <p className="text-gray-600">
                Track client progress and outcomes
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowNewReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improving</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    reports.filter((r) => r.mentalHealthScore > r.previousScore)
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Minus className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stable</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    reports.filter(
                      (r) => r.mentalHealthScore === r.previousScore
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Declining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    reports.filter((r) => r.mentalHealthScore < r.previousScore)
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
                  placeholder="Search reports by client name..."
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
                <option value="all">All Reports</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {report.elder?.firstName} {report.elder?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {report.reportType} • {report.period}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Created:{" "}
                          {new Date(report.dateCreated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Overall Progress
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {report.overallProgress}%
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${report.overallProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Mental Health Score
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-gray-900">
                            {report.mentalHealthScore}
                          </p>
                          {getTrendIcon(
                            report.mentalHealthScore,
                            report.previousScore
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 ${getTrendColor(
                            report.mentalHealthScore,
                            report.previousScore
                          )}`}
                        >
                          Previous: {report.previousScore}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Change</p>
                        <p
                          className={`text-2xl font-bold ${getTrendColor(
                            report.mentalHealthScore,
                            report.previousScore
                          )}`}
                        >
                          {report.mentalHealthScore > report.previousScore
                            ? "+"
                            : ""}
                          {(
                            report.mentalHealthScore - report.previousScore
                          ).toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Highlights & Concerns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.highlights && report.highlights.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Highlights
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.highlights
                              .slice(0, 2)
                              .map((highlight, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-green-500 mt-0.5">
                                    ✓
                                  </span>
                                  {highlight}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {report.concerns && report.concerns.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Concerns
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.concerns
                              .slice(0, 2)
                              .map((concern, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-orange-500 mt-0.5">
                                    !
                                  </span>
                                  {concern}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      View Full Report
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-16 text-center">
              <BarChart3 className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                No Progress Reports Found
              </h2>
              <p className="text-gray-500 mb-8">
                Create your first progress report to track client outcomes.
              </p>
              <button
                onClick={() => setShowNewReportModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Report
              </button>
            </div>
          )}
        </div>

        {/* New Report Modal */}
        {showNewReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Create Progress Report
                </h2>
                <button
                  onClick={() => setShowNewReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <select
                    name="elderId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500
                    focus:border-transparent"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type
                    </label>
                    <select
                      name="reportType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Weekly Progress Report">
                        Weekly Progress Report
                      </option>
                      <option value="Monthly Progress Report">
                        Monthly Progress Report
                      </option>
                      <option value="Quarterly Review">Quarterly Review</option>
                      <option value="Treatment Completion Report">
                        Treatment Completion Report
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period
                    </label>
                    <input
                      type="text"
                      name="period"
                      placeholder="e.g., Week of Jan 15-21, 2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Progress (%)
                    </label>
                    <input
                      type="number"
                      name="overallProgress"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Score
                    </label>
                    <input
                      type="number"
                      name="mentalHealthScore"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0-10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Score
                    </label>
                    <input
                      type="number"
                      name="previousScore"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0-10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewReportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Report
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

export default ProgressReports;
