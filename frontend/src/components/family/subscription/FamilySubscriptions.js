import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';

const FamilySubscriptions = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Current subscription data
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
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
              <Settings className="w-5 h-5 mr-2" />
              Manage Billing
            </button>
          </div>
        </div>

        {/* Current Subscription Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-red-600" />
              Current Subscription
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Overview */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Crown className="w-6 h-6 mr-2 text-yellow-500" />
                      {currentSubscription.plan}
                    </h4>
                    <div className="flex items-center space-x-4 mt-2 text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Started {new Date(currentSubscription.startDate).toLocaleDateString()}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        {currentSubscription.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">
                      {currentSubscription.price}
                      <span className="text-lg text-gray-500">/{currentSubscription.period}</span>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {currentSubscription.elders}/{currentSubscription.maxElders}
                        </div>
                        <div className="text-red-500 text-sm">Elders Connected</div>
                      </div>
                      <Users className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-red-600">{getDaysUntilRenewal()}</div>
                        <div className="text-red-500 text-sm">Days Until Renewal</div>
                      </div>
                      <Clock className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Included Features</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {currentSubscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Billing */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6">
                <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-600" />
                  Next Billing
                </h5>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(currentSubscription.nextBilling).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="text-xl font-bold text-red-600">{currentSubscription.price}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Payment Method</div>
                    <div className="flex items-center text-gray-900">
                      <CreditCard className="w-4 h-4 mr-1" />
                      •••• 4532
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors">
                    Update Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-3 text-red-600" />
              Available Plans
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                    plan.popular 
                      ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold text-red-600">
                      {plan.price}
                      <span className="text-lg text-gray-500">/{plan.period}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Up to {plan.maxElders} elder{plan.maxElders > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm opacity-50">
                        <X className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                      plan.id === 'family'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : plan.popular
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {plan.id === 'family' ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-red-600" />
                Billing History
              </h3>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billingHistory.map((bill, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-red-600 hover:text-red-700 font-medium">
                        Download Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Elder
            </button>
            <button className="bg-white hover:bg-gray-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment
            </button>
            <button className="bg-white hover:bg-gray-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download Receipts
            </button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};


export default FamilySubscriptions;