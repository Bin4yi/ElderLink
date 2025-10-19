// frontend/src/pages/Dashboard.js (UPDATED for multiple subscriptions + Appointment sidebar)

import React, { useState, useEffect } from 'react';
import { Plus, Users, CreditCard, Bell, Calendar, UserCheck, Stethoscope, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

// Changed: Using RoleLayout like doctor dashboard (consistent sidebar style)
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import PackageSelection from '../subscription/PackageSelection';
import AddElder from '../elder/AddElder';
import ElderList from '../elder/ElderList';
import ElderProfile from '../elder/ElderProfile';
import SubscriptionStatus from '../subscription/SubscriptionStatus';
import AppointmentList from '../appointments/AppointmentList';
import StaffAssignment from '../staff/StaffAssignment';
import DoctorAssignment from '../doctors/DoctorAssignment';
import MentalHealthAssignment from '../mentalhealth/MentalHealthAssignment';

// Services
import { subscriptionService } from '../../../services/subscription';
import { elderService } from '../../../services/elder';

// Context
import { useAuth } from '../../../context/AuthContext';

const FamilyDashboard = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [availableSubscriptions, setAvailableSubscriptions] = useState([]);
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
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

  const hasValidSubscription = () => {
    return subscriptions.some(sub => 
      sub.status === 'active' && 
      new Date(sub.endDate) > new Date()
    );
  };

  const requireSubscription = (callback, errorMessage = 'Active subscription required') => {
    if (!hasValidSubscription()) {
      toast.error(errorMessage);
      setCurrentView('packages');
      return false;
    }
    callback();
    return true;
  };

  const handleSubscriptionSuccess = (subscription) => {
    setSubscriptions(prev => [subscription, ...prev]);
    loadDashboardData();
    setCurrentView('overview');
    toast.success('Subscription created successfully! You can now add an elder to this plan.');
  };

  const handleElderAdded = (elder) => {
    setElders(prev => [elder, ...prev]);
    setCurrentView('overview');
    loadDashboardData();
    toast.success('Elder added successfully!');
  };

  const handleSelectElder = (elder) => {
    setSelectedElder(elder);
    setCurrentView('elder-profile');
  };

  const handleAddElderToSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setCurrentView('add-elder');
  };

  const handleAddNewPackage = () => {
    setCurrentView('packages');
  };

  const handleScheduleCheckup = () => {
    requireSubscription(
      () => {
        toast.success('Checkup scheduling feature coming soon!');
      },
      'You need an active subscription to schedule checkups'
    );
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter(sub => 
      sub.status === 'active' && 
      new Date(sub.endDate) > new Date()
    );
  };

  const getSubscriptionsWithoutElders = () => {
    return subscriptions.filter(sub => 
      sub.status === 'active' && 
      !sub.elder &&
      new Date(sub.endDate) > new Date()
    );
  };

  const handleAddElderClick = () => {
    if (getActiveSubscriptions().length === 0) {
      toast.error('You need an active subscription to add an elder');
      setCurrentView('packages');
      return;
    }
    
    if (getSubscriptionsWithoutElders().length === 0) {
      toast.error('All your subscriptions already have elders assigned. Subscribe to a new plan.');
      setCurrentView('packages');
      return;
    }
    
    setCurrentView('add-elder');
  };

  const handleStaffAssignment = () => {
    requireSubscription(
      () => {
        setCurrentView('staff-assignment');
      },
      'You need an active subscription to assign staff to elders'
    );
  };

  const handleDoctorAssignment = () => {
    requireSubscription(
      () => {
        setCurrentView('doctor-assignment');
      },
      'You need an active subscription to assign doctors to elders'
    );
  };

  const handleMentalHealthAssignment = () => {
    requireSubscription(
      () => {
        setCurrentView('mentalhealth-assignment');
      },
      'You need an active subscription to assign mental health coordinators'
    );
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'packages':
        return (
          <PackageSelection
            onSubscribe={handleSubscriptionSuccess}
            onBack={() => setCurrentView('overview')}
          />
        );
      
      case 'add-elder':
        if (!hasValidSubscription()) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-yellow-800 mb-2">Subscription Required</h3>
              <p className="text-yellow-700 mb-4">You need an active subscription to add an elder.</p>
              <button
                onClick={() => setCurrentView('packages')}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
              >
                Subscribe Now
              </button>
            </div>
          );
        }
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
              className="text-red-500 hover:text-red-600 font-medium"
            >
              ← Back to Dashboard
            </button>
            <ElderProfile elder={selectedElder} />
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView('overview')}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              ← Back to Dashboard
            </button>
            <AppointmentList />
          </div>
        );

      case 'staff-assignment':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView('overview')}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              ← Back to Dashboard
            </button>
            <StaffAssignment />
          </div>
        );

      case 'doctor-assignment':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView('overview')}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              ← Back to Dashboard
            </button>
            <DoctorAssignment />
          </div>
        );

      case 'mentalhealth-assignment':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView('overview')}
              className="text-purple-500 hover:text-purple-600 font-medium"
            >
              ← Back to Dashboard
            </button>
            <MentalHealthAssignment />
          </div>
        );
      
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-sm p-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back, {user?.firstName || user?.name || 'User'}
                  </h1>
                  <p className="text-white/90 text-sm">
                    Monitor and manage care for your loved ones
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Elders Card */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-pink-600"></div>
                <div className="relative p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-20 h-20 rounded-full bg-white/10 absolute -top-6 -right-6"></div>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Elders</p>
                    <p className="text-4xl font-bold text-white">{elders.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Active Plans Card */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-pink-600 to-red-600"></div>
                <div className="relative p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-20 h-20 rounded-full bg-white/10 absolute -top-6 -right-6"></div>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Active Plans</p>
                    <p className="text-4xl font-bold text-white">{getActiveSubscriptions().length}</p>
                  </div>
                </div>
              </div>
              
              {/* Available Plans Card */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-pink-600"></div>
                <div className="relative p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-20 h-20 rounded-full bg-white/10 absolute -top-6 -right-6"></div>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Available Plans</p>
                    <p className="text-4xl font-bold text-white">{getSubscriptionsWithoutElders().length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Status Warning */}
            {!hasValidSubscription() && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-1">No Active Subscription</h3>
                    <p className="text-red-700 text-sm mb-4">Subscribe to a care package to access all premium features</p>
                    <button
                      onClick={() => setCurrentView('packages')}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-medium shadow-sm"
                    >
                      Choose Package
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Assignment Prompt */}
            {elders.length > 0 && hasValidSubscription() && (
              <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Medical Care Assignment</h3>
                      <p className="text-gray-600 text-sm">
                        Ensure all your elders have dedicated doctors for their medical care
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDoctorAssignment}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all shadow-sm whitespace-nowrap ml-4"
                  >
                    Assign Doctors
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={handleAddNewPackage}
                className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscribe to New Plan</h3>
                <p className="text-gray-600 text-sm">Add another care package for your loved ones</p>
              </button>

              {getSubscriptionsWithoutElders().length > 0 && (
                <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Add Elder to Plan</h3>
                      <p className="text-sm text-gray-500">{getSubscriptionsWithoutElders().length} plan(s) available</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {getSubscriptionsWithoutElders().map(subscription => (
                      <button
                        key={subscription.id}
                        onClick={() => handleAddElderToSubscription(subscription)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
                      >
                        <div className="font-medium text-gray-900 capitalize">{subscription.plan} Plan</div>
                        <div className="text-sm text-gray-600">${subscription.amount} - Click to add elder</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleDoctorAssignment}
                className={`bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left group ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <Stethoscope className="w-6 h-6 text-red-500" />
                  </div>
                  {!hasValidSubscription() && (
                    <div className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                      Subscription Required
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Doctor</h3>
                <p className="text-gray-600 text-sm">Assign doctors to provide medical care for your elders</p>
              </button>

              <button 
                onClick={handleStaffAssignment}
                className={`bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left group ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <UserCheck className="w-6 h-6 text-pink-500" />
                  </div>
                  {!hasValidSubscription() && (
                    <div className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                      Subscription Required
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Care Staff</h3>
                <p className="text-gray-600 text-sm">Assign dedicated staff members to your elders</p>
              </button>

              <button
                onClick={() => setCurrentView('mentalhealth-assignment')}
                className={`bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left group ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <Brain className="w-6 h-6 text-red-400" />
                  </div>
                  {!hasValidSubscription() && (
                    <div className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                      Subscription Required
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mental Health Coordinator</h3>
                <p className="text-gray-600 text-sm">Assign mental health coordinators to support your elders</p>
              </button>
            </div>

            {/* Active Subscriptions */}
            {subscriptions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Subscriptions</h2>
                <div className="space-y-3">
                  {subscriptions.map(subscription => (
                    <SubscriptionStatus
                      key={subscription.id}
                      subscription={subscription}
                      onAddElder={handleAddElderToSubscription}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Elders List */}
            {elders.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Elders</h2>
                <ElderList elders={elders} onSelectElder={handleSelectElder} />
              </div>
            )}

            {/* Empty State */}
            {subscriptions.length === 0 && elders.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started with ElderLink</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Subscribe to a care package to start monitoring and caring for your loved ones
                </p>
                <button
                  onClick={handleAddNewPackage}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg px-8 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-sm font-medium"
                >
                  Choose Your Package
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  // Sidebar items array including Appointment section
  const sidebarItems = [
    { key: 'overview', label: 'Dashboard', icon: Users, onClick: () => setCurrentView('overview') },
    { key: 'appointments', label: 'Appointments', icon: Calendar, onClick: () => setCurrentView('appointments') },
    { key: 'doctor-assignment', label: 'Doctor Assignment', icon: Stethoscope, onClick: () => setCurrentView('doctor-assignment') },
    { key: 'staff-assignment', label: 'Staff Assignment', icon: UserCheck, onClick: () => setCurrentView('staff-assignment') },
    { key: 'packages', label: 'Packages', icon: CreditCard, onClick: () => setCurrentView('packages') },
    { key: 'add-elder', label: 'Add Elder', icon: Plus, onClick: handleAddElderClick }
  ];

  return (
    <RoleLayout
      role="family"
      sidebarItems={[
        { key: 'overview', label: 'Dashboard', icon: Users, onClick: () => setCurrentView('overview') },
        { key: 'appointments', label: 'Appointments', icon: Calendar, onClick: () => setCurrentView('appointments') },
        { key: 'doctor-assignment', label: 'Doctor Assignment', icon: Stethoscope, onClick: () => setCurrentView('doctor-assignment') },
        { key: 'staff-assignment', label: 'Staff Assignment', icon: UserCheck, onClick: () => setCurrentView('staff-assignment') },
        { key: 'packages', label: 'Packages', icon: CreditCard, onClick: () => setCurrentView('packages') },
        { key: 'add-elder', label: 'Add Elder', icon: Plus, onClick: handleAddElderClick }
      ]}
      currentView={currentView}
    >
      <div className="bg-gray-50 min-h-screen -m-6 p-6">
        {renderContent()}
      </div>
    </RoleLayout>
  );
};

export default FamilyDashboard;
