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

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('FamilyDashboard - User from context:', user);
    console.log('FamilyDashboard - User structure:', JSON.stringify(user, null, 2));
    console.log('FamilyDashboard - User firstName:', user?.firstName);
    console.log('FamilyDashboard - Token exists:', !!localStorage.getItem('token'));
    loadDashboardData();
  }, [user]);

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

  if (loading || authLoading) {
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
            {/* Welcome Section - Soft Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg border border-rose-100 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/20 to-purple-200/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-rose-200/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
              
              <div className="relative flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome back, {user?.firstName || 'Loading...'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Monitor and manage care for your loved ones with ease
                  </p>
                  {/* Debug info - remove later */}
                  {!user && <p className="text-xs text-red-500 mt-1">User object is null/undefined</p>}
                  {user && !user.firstName && <p className="text-xs text-orange-500 mt-1">User exists but firstName is missing. User keys: {Object.keys(user).join(', ')}</p>}
                </div>
              </div>
            </div>

            {/* Quick Stats - Soft Pastel Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Elders Card - Soft Blue */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-300/30 transition-all"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-600 text-sm font-medium mb-1">Total Elders</p>
                    <p className="text-4xl font-bold text-blue-700">{elders.length}</p>
                    <p className="text-blue-500 text-xs mt-2">Under your care</p>
                  </div>
                </div>
              </div>
              
              {/* Active Plans Card - Soft Pink */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-pink-300/30 transition-all"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-pink-600 text-sm font-medium mb-1">Active Plans</p>
                    <p className="text-4xl font-bold text-pink-700">{getActiveSubscriptions().length}</p>
                    <p className="text-pink-500 text-xs mt-2">Subscription packages</p>
                  </div>
                </div>
              </div>
              
              {/* Available Plans Card - Soft Purple */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-300/30 transition-all"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center shadow-lg">
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-purple-600 text-sm font-medium mb-1">Available Plans</p>
                    <p className="text-4xl font-bold text-purple-700">{getSubscriptionsWithoutElders().length}</p>
                    <p className="text-purple-500 text-xs mt-2">Ready for assignment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Status Warning - Soft Alert */}
            {!hasValidSubscription() && (
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl p-6 shadow-lg">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 mb-1">No Active Subscription</h3>
                    <p className="text-amber-700 text-sm mb-4">Subscribe to a care package to access all premium features and start caring for your loved ones</p>
                    <button
                      onClick={() => setCurrentView('packages')}
                      className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-2.5 rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                      Choose Package →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Assignment Prompt - Soft Medical Theme */}
            {elders.length > 0 && hasValidSubscription() && (
              <div className="relative overflow-hidden bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-400 rounded-2xl shadow-lg p-6">
                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-200/20 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-teal-900 mb-1">Medical Care Assignment</h3>
                      <p className="text-teal-700 text-sm">
                        Ensure all your elders have dedicated doctors for their medical care
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDoctorAssignment}
                    className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white px-6 py-2.5 rounded-xl font-medium hover:from-teal-500 hover:to-cyan-500 transition-all shadow-md hover:shadow-lg whitespace-nowrap ml-4"
                  >
                    Assign Doctors →
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions - Elegant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={handleAddNewPackage}
                className="group relative overflow-hidden bg-white border border-gray-100 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100/50 to-pink-100/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:from-rose-200/50 group-hover:to-pink-200/50 transition-all"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscribe to New Plan</h3>
                  <p className="text-gray-600 text-sm">Add another care package for your loved ones</p>
                </div>
              </button>

              {getSubscriptionsWithoutElders().length > 0 && (
                <div className="relative overflow-hidden bg-white border border-gray-100 p-6 rounded-2xl shadow-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-7 h-7 text-white" />
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
                          className="w-full text-left p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                          <div className="font-medium text-gray-900 capitalize">{subscription.plan} Plan</div>
                          <div className="text-sm text-gray-600">${subscription.amount} - Click to add elder</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleDoctorAssignment}
                className={`group relative overflow-hidden bg-white border border-gray-100 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-left ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100/50 to-cyan-100/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:from-teal-200/50 group-hover:to-cyan-200/50 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Stethoscope className="w-7 h-7 text-white" />
                    </div>
                    {!hasValidSubscription() && (
                      <div className="ml-2 text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium border border-amber-200">
                        Subscription Required
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Doctor</h3>
                  <p className="text-gray-600 text-sm">Assign doctors to provide medical care for your elders</p>
                </div>
              </button>

              <button 
                onClick={handleStaffAssignment}
                className={`group relative overflow-hidden bg-white border border-gray-100 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-left ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:from-purple-200/50 group-hover:to-indigo-200/50 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg">
                      <UserCheck className="w-7 h-7 text-white" />
                    </div>
                    {!hasValidSubscription() && (
                      <div className="ml-2 text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium border border-amber-200">
                        Subscription Required
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Care Staff</h3>
                  <p className="text-gray-600 text-sm">Assign dedicated staff members to your elders</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('mentalhealth-assignment')}
                className={`group relative overflow-hidden bg-white border border-gray-100 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-left ${
                  !hasValidSubscription() ? 'opacity-50' : ''
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100/50 to-purple-100/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:from-violet-200/50 group-hover:to-purple-200/50 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    {!hasValidSubscription() && (
                      <div className="ml-2 text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium border border-amber-200">
                        Subscription Required
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mental Health Coordinator</h3>
                  <p className="text-gray-600 text-sm">Assign mental health coordinators to support your elders</p>
                </div>
              </button>
            </div>

            {/* Active Subscriptions - Soft Card */}
            {subscriptions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Your Subscriptions</h2>
                </div>
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

            {/* Elders List - Soft Card */}
            {elders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Your Elders</h2>
                </div>
                <ElderList elders={elders} onSelectElder={handleSelectElder} />
              </div>
            )}

            {/* Empty State - Elegant */}
            {subscriptions.length === 0 && elders.length === 0 && (
              <div className="relative overflow-hidden text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-rose-200/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
                
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Get Started with ElderLink</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    Subscribe to a care package to start monitoring and caring for your loved ones
                  </p>
                  <button
                    onClick={handleAddNewPackage}
                    className="bg-gradient-to-r from-rose-400 to-pink-400 text-white text-lg px-10 py-4 rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-xl font-medium"
                  >
                    Choose Your Package →
                  </button>
                </div>
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
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen -m-6 p-6">
        {renderContent()}
      </div>
    </RoleLayout>
  );
};

export default FamilyDashboard;
