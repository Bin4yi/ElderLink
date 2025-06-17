// frontend/src/pages/Dashboard.js (UPDATED for multiple subscriptions)
import React, { useState, useEffect } from 'react';
import { Plus, Users, CreditCard, Bell, Calendar, TrendingUp } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
// UPDATED IMPORTS - Changed from components/subscription to components/family/subscription
import PackageSelection from '../components/family/subscription/PackageSelection';
// UPDATED IMPORTS - Changed from components/elder to components/family/elder
import AddElder from '../components/family/elder/AddElder';
import ElderList from '../components/family/elder/ElderList';
import ElderProfile from '../components/family/elder/ElderProfile';
// UPDATED IMPORTS - Changed from components/subscription to components/family/subscription
import SubscriptionStatus from '../components/family/subscription/SubscriptionStatus';
import { subscriptionService } from '../services/subscription';
import { elderService } from '../services/elder';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [availableSubscriptions, setAvailableSubscriptions] = useState([]);
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState(null);
  const [currentView, setCurrentView] = useState('overview'); // overview, packages, add-elder, elder-profile
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, eldersData, availableSubsData] = await Promise.all([
        subscriptionService.getSubscriptions(),
        elderService.getElders(),
        subscriptionService.getAvailableSubscriptions()
      ]);
      
      console.log('Dashboard data loaded:');
      console.log('- Subscriptions:', subscriptionsData.subscriptions?.length || 0);
      console.log('- Elders:', eldersData.elders?.length || 0);
      console.log('- Available subscriptions:', availableSubsData.availableSubscriptions?.length || 0);
      
      setSubscriptions(subscriptionsData.subscriptions || []);
      setElders(eldersData.elders || []);
      setAvailableSubscriptions(availableSubsData.availableSubscriptions || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSuccess = (subscription) => {
    console.log('New subscription created:', subscription);
    setSubscriptions(prev => [subscription, ...prev]);
    
    // Refresh data to get updated available subscriptions
    loadDashboardData();
    
    setCurrentView('overview');
    toast.success('Subscription created successfully! You can now add an elder to this plan.');
  };

  const handleElderAdded = (elder) => {
    console.log('Elder added:', elder);
    setElders(prev => [elder, ...prev]);
    setCurrentView('overview');
    
    // Refresh data to update subscription status and available subscriptions
    loadDashboardData();
    
    toast.success('Elder added successfully!');
  };

  const handleSelectElder = (elder) => {
    setSelectedElder(elder);
    setCurrentView('elder-profile');
  };

  const handleAddElderToSubscription = (subscription) => {
    console.log('Adding elder to subscription:', subscription);
    setSelectedSubscription(subscription);
    setCurrentView('add-elder');
  };

  const handleAddNewPackage = () => {
    console.log('Adding new package');
    setCurrentView('packages');
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter(sub => sub.status === 'active');
  };

  const getSubscriptionsWithElders = () => {
    return subscriptions.filter(sub => sub.elder);
  };

  const getSubscriptionsWithoutElders = () => {
    return subscriptions.filter(sub => sub.status === 'active' && !sub.elder);
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'packages':
        return <PackageSelection onSubscribe={handleSubscriptionSuccess} />;
      
      case 'add-elder':
        return (
          <AddElder
            subscription={selectedSubscription}
            availableSubscriptions={availableSubscriptions}
            onSuccess={handleElderAdded}
            onCancel={() => setCurrentView('overview')}
          />
        );
      
      case 'elder-profile':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView('overview')}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              ← Back to Dashboard
            </button>
            <ElderProfile elder={selectedElder} />
          </div>
        );
      
      default:
        return (
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
                    <p className="text-2xl font-bold">{getActiveSubscriptions().length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Bell className="w-10 h-10 text-yellow-500 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Available Plans</p>
                    <p className="text-2xl font-bold">{getSubscriptionsWithoutElders().length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-10 h-10 text-blue-500 mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p className="text-2xl font-bold">94%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Always show option to add new package */}
              <button
                onClick={handleAddNewPackage}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Plus className="w-6 h-6 text-primary-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Subscribe to New Plan</h3>
                <p className="text-gray-600">Add another care package for your loved ones</p>
              </button>

              {/* Show available subscriptions */}
              {getSubscriptionsWithoutElders().length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Add Elder to Plan</h3>
                  <p className="text-gray-600 mb-4">
                    You have {getSubscriptionsWithoutElders().length} subscription(s) waiting for elder assignment
                  </p>
                  <div className="space-y-2">
                    {getSubscriptionsWithoutElders().map(subscription => (
                      <button
                        key={subscription.id}
                        onClick={() => handleAddElderToSubscription(subscription)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium capitalize">{subscription.plan} Plan</div>
                        <div className="text-sm text-gray-600">${subscription.amount} - Click to add elder</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Schedule Checkup</h3>
                <p className="text-gray-600">Book a health consultation for your elder</p>
              </button>
            </div>

            {/* Active Subscriptions */}
            {subscriptions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Subscriptions</h2>
                <div className="space-y-6">
                  {subscriptions.map(subscription => (
                    <SubscriptionStatus
                      key={subscription.id}
                      subscription={subscription}
                      onManage={(sub) => console.log('Manage subscription:', sub)}
                      onAddElder={handleAddElderToSubscription}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Elders List */}
            {elders.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Elders</h2>
                <ElderList elders={elders} onSelectElder={handleSelectElder} />
              </div>
            )}

            {/* Empty State */}
            {subscriptions.length === 0 && elders.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">Get Started with ElderLink</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Subscribe to a care package to start monitoring and caring for your loved ones
                </p>
                <button
                  onClick={handleAddNewPackage}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Choose Your Package
                </button>
              </div>
            )}

          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};


export default Dashboard;