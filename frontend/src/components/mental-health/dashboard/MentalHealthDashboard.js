// frontend/src/components/mental-health/dashboard/MentalHealthDashboard.js
import React, { useState, useEffect } from "react";
import {
  Brain,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Heart,
  AlertCircle,
} from "lucide-react";
import RoleLayout from "../../common/RoleLayout";
import mentalHealthService from "../../../services/mentalHealthService";
import toast from "react-hot-toast";

const MentalHealthDashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    sessionsToday: 0,
    pendingAssessments: 0,
    activeTreatmentPlans: 0,
    criticalClients: 0,
  });

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard statistics
      const dashboardData = await mentalHealthService.getDashboardStatistics();
      setStats(dashboardData.statistics);
      setUpcomingSessions(dashboardData.upcomingSessions || []);
      setRecentAssessments(dashboardData.recentAssessments || []);

      // Fetch alerts
      const alertsData = await mentalHealthService.getAlerts();
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout active="dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Brain className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout active="dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Mental Health Consultant Portal
              </h1>
              <p className="text-purple-100 mt-2">
                Supporting mental wellness for our elderly community
              </p>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  Alerts Requiring Attention
                </h3>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="text-sm text-red-800">
                      • {alert.message}
                    </div>
                  ))}
                </div>
                {alerts.length > 3 && (
                  <p className="text-sm text-red-600 mt-2">
                    +{alerts.length - 3} more alerts
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
                <p className="text-gray-600">Total Clients</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.sessionsToday}</h3>
                <p className="text-gray-600">Sessions Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">
                  {stats.pendingAssessments}
                </h3>
                <p className="text-gray-600">Pending Assessments</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">
                  {stats.activeTreatmentPlans}
                </h3>
                <p className="text-gray-600">Active Treatment Plans</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.criticalClients}</h3>
                <p className="text-gray-600">Critical Clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() =>
                (window.location.href = "/mental-health/assessments")
              }
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Brain className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold">New Assessment</h3>
              <p className="text-sm text-gray-600">
                Start mental health evaluation
              </p>
            </button>

            <button
              onClick={() =>
                (window.location.href = "/mental-health/therapy-sessions")
              }
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Calendar className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold">Schedule Session</h3>
              <p className="text-sm text-gray-600">Book therapy appointment</p>
            </button>

            <button
              onClick={() =>
                (window.location.href = "/mental-health/treatment-plans")
              }
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <FileText className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold">Treatment Plan</h3>
              <p className="text-sm text-gray-600">Create or update plan</p>
            </button>

            <button
              onClick={() =>
                (window.location.href = "/mental-health/progress-reports")
              }
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <BarChart3 className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold">Progress Report</h3>
              <p className="text-sm text-gray-600">Review client progress</p>
            </button>

            <button
              onClick={() =>
                (window.location.href = "/mental-health/resources")
              }
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Heart className="w-8 h-8 text-red-500 mb-2" />
              <h3 className="font-semibold">Wellness Resources</h3>
              <p className="text-sm text-gray-600">Mental health materials</p>
            </button>

            <button
              onClick={() => (window.location.href = "/mental-health/clients")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Users className="w-8 h-8 text-indigo-500 mb-2" />
              <h3 className="font-semibold">View Clients</h3>
              <p className="text-sm text-gray-600">Manage client list</p>
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Today's Sessions</h2>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {session.elder?.firstName} {session.elder?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {session.sessionType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.scheduledTime}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          session.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : session.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No sessions scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Assessments</h2>
            <div className="space-y-4">
              {recentAssessments.length > 0 ? (
                recentAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {assessment.elder?.firstName}{" "}
                        {assessment.elder?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assessment.assessmentType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assessment.scheduledDate}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          assessment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : assessment.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {assessment.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent assessments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default MentalHealthDashboard;
