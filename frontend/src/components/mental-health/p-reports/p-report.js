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
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart2,
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
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

  const handleViewReport = async (reportId) => {
    try {
      const response = await mentalHealthService.getProgressReportById(
        reportId
      );
      setSelectedReport(response.progressReport);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error("Failed to load report details");
    }
  };

  const handleDownloadPDF = async (reportId) => {
    try {
      toast.loading("Generating PDF...");

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/mental-health/progress-reports/${reportId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `progress-report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.dismiss();
      toast.error("Failed to download PDF");
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
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Report
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(report.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
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

        {/* View Report Modal */}
        {showViewModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Progress Report Details
                    </h2>
                    <p className="text-purple-100">
                      {selectedReport.elder?.firstName}{" "}
                      {selectedReport.elder?.lastName} - {selectedReport.period}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Report Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Report Type</p>
                    <p className="font-semibold capitalize">
                      {selectedReport.reportType}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReport.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : selectedReport.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedReport.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Date Created</p>
                    <p className="font-semibold">
                      {new Date(
                        selectedReport.dateCreated
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Progress Metrics */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Progress Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Overall Progress
                        </span>
                        <span className="text-2xl font-bold text-purple-600">
                          {selectedReport.overallProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${selectedReport.overallProgress}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Mental Health Score
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {selectedReport.mentalHealthScore}
                          </span>
                          {selectedReport.previousScore && (
                            <span className="text-sm text-gray-500">
                              (prev: {selectedReport.previousScore})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (selectedReport.mentalHealthScore / 10) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                {selectedReport.keyMetrics &&
                  Object.keys(selectedReport.keyMetrics).length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-600" />
                        Key Metrics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedReport.keyMetrics).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="bg-gray-50 rounded-lg p-4 text-center"
                            >
                              <p className="text-xs text-gray-600 mb-1 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="text-xl font-bold text-gray-800">
                                {value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Highlights */}
                {selectedReport.highlights &&
                  selectedReport.highlights.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Key Highlights
                      </h3>
                      <ul className="space-y-2">
                        {selectedReport.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Concerns */}
                {selectedReport.concerns &&
                  selectedReport.concerns.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        Areas of Concern
                      </h3>
                      <ul className="space-y-2">
                        {selectedReport.concerns.map((concern, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">⚠</span>
                            <span className="text-gray-700">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Recommendations */}
                {selectedReport.recommendations &&
                  selectedReport.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {selectedReport.recommendations.map(
                          (recommendation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">→</span>
                              <span className="text-gray-700">
                                {recommendation}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Next Review */}
                {selectedReport.nextReview && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Next Review Scheduled
                    </p>
                    <p className="text-lg font-semibold text-purple-600">
                      {new Date(selectedReport.nextReview).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadPDF(selectedReport.id);
                    setShowViewModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default ProgressReports;
