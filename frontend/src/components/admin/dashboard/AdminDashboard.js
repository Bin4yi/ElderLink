// src/components/admin/dashboard/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Shield,
  BarChart3,
  UserCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    systemAlerts: 0,
    eldersCared: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API calls
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          activeSubscriptions: 892,
          totalRevenue: 45680,
          pendingApprovals: 23,
          systemAlerts: 5,
          eldersCared: 756
        });
        
        setRecentActivities([
          { id: 1, type: 'user', message: 'New family member registered', time: '2 minutes ago' },
          { id: 2, type: 'subscription', message: 'Premium plan subscribed', time: '15 minutes ago' },
          { id: 3, type: 'alert', message: 'System maintenance completed', time: '1 hour ago' },
          { id: 4, type: 'approval', message: 'Doctor verification pending', time: '2 hours ago' },
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading admin dashboard..." />;
  }

  return (
    <RoleLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-white/80">
            Monitor and manage the entire ElderLink system from your control center
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Users className="w-10 h-10 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-500">+12% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Package className="w-10 h-10 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-xs text-green-500">+8% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <DollarSign className="w-10 h-10 text-yellow-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-500">+15% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <UserCheck className="w-10 h-10 text-purple-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Elders Cared</p>
                <p className="text-2xl font-bold">{stats.eldersCared}</p>
                <p className="text-xs text-green-500">+5% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Clock className="w-10 h-10 text-orange-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                <p className="text-xs text-yellow-500">Needs attention</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">System Alerts</p>
                <p className="text-2xl font-bold">{stats.systemAlerts}</p>
                <p className="text-xs text-red-500">Requires review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
            <p className="text-gray-600">Add, edit, or remove system users</p>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Package className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Package Management</h3>
            <p className="text-gray-600">Configure care packages and pricing</p>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
            <p className="text-gray-600">Monitor system performance and usage</p>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">System Settings</h3>
            <p className="text-gray-600">Configure system-wide settings</p>
          </button>
        </div>

        {/* Recent Activity & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'subscription' ? 'bg-green-500' :
                    activity.type === 'alert' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notification Service</span>
                <span className="flex items-center text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Delayed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default AdminDashboard;