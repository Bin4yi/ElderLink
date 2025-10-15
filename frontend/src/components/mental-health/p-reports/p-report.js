import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout"; // Add this import for sidebar layout

const ProgressReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewReportModal, setShowNewReportModal] = useState(false);

  // Mock data
  const mockReports = [
    {
      id: 1,
      clientName: "Margaret Johnson",
      clientId: "C001",
      reportType: "Weekly Progress Report",
      period: "Week of Jan 1-7, 2025",
      dateCreated: "2025-01-08",
      status: "completed",
      overallProgress: 75,
      mentalHealthScore: 8.2,
      previousScore: 7.5,
      keyMetrics: {
        anxietyLevel: { current: 3, previous: 4, trend: "improving" },
        sleepQuality: { current: 8, previous: 6, trend: "improving" },
        socialInteraction: { current: 7, previous: 7, trend: "stable" },
        medicationCompliance: { current: 95, previous: 90, trend: "improving" },
      },
      highlights: [
        "Significant improvement in sleep quality",
        "Reduced anxiety symptoms",
        "Consistent medication adherence",
        "Active participation in therapy sessions",
      ],
      concerns: [
        "Occasional episodes of mild depression",
        "Social isolation during weekends",
      ],
      recommendations: [
        "Continue current CBT approach",
        "Encourage weekend social activities",
        "Monitor mood patterns closely",
      ],
      nextReview: "2025-01-15",
      therapist: "Dr. Sarah Mitchell",
    },
    {
      id: 2,
      clientName: "Robert Chen",
      clientId: "C002",
      reportType: "Monthly Assessment Report",
      period: "December 2024",
      dateCreated: "2025-01-05",
      status: "completed",
      overallProgress: 45,
      mentalHealthScore: 6.1,
      previousScore: 5.8,
      keyMetrics: {
        socialEngagement: { current: 4, previous: 3, trend: "improving" },
        ptsdSymptoms: { current: 6, previous: 7, trend: "improving" },
        dailyActivities: { current: 5, previous: 4, trend: "improving" },
        groupParticipation: { current: 3, previous: 2, trend: "improving" },
      },
      highlights: [
        "Increased participation in group activities",
        "Gradual reduction in PTSD symptoms",
        "Better engagement with care team",
      ],
      concerns: [
        "Still experiencing social isolation",
        "Reluctance to engage in new activities",
        "Sleep disturbances continue",
      ],
      recommendations: [
        "Increase group therapy frequency",
        "Introduce peer support programs",
        "Consider sleep disorder evaluation",
      ],
      nextReview: "2025-02-05",
      therapist: "Dr. Sarah Mitchell",
    },
    {
      id: 3,
      clientName: "Dorothy Williams",
      clientId: "C003",
      reportType: "Crisis Intervention Report",
      period: "Jan 10-12, 2025",
      dateCreated: "2025-01-12",
      status: "urgent",
      overallProgress: 25,
      mentalHealthScore: 4.2,
      previousScore: 3.1,
      keyMetrics: {
        suicidalIdeation: { current: 4, previous: 8, trend: "improving" },
        safetyAwareness: { current: 7, previous: 3, trend: "improving" },
        familySupport: { current: 8, previous: 6, trend: "improving" },
        medicationCompliance: { current: 85, previous: 60, trend: "improving" },
      },
      highlights: [
        "Significant reduction in suicidal ideation",
        "Increased safety awareness",
        "Strong family support engagement",
        "Improved medication compliance",
      ],
      concerns: [
        "Still at elevated risk",
        "Mood instability",
        "Requires continuous monitoring",
      ],
      recommendations: [
        "Continue daily check-ins",
        "Maintain 24/7 emergency contact",
        "Family counseling sessions",
        "Medication review with psychiatrist",
      ],
      nextReview: "2025-01-15",
      therapist: "Dr. Sarah Mitchell",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.period.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "weekly" && report.reportType.includes("Weekly")) ||
      (selectedFilter === "monthly" && report.reportType.includes("Monthly")) ||
      (selectedFilter === "urgent" && report.status === "urgent") ||
      (selectedFilter === "improving" &&
        report.mentalHealthScore > report.previousScore) ||
      (selectedFilter === "declining" &&
        report.mentalHealthScore < report.previousScore);

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return (
          <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
        );
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "improving":
        return "text-green-600";
      case "declining":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // PDF Download Function
  const downloadPDF = async (report) => {
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPos = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * fontSize * 0.35; // Return new Y position
      };

      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("PROGRESS REPORT", pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Client Information
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Client Information", margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text(`Client Name: ${report.clientName}`, margin, yPos);
      yPos += 7;
      doc.text(`Client ID: ${report.clientId}`, margin, yPos);
      yPos += 7;
      doc.text(`Report Type: ${report.reportType}`, margin, yPos);
      yPos += 7;
      doc.text(`Period: ${report.period}`, margin, yPos);
      yPos += 7;
      doc.text(`Date Created: ${report.dateCreated}`, margin, yPos);
      yPos += 7;
      doc.text(`Status: ${report.status.toUpperCase()}`, margin, yPos);
      yPos += 7;
      doc.text(`Therapist: ${report.therapist}`, margin, yPos);
      yPos += 15;

      // Overall Scores
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Overall Assessment", margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text(
        `Mental Health Score: ${report.mentalHealthScore} (Previous: ${report.previousScore})`,
        margin,
        yPos
      );
      yPos += 7;
      doc.text(`Overall Progress: ${report.overallProgress}%`, margin, yPos);
      yPos += 15;

      // Key Metrics
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Key Metrics", margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      Object.entries(report.keyMetrics).forEach(([metric, data]) => {
        const metricName = metric.replace(/([A-Z])/g, " $1").trim();
        const trendSymbol =
          data.trend === "improving"
            ? "↑"
            : data.trend === "declining"
            ? "↓"
            : "→";
        doc.text(
          `${metricName}: ${data.current} ${trendSymbol} (Previous: ${data.previous})`,
          margin,
          yPos
        );
        yPos += 7;
      });
      yPos += 10;

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      // Highlights
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Highlights", margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont(undefined, "normal");
      report.highlights.forEach((highlight, index) => {
        yPos = addWrappedText(
          `• ${highlight}`,
          margin,
          yPos,
          pageWidth - 2 * margin,
          11
        );
        yPos += 3;
      });
      yPos += 10;

      // Areas of Concern
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Areas of Concern", margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont(undefined, "normal");
      report.concerns.forEach((concern, index) => {
        yPos = addWrappedText(
          `• ${concern}`,
          margin,
          yPos,
          pageWidth - 2 * margin,
          11
        );
        yPos += 3;
      });
      yPos += 10;

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      // Recommendations
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Recommendations", margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont(undefined, "normal");
      report.recommendations.forEach((recommendation, index) => {
        yPos = addWrappedText(
          `• ${recommendation}`,
          margin,
          yPos,
          pageWidth - 2 * margin,
          11
        );
        yPos += 3;
      });
      yPos += 10;

      // Next Review
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(`Next Review Date: ${report.nextReview}`, margin, yPos);

      // Footer
      const footer = `Generated on ${new Date().toLocaleDateString()} | Confidential Medical Report`;
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(footer, pageWidth / 2, pageHeight - 10, { align: "center" });

      // Save the PDF
      const fileName = `${report.clientName.replace(
        /\s+/g,
        "_"
      )}_Progress_Report_${report.dateCreated}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Download All Reports as PDF
  const downloadAllReportsPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      // Title page
      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.text("PROGRESS REPORTS SUMMARY", pageWidth / 2, 50, {
        align: "center",
      });

      doc.setFontSize(14);
      doc.setFont(undefined, "normal");
      doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        70,
        { align: "center" }
      );
      doc.text(`Total Reports: ${filteredReports.length}`, pageWidth / 2, 85, {
        align: "center",
      });

      // Add each report
      filteredReports.forEach((report, index) => {
        doc.addPage();
        let yPos = margin;

        // Report header
        doc.setFontSize(18);
        doc.setFont(undefined, "bold");
        doc.text(`Report ${index + 1}: ${report.clientName}`, margin, yPos);
        yPos += 15;

        // Basic info
        doc.setFontSize(12);
        doc.setFont(undefined, "normal");
        doc.text(`Type: ${report.reportType}`, margin, yPos);
        yPos += 7;
        doc.text(`Period: ${report.period}`, margin, yPos);
        yPos += 7;
        doc.text(
          `Mental Health Score: ${report.mentalHealthScore}`,
          margin,
          yPos
        );
        yPos += 7;
        doc.text(`Overall Progress: ${report.overallProgress}%`, margin, yPos);
        yPos += 10;

        // Key metrics summary
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("Key Metrics:", margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        Object.entries(report.keyMetrics).forEach(([metric, data]) => {
          const metricName = metric.replace(/([A-Z])/g, " $1").trim();
          doc.text(
            `${metricName}: ${data.current} (${data.trend})`,
            margin,
            yPos
          );
          yPos += 5;
        });
      });

      doc.save(
        `All_Progress_Reports_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating summary PDF:", error);
      alert("Error generating summary PDF. Please try again.");
    }
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
                Track client progress and generate comprehensive reports
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowNewReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate Report
              </button>
              <button
                onClick={downloadAllReportsPDF}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
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
                <div className="w-6 h-6 border-3 border-yellow-600 rounded-full"></div>
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
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter((r) => r.status === "urgent").length}
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
                  placeholder="Search reports by client name, report type, or period..."
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
                <option value="weekly">Weekly Reports</option>
                <option value="monthly">Monthly Reports</option>
                <option value="urgent">Urgent Reports</option>
                <option value="improving">Improving Clients</option>
                <option value="declining">Needs Attention</option>
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
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Report Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {report.clientName}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {report.reportType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {report.period}
                      </div>
                      <div>Created: {report.dateCreated}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-purple-600">
                          {report.mentalHealthScore}
                        </span>
                        {getTrendIcon(
                          report.mentalHealthScore > report.previousScore
                            ? "improving"
                            : report.mentalHealthScore < report.previousScore
                            ? "declining"
                            : "stable"
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Mental Health Score
                      </div>
                      <div className="text-xs text-gray-400">
                        Previous: {report.previousScore}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {report.overallProgress}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Overall Progress
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadPDF(report)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Download PDF Report"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-6">
                {/* Key Metrics */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Metrics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(report.keyMetrics).map(([metric, data]) => (
                      <div key={metric} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-700 capitalize">
                            {metric.replace(/([A-Z])/g, " $1").trim()}
                          </h5>
                          {getTrendIcon(data.trend)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            {data.current}
                          </span>
                          <span
                            className={`text-sm ${getTrendColor(data.trend)}`}
                          >
                            {data.trend === "improving"
                              ? "↑"
                              : data.trend === "declining"
                              ? "↓"
                              : "→"}
                            {Math.abs(data.current - data.previous)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Previous: {data.previous}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights and Concerns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Highlights
                    </h4>
                    <ul className="space-y-2">
                      {report.highlights.map((highlight, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Areas of Concern
                    </h4>
                    <ul className="space-y-2">
                      {report.concerns.map((concern, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {report.recommendations.map((recommendation, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <div>Therapist: {report.therapist}</div>
                  <div>Next Review: {report.nextReview}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Report Modal */}
        {showNewReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Generate Progress Report
                </h2>
                <button
                  onClick={() => setShowNewReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Select a client</option>
                      <option value="1">Margaret Johnson</option>
                      <option value="2">Robert Chen</option>
                      <option value="3">Dorothy Williams</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="weekly">Weekly Progress Report</option>
                      <option value="monthly">Monthly Assessment Report</option>
                      <option value="crisis">Crisis Intervention Report</option>
                      <option value="discharge">
                        Discharge Summary Report
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Period Start
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Period End
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Any additional notes for this report..."
                  ></textarea>
                </div>

                {/* Recommendation Column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter recommendations for this report..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowNewReportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default ProgressReports;
