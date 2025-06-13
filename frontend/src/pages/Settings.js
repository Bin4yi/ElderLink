// frontend/src/pages/Settings.js
import React, { useState } from 'react';
import { Bell, Shield, CreditCard, Users, Settings as SettingsIcon } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    healthUpdates: true,
    emergencyAlerts: true,
    weeklyReports: false
  });

  const [privacy, setPrivacy] = useState({
    shareHealthData: false,
    allowAnalytics: true,
    marketingEmails: false
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
              <p className="text-gray-600">Manage your preferences and account settings</p>
            </div>

            <div className="grid gap-8">
              {/* Notification Settings */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Bell className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-xl font-semibold">Notification Preferences</h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {key === 'emailAlerts' && 'Receive important updates via email'}
                          {key === 'smsAlerts' && 'Get urgent notifications via SMS'}
                          {key === 'healthUpdates' && 'Daily health status updates'}
                          {key === 'emergencyAlerts' && 'Immediate emergency notifications'}
                          {key === 'weeklyReports' && 'Weekly summary reports'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationChange(key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Shield className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-xl font-semibold">Privacy & Data</h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {key === 'shareHealthData' && 'Allow sharing anonymized health data for research'}
                          {key === 'allowAnalytics' && 'Help improve our service with usage analytics'}
                          {key === 'marketingEmails' && 'Receive promotional emails and updates'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handlePrivacyChange(key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-xl font-semibold">Account Management</h2>
                </div>

                <div className="space-y-4">
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium">Export Data</h3>
                    <p className="text-sm text-gray-600">Download all your data and elder information</p>
                  </button>

                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </button>

                  <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    <h3 className="font-medium text-red-600">Deactivate Account</h3>
                    <p className="text-sm text-red-500">Temporarily disable your account</p>
                  </button>
                </div>
              </div>

              {/* Billing Settings */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-xl font-semibold">Billing & Subscriptions</h2>
                </div>

                <div className="space-y-4">
                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium">Payment Methods</h3>
                    <p className="text-sm text-gray-600">Manage your saved payment methods</p>
                  </button>

                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium">Billing History</h3>
                    <p className="text-sm text-gray-600">View and download your invoices</p>
                  </button>

                  <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-medium">Subscription Management</h3>
                    <p className="text-sm text-gray-600">Upgrade, downgrade, or cancel your plans</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button className="btn-primary px-8 py-3">
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
