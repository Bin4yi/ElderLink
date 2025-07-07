// src/components/staff/dashboard/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { 
  Heart, 
  Users, 
  Clock, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Monitor,
  Clipboard
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedElders: 0,
    todayTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    healthAlerts: 0,
    averageRating: 0
  });
  // Removed todaySchedule state as schedule is now managed in CareManagement
  // Removed recentAlerts state
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API calls
      setTimeout(() => {
        setStats({
          assignedElders: 1,
          todayTasks: 5,
          completedTasks: 2,
          pendingTasks: 2,
          healthAlerts: 3,
          averageRating: 4.7
        });
        // Removed setTodaySchedule, schedule is now managed in CareManagement
        // Removed setRecentAlerts
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading staff dashboard..." />;
  }

  return (
    <RoleLayout title="Care Staff Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Good morning, {user?.firstName}!
          </h1>
          <p className="text-white/80">
            You have {stats.todayTasks} care tasks scheduled today. {stats.completedTasks} completed, {stats.pendingTasks} remaining.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Users className="w-10 h-10 text-teal-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Assigned Elders</p>
                <p className="text-2xl font-bold">{stats.assignedElders}</p>
                <p className="text-xs text-blue-500">Under your care</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Clipboard className="w-10 h-10 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold">{stats.todayTasks}</p>
                <p className="text-xs text-gray-500">Scheduled for today</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="w-10 h-10 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-xs text-green-500">Great progress!</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Clock className="w-10 h-10 text-orange-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                <p className="text-xs text-orange-500">Needs attention</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Health Alerts</p>
                <p className="text-2xl font-bold">{stats.healthAlerts}</p>
                <p className="text-xs text-red-500">Urgent</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Heart className="w-10 h-10 text-pink-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Care Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
                <p className="text-xs text-pink-500">⭐⭐⭐⭐⭐</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <Heart className="w-6 h-6 text-teal-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Care Management</h3>
            <p className="text-gray-600">Manage daily care activities</p>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Monitor className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Health Monitoring</h3>
            <p className="text-gray-600">Check vital signs and health status</p>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Alert Management</h3>
            <p className="text-gray-600">Review and respond to alerts</p>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Activity Reports</h3>
            <p className="text-gray-600">Generate care activity reports</p>
          </button>
        </div>
        {/* Removed Recent Health Alerts section */}
      </div>
    </RoleLayout>
  );
};

export default StaffDashboard;
