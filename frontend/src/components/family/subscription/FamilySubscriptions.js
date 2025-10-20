import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  Calendar, 
  Shield, 
  Star, 
  Check, 
  X, 
  Users,
  Heart,
  Bell,
  Smartphone,
  Clock,
  Crown,
  Zap,
  Plus,
  Download,
  RefreshCw,
  Settings,
  AlertTriangle
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';

const FamilySubscriptions = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewingSubscription, setRenewingSubscription] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
    fetchHistory();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      console.log('Subscriptions:', response.data.subscriptions);
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/subscriptions/stats');
      console.log('Subscription stats:', response.data.stats);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/subscriptions/history');
      console.log('Subscription history:', response.data.history);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSubscriptions(), fetchStats(), fetchHistory()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const getDaysUntilExpiration = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan) => {
    const names = {
      basic: 'Basic Plan',
      premium: 'Premium Plan',
      comprehensive: 'Comprehensive Plan'
    };
    return names[plan] || plan;
  };

  const getDurationLabel = (duration) => {
    const labels = {
      '1_month': '1 Month',
      '6_months': '6 Months',
      '1_year': '1 Year'
    };
    return labels[duration] || duration;
  };

  // Mock data for plan selection UI - keep for reference
  const currentSubscription = {
    plan: 'Premium Family Plan',
    status: 'Active',
    startDate: '2024-01-15',
    nextBilling: '2025-08-15',
    price: '$29.99',
    period: 'monthly',
    elders: 2,
    maxElders: 5,
    features: [
      '24/7 Health Monitoring',
      'Emergency Alerts',
      'Medication Reminders',
      'Family Dashboard',
      'Video Consultations',
      'Health Reports',
      'Priority Support'
    ]
  };

  // Available plans
  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$9.99',
      period: 'monthly',
      maxElders: 1,
      popular: false,
      features: [
        'Basic Health Monitoring',
        'Medication Reminders',
        'Emergency Contacts',
        'Monthly Reports',
        'Email Support'
      ],
      notIncluded: [
        '24/7 Monitoring',
        'Video Consultations',
        'Multiple Elders',
        'Priority Support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '$19.99',
      period: 'monthly',
      maxElders: 3,
      popular: true,
      features: [
        '24/7 Health Monitoring',
        'Emergency Alerts',
        'Medication Reminders',
        'Family Dashboard',
        'Video Consultations',
        'Weekly Reports',
        'Priority Support',
        'Mobile App Access'
      ],
      notIncluded: [
        'Advanced Analytics',
        'Custom Integrations'
      ]
    },
    {
      id: 'family',
      name: 'Family Plan',
      price: '$29.99',
      period: 'monthly',
      maxElders: 5,
      popular: false,
      features: [
        'Everything in Premium',
        'Up to 5 Elders',
        'Advanced Analytics',
        'Custom Integrations',
        'Dedicated Support',
        'Health Trends Analysis',
        'Care Coordination',
        'Multi-caregiver Access'
      ],
      notIncluded: []
    }
  ];

  // Billing history
  const billingHistory = [
    { date: '2025-07-15', amount: '$29.99', status: 'Paid', plan: 'Premium Family Plan' },
    { date: '2025-06-15', amount: '$29.99', status: 'Paid', plan: 'Premium Family Plan' },
    { date: '2025-05-15', amount: '$29.99', status: 'Paid', plan: 'Premium Family Plan' },
    { date: '2025-04-15', amount: '$29.99', status: 'Paid', plan: 'Premium Family Plan' },
    { date: '2025-03-15', amount: '$29.99', status: 'Paid', plan: 'Premium Family Plan' }
  ];

  const getDaysUntilRenewal = () => {
    const nextBilling = new Date(currentSubscription.nextBilling);
    const today = new Date();
    const diffTime = nextBilling - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRenew = async (subscription) => {
    setRenewingSubscription(subscription);
    setShowRenewalModal(true);
  };

  const processRenewal = async (duration, paymentMethodId) => {
    try {
      const response = await api.post(
        `/subscriptions/${renewingSubscription.id}/renew`,
        { duration, paymentMethodId }
      );

      if (response.data.success) {
        toast.success(`Subscription renewed! Elder assignment preserved: ${response.data.dataPreserved.elderAssignment ? 'Yes' : 'No'}`);
        setShowRenewalModal(false);
        setRenewingSubscription(null);
        handleRefresh();
      }
    } catch (error) {
      console.error('Renewal error:', error);
      toast.error(error.response?.data?.message || 'Failed to renew subscription');
    }
  };

  if (loading) {
    return (
      <RoleLayout>
        <div className="flex items-center justify-center h-screen">
          <Loading text="Loading subscriptions..." size="large" />
        </div>
      </RoleLayout>
    );
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired');

  return (
    <RoleLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <CreditCard className="w-8 h-8 mr-3" />
                Family Subscriptions
              </h1>
              <p className="text-red-100 text-lg">Manage your care plans and billing</p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-blue-500 text-sm">Total</div>
                </div>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-green-500 text-sm">Active</div>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
                  <div className="text-yellow-500 text-sm">Expiring Soon</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                  <div className="text-red-500 text-sm">Expired</div>
                </div>
                <X className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-red-600" />
                Active Subscriptions ({activeSubscriptions.length})
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {activeSubscriptions.map((subscription) => {
                const daysRemaining = getDaysUntilExpiration(subscription.endDate);
                const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

                return (
                  <div
                    key={subscription.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition-all duration-200"
                  >
                    {/* Expiring Soon Warning */}
                    {isExpiringSoon && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-800 text-sm font-medium">
                          ⚠️ Expires in {daysRemaining} days! Renew soon to avoid service interruption.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Plan Details */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-2xl font-bold text-gray-900 flex items-center">
                              <Crown className="w-6 h-6 mr-2 text-yellow-500" />
                              {getPlanName(subscription.plan)}
                            </h4>
                            <div className="flex items-center space-x-4 mt-2 text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Started {new Date(subscription.startDate).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                                {subscription.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-red-600">
                              ${subscription.amount}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getDurationLabel(subscription.duration)}
                            </div>
                          </div>
                        </div>

                        {/* Elder Info */}
                        {subscription.elder ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                {subscription.elder.firstName?.charAt(0)}
                                {subscription.elder.lastName?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  Assigned to: {subscription.elder.firstName} {subscription.elder.lastName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Elder is being monitored
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-blue-800 font-medium">No Elder Assigned</p>
                                <p className="text-blue-600 text-sm">This subscription is ready to use</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expiration Info */}
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6">
                        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-red-600" />
                          Time Remaining
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-600">Expiration Date</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(subscription.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Days Remaining</div>
                            <div className={`text-3xl font-bold ${
                              daysRemaining <= 5 ? 'text-red-600' :
                              daysRemaining <= 10 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {daysRemaining > 0 ? daysRemaining : 0}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRenew(subscription)}
                          className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                          Renew Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expired Subscriptions */}
        {expiredSubscriptions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <X className="w-6 h-6 mr-3 text-red-600" />
                Expired Subscriptions ({expiredSubscriptions.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Renew to restore access - Your elder assignments and data will be preserved
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {expiredSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <X className="w-8 h-8 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {getPlanName(subscription.plan)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expired on {new Date(subscription.endDate).toLocaleDateString()}
                        </div>
                        {subscription.elder && (
                          <div className="text-sm text-green-600 flex items-center mt-1">
                            <Check className="w-4 h-4 mr-1" />
                            Data preserved for: {subscription.elder.firstName} {subscription.elder.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRenew(subscription)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Renew & Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {subscriptions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscriptions Yet</h3>
            <p className="text-gray-500 mb-6">
              Start caring for your loved ones by purchasing a subscription plan.
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Purchase Subscription
            </button>
          </div>
        )}

        {/* What Happens When Subscription Expires */}
        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            What Happens When Your Subscription Expires?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">5 Days Before Expiration</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>📧 You'll receive a reminder email</li>
                <li>⚠️ Dashboard shows expiration warning</li>
                <li>🔔 Notification alerts appear</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">After Expiration</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>❌ Health monitoring paused</li>
                <li>❌ Emergency alerts disabled</li>
                <li>❌ Access to reports restricted</li>
                <li>❌ Medication reminders stopped</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <strong>✅ Your Data is Safe:</strong> When you renew an expired subscription, all your elder assignments 
              and historical data will be restored automatically. No need to reconfigure anything!
            </p>
          </div>
        </div>

        {/* Subscription History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-blue-600" />
                Subscription History ({history.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.action === 'created' ? 'bg-green-100 text-green-600' :
                        record.action === 'renewed' ? 'bg-blue-100 text-blue-600' :
                        record.action === 'canceled' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {record.action === 'created' && <Plus className="w-5 h-5" />}
                        {record.action === 'renewed' && <RefreshCw className="w-5 h-5" />}
                        {record.action === 'canceled' && <X className="w-5 h-5" />}
                        {record.action === 'expired' && <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {record.action} - {getPlanName(record.plan)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(record.createdAt).toLocaleDateString()} • ${record.amount} • {getDurationLabel(record.duration)}
                        </div>
                        {record.subscription?.elder && (
                          <div className="text-sm text-gray-500">
                            Elder: {record.subscription.elder.firstName} {record.subscription.elder.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      ID: #{record.subscriptionId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Renewal Payment Modal */}
        {showRenewalModal && renewingSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Renew Subscription</h3>
              
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>✅ Your subscription ID will remain:</strong> #{renewingSubscription.id}
                  </p>
                  {renewingSubscription.elder && (
                    <p className="text-blue-800 text-sm mt-2">
                      <strong>✅ Elder assignment preserved:</strong> {renewingSubscription.elder.firstName} {renewingSubscription.elder.lastName}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => processRenewal('1_month', 'pm_card_visa')}
                    className="w-full bg-white border-2 border-gray-200 hover:border-red-500 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">1 Month</div>
                        <div className="text-sm text-gray-600">Perfect for trying</div>
                      </div>
                      <div className="text-xl font-bold text-red-600">$99</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => processRenewal('6_months', 'pm_card_visa')}
                    className="w-full bg-white border-2 border-gray-200 hover:border-red-500 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">6 Months</div>
                        <div className="text-sm text-gray-600">Save $60</div>
                      </div>
                      <div className="text-xl font-bold text-red-600">$534</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => processRenewal('1_year', 'pm_card_visa')}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-red-500 rounded-lg p-4 text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">1 Year</div>
                        <div className="text-sm text-red-100">Save $120 - Best Value!</div>
                      </div>
                      <div className="text-xl font-bold">$1,068</div>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRenewalModal(false);
                    setRenewingSubscription(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Note: Using Stripe test card. In production, integrate real payment method collection.
              </p>
            </div>
          </div>
        )}

      </div>
    </RoleLayout>
  );
};

export default FamilySubscriptions;
