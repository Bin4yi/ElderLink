// src/components/family/dashboard/FamilyDashboard.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { subscriptionService } from '../../../services/subscription';
import { elderService } from '../../../services/elder';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Users, CreditCard, Bell } from 'lucide-react';

const FamilyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [elders, setElders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [subscriptionsData, eldersData] = await Promise.all([
        subscriptionService.getSubscriptions(),
        elderService.getElders()
      ]);
      
      setSubscriptions(subscriptionsData.subscriptions || []);
      setElders(eldersData.elders || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <RoleLayout title="Family Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-white/80">
            Monitor and manage care for your loved ones from your dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Users className="w-10 h-10 text-primary-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Elders</p>
                <p className="text-2xl font-bold">{elders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <CreditCard className="w-10 h-10 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Bell className="w-10 h-10 text-yellow-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Plus className="w-10 h-10 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <p className="text-gray-600">No recent activity</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                Add New Elder
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg">
                Subscribe to Package
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default FamilyDashboard;