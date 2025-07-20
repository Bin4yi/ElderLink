import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Eye, 
  Lock,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Toggle,
  Save,
  Edit
} from 'lucide-react';

const FamilySettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    emergencyAlerts: true,
    healthReminders: true,
    appointmentReminders: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'family',
    shareHealthData: false,
    allowDataAnalytics: true
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'english',
    timezone: 'EST',
    soundEnabled: true
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Settings className="w-8 h-8 mr-3" />
              Family Settings
            </h1>
            <p className="text-red-100 text-lg">Manage your account and notification preferences</p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center transition-all duration-200 hover:scale-105">
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Quick Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
          <Bell className="w-8 h-8 mx-auto text-red-600 mb-2" />
          <div className="text-lg font-bold text-red-900">Notifications</div>
          <div className="text-red-600 text-sm">6 Active</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
          <Shield className="w-8 h-8 mx-auto text-red-600 mb-2" />
          <div className="text-lg font-bold text-red-900">Privacy</div>
          <div className="text-red-600 text-sm">Secure</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
          <User className="w-8 h-8 mx-auto text-red-600 mb-2" />
          <div className="text-lg font-bold text-red-900">Account</div>
          <div className="text-red-600 text-sm">Verified</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
          <Globe className="w-8 h-8 mx-auto text-red-600 mb-2" />
          <div className="text-lg font-bold text-red-900">Language</div>
          <div className="text-red-600 text-sm">English</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Bell className="w-6 h-6 mr-3 text-red-600" />
              Notification Preferences
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive updates via email' },
              { key: 'sms', label: 'SMS Notifications', icon: Phone, description: 'Get text message alerts' },
              { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Mobile app notifications' },
              { key: 'emergencyAlerts', label: 'Emergency Alerts', icon: Shield, description: 'Critical health emergencies' },
              { key: 'healthReminders', label: 'Health Reminders', icon: Bell, description: 'Medication and checkup reminders' },
              { key: 'appointmentReminders', label: 'Appointment Reminders', icon: Bell, description: 'Upcoming appointment alerts' }
            ].map(({ key, label, icon: Icon, description }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[key] ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-red-600" />
              Privacy & Security
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Profile Visibility</span>
                </div>
              </div>
              <select 
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="public">Public</option>
                <option value="family">Family Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            {[
              { key: 'shareHealthData', label: 'Share Health Data', description: 'Allow anonymized health data sharing for research' },
              { key: 'allowDataAnalytics', label: 'Data Analytics', description: 'Help improve our services with usage analytics' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </div>
                </div>
                <button
                  onClick={() => togglePrivacy(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy[key] ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacy[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Two-Factor Authentication</span>
              </div>
              <p className="text-sm text-red-700 mb-3">Add an extra layer of security to your account</p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-red-600" />
            App Preferences
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {preferences.darkMode ? <Moon className="w-5 h-5 text-red-600" /> : <Sun className="w-5 h-5 text-red-600" />}
                  <div>
                    <div className="font-medium text-gray-900">Dark Mode</div>
                    <div className="text-sm text-gray-600">Switch to dark theme</div>
                  </div>
                </div>
                <button
                  onClick={() => togglePreference('darkMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.darkMode ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {preferences.soundEnabled ? <Volume2 className="w-5 h-5 text-red-600" /> : <VolumeX className="w-5 h-5 text-red-600" />}
                  <div>
                    <div className="font-medium text-gray-900">Sound Effects</div>
                    <div className="text-sm text-gray-600">Enable app sounds</div>
                  </div>
                </div>
                <button
                  onClick={() => togglePreference('soundEnabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.soundEnabled ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Globe className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Language</span>
                </div>
                <select 
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Globe className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Timezone</span>
                </div>
                <select 
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="CST">Central Time (CST)</option>
                  <option value="MST">Mountain Time (MST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-6 border border-red-200 text-center">
        <h3 className="text-lg font-bold text-red-900 mb-2">Ready to save your changes?</h3>
        <p className="text-red-700 mb-4">Your settings will be applied immediately across all devices.</p>
        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center mx-auto">
          <Save className="w-5 h-5 mr-2" />
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default FamilySettings;