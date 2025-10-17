// src/components/admin/analytics/SystemAnalytics.js
import React, { useState, useEffect } from "react";
import RoleLayout from "../../common/RoleLayout";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import adminAnalyticsService from "../../../services/adminAnalyticsService";
import toast from "react-hot-toast";
import generateAnalyticsPDF from "../../../utils/generateAnalyticsPDF";

const SystemAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, subscriptions, revenue

  // State for analytics data
  const [overview, setOverview] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [subscriptionPage, setSubscriptionPage] = useState(1);

  // Colors for charts
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadOverview(),
        loadUserStats(),
        loadSubscriptionStats(),
        loadRevenueStats(),
      ]);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const response = await adminAnalyticsService.getDashboardOverview();
      if (response.success) {
        setOverview(response.data);
      }
    } catch (error) {
      console.error("Error loading overview:", error);
    }
  };

  const loadUserStats = async (page = 1) => {
    try {
      const response = await adminAnalyticsService.getUserStatistics(page, 10);
      if (response.success) {
        setUserStats(response.data);
        setUserPage(page);
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const loadSubscriptionStats = async (page = 1) => {
    try {
      const response = await adminAnalyticsService.getSubscriptionStatistics(
        page,
        10
      );
      if (response.success) {
        setSubscriptionStats(response.data);
        setSubscriptionPage(page);
      }
    } catch (error) {
      console.error("Error loading subscription stats:", error);
    }
  };

  const loadRevenueStats = async () => {
    try {
      const response = await adminAnalyticsService.getRevenueStatistics();
      if (response.success) {
        setRevenueStats(response.data);
      }
    } catch (error) {
      console.error("Error loading revenue stats:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast.success("Analytics data refreshed");
  };

  const handleDownloadPDF = async () => {
    try {
      // Check if we have data
      if (!overview && !userStats && !subscriptionStats && !revenueStats) {
        toast.error(
          "No data available to generate report. Please wait for data to load."
        );
        return;
      }

      toast.loading("Generating PDF report...", { id: "pdf-generation" });

      // Prepare data for PDF
      const pdfData = {
        overview,
        userStats,
        subscriptionStats,
        revenueStats,
      };

      // Generate PDF
      const filename = generateAnalyticsPDF(pdfData);

      toast.success(`Report downloaded: ${filename}`, { id: "pdf-generation" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report", { id: "pdf-generation" });
    }
  };

  if (loading) {
    return (
      <RoleLayout title="System Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="System Analytics">
      <div className="space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            System Analytics & Reports
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              title="Download PDF Report"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          {["overview", "users", "subscriptions", "revenue"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && overview && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Users"
                value={overview.overview.totalUsers}
                icon={Users}
                color="blue"
                subtitle={`${overview.overview.activeUsers} active`}
              />
              <StatsCard
                title="Active Users"
                value={overview.overview.activeUsers}
                icon={UserCheck}
                color="green"
                subtitle={`${overview.overview.inactiveUsers} inactive`}
              />
              <StatsCard
                title="Active Subscriptions"
                value={overview.overview.activeSubscriptions}
                icon={Package}
                color="purple"
                subtitle="Currently active"
              />
              <StatsCard
                title="Total Revenue"
                value={`$${overview.overview.totalRevenue}`}
                icon={DollarSign}
                color="yellow"
                subtitle="From active subscriptions"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Recent Activity (Last 7 Days)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">New Users</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {overview.recentActivity.newUsers}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">New Subscriptions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overview.recentActivity.newSubscriptions}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {overview.recentActivity.expiringSoon}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && userStats && (
          <div className="space-y-6">
            {/* User Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Users"
                value={userStats.overview.totalUsers}
                icon={Users}
                color="blue"
              />
              <StatsCard
                title="Active Users"
                value={userStats.overview.activeUsers}
                icon={UserCheck}
                color="green"
              />
              <StatsCard
                title="Inactive Users"
                value={userStats.overview.inactiveUsers}
                icon={UserX}
                color="red"
              />
            </div>

            {/* User Distribution Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Active Users by Role
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStats.byRole.active}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Users Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">User Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userStats.users.data.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {userStats.users.pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Page {userStats.users.pagination.page} of{" "}
                    {userStats.users.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadUserStats(userPage - 1)}
                      disabled={userPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => loadUserStats(userPage + 1)}
                      disabled={
                        userPage >= userStats.users.pagination.totalPages
                      }
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && subscriptionStats && (
          <div className="space-y-6">
            {/* Subscription Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Subscriptions"
                value={subscriptionStats.overview.totalSubscriptions}
                icon={Package}
                color="blue"
              />
              <StatsCard
                title="Active"
                value={subscriptionStats.overview.activeSubscriptions}
                icon={UserCheck}
                color="green"
              />
              <StatsCard
                title="Canceled"
                value={subscriptionStats.overview.canceledSubscriptions}
                icon={UserX}
                color="red"
              />
              <StatsCard
                title="Expired"
                value={subscriptionStats.overview.expiredSubscriptions}
                icon={Calendar}
                color="orange"
              />
            </div>

            {/* Subscriptions by Plan - Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Subscriptions by Plan
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriptionStats.byPlan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" name="Subscriptions" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                Subscription Details
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        End Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptionStats.subscriptions.data.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {sub.user?.firstName} {sub.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sub.user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
                            {sub.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sub.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                              sub.status === "active"
                                ? "bg-green-100 text-green-800"
                                : sub.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : sub.status === "expired"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${parseFloat(sub.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sub.endDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {subscriptionStats.subscriptions.pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Page {subscriptionStats.subscriptions.pagination.page} of{" "}
                    {subscriptionStats.subscriptions.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        loadSubscriptionStats(subscriptionPage - 1)
                      }
                      disabled={subscriptionPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        loadSubscriptionStats(subscriptionPage + 1)
                      }
                      disabled={
                        subscriptionPage >=
                        subscriptionStats.subscriptions.pagination.totalPages
                      }
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && revenueStats && (
          <div className="space-y-6">
            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Revenue"
                value={`$${revenueStats.overview.totalRevenue}`}
                icon={DollarSign}
                color="green"
                subtitle="All time"
              />
              <StatsCard
                title="Active Revenue"
                value={`$${revenueStats.overview.activeRevenue}`}
                icon={TrendingUp}
                color="blue"
                subtitle="Current active"
              />
              <StatsCard
                title="Average per Sub"
                value={`$${revenueStats.overview.averagePerSubscription}`}
                icon={BarChart3}
                color="purple"
                subtitle="Average value"
              />
              <StatsCard
                title="Projected Annual"
                value={`$${revenueStats.overview.projectedAnnualRevenue}`}
                icon={Calendar}
                color="yellow"
                subtitle="Based on active"
              />
            </div>

            {/* Revenue by Plan - Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Revenue by Plan
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueStats.byPlan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Details Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                Revenue Breakdown by Plan
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Subscriptions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg per Sub
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueStats.byPlan.map((plan, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                            {plan.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plan.subscriptions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          ${plan.revenue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          $
                          {(
                            parseFloat(plan.revenue) / plan.subscriptions
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

// Reusable Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
