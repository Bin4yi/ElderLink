// frontend/src/pages/Dashboard.js (UPDATED for multiple subscriptions + Appointment sidebar)

import React, { useState, useEffect } from 'react';
import { Plus, Users, CreditCard, Bell, Calendar, TrendingUp, UserCheck, Stethoscope, Brain } from 'lucide-react';
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
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || user?.name || 'User'}!
              </h1>
              <p className="text-white/80">
                Monitor and manage care for your loved ones from your dashboard
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Users className="w-10 h-10 text-red-500 mr-4" />
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

            {/* Subscription Status Warning */}
            {!hasValidSubscription() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Active Subscription</h3>
                <p className="text-yellow-700 mb-4">Subscribe to a care package to access all premium features</p>
                <button
                  onClick={() => setCurrentView('packages')}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all"
                >
                  Choose Package
                </button>
              </div>
            )}

            {/* Doctor Assignment Prompt */}
            {elders.length > 0 && hasValidSubscription() && (
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Medical Care Assignment</h3>
                    <p className="text-white/90">
                      Ensure all your elders have dedicated doctors for their medical care
                    </p>
                  </div>
                  <button
                    onClick={handleDoctorAssignment}
                    className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
                  >
                    <Stethoscope className="w-5 h-5" />
                    <span>Assign Doctors</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={handleAddNewPackage}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-red-200 group-hover:to-pink-200 transition-colors">
                    <Plus className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Subscribe to New Plan</h3>
                <p className="text-gray-600">Add another care package for your loved ones</p>
              </button>

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

              {/* ✅ DOCTOR ASSIGNMENT CARD */}
              <button 
                onClick={handleDoctorAssignment}
                className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Stethoscope className="w-6 h-6 text-green-500" />
                  </div>
                  {!hasValidSubscription() && (
                    <div className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Subscription Required
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">Assign Doctor</h3>
                <p className="text-gray-600">Assign doctors to provide medical care for your elders</p>
              </button>

              {/* Add Staff Assignment Card */}
              <button 
                onClick={handleStaffAssignment}
                className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <UserCheck className="w-6 h-6 text-purple-500" />
                  </div>
                  {!hasValidSubscription() && (
                    <div className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Subscription Required
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">Assign Care Staff</h3>
                <p className="text-gray-600">Assign dedicated staff members to your elders</p>
              </button>

              <button 
                onClick={handleScheduleCheckup}
                className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  {!hasValidSubscription() && (
                    <div className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Subscription Required
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">Schedule Checkup</h3>
                <p className="text-gray-600">Book a health consultation for your elder</p>
              </button>

              <button
                onClick={() => setCurrentView('mentalhealth-assignment')}
                className={`bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  {!hasValidSubscription() && (
                    <div className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Subscription Required
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">Assign Mental Health Coordinator</h3>
                <p className="text-gray-600">Assign mental health coordinators to support your elders</p>
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
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg px-8 py-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
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
      {renderContent()}
    </RoleLayout>
  );
};

export default FamilyDashboard;
