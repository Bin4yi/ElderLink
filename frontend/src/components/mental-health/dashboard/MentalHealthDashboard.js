// frontend/src/components/mental-health/dashboard/MentalHealthDashboard.js
import React, { useState, useEffect } from 'react';
import { Brain, Users, Calendar, FileText, BarChart3, Heart } from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';

const MentalHealthDashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    sessionsToday: 0,
    pendingAssessments: 0,
    completedTreatmentPlans: 0
  });

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);

  const menuItems = [
    { path: '/mental-health/dashboard', icon: Brain, label: 'Dashboard' },
    { path: '/mental-health/clients', icon: Users, label: 'Clients' },
    { path: '/mental-health/assessments', icon: Brain, label: 'Assessments' },
    { path: '/mental-health/therapy-sessions', icon: Calendar, label: 'Therapy Sessions' },
    { path: '/mental-health/treatment-plans', icon: FileText, label: 'Treatment Plans' },
    { path: '/mental-health/progress-reports', icon: BarChart3, label: 'Progress Reports' },
    { path: '/mental-health/resources', icon: Heart, label: 'Resources' }
  ];

  return (
    <RoleLayout title="Mental Health Consultant Dashboard" menuItems={menuItems}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mental Health Consultant Portal</h1>
              <p className="text-purple-100 mt-2">
                Supporting mental wellness for our elderly community
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
                <p className="text-gray-600">Total Clients</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.sessionsToday}</h3>
                <p className="text-gray-600">Sessions Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.pendingAssessments}</h3>
                <p className="text-gray-600">Pending Assessments</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.completedTreatmentPlans}</h3>
                <p className="text-gray-600">Active Treatment Plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Brain className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold">New Assessment</h3>
              <p className="text-sm text-gray-600">Start mental health evaluation</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Calendar className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold">Schedule Session</h3>
              <p className="text-sm text-gray-600">Book therapy appointment</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold">Treatment Plan</h3>
              <p className="text-sm text-gray-600">Create or update plan</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <BarChart3 className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold">Progress Report</h3>
              <p className="text-sm text-gray-600">Review client progress</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Heart className="w-8 h-8 text-red-500 mb-2" />
              <h3 className="font-semibold">Wellness Resources</h3>
              <p className="text-sm text-gray-600">Mental health materials</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="w-8 h-8 text-indigo-500 mb-2" />
              <h3 className="font-semibold">Group Session</h3>
              <p className="text-sm text-gray-600">Manage group therapy</p>
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Today's Sessions</h2>
            <div className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{session.clientName}</h3>
                      <p className="text-sm text-gray-600">{session.type}</p>
                      <p className="text-sm text-gray-500">{session.time}</p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        session.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No sessions scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Assessments</h2>
            <div className="space-y-4">
              {recentAssessments.length > 0 ? (
                recentAssessments.map((assessment, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{assessment.clientName}</h3>
                      <p className="text-sm text-gray-600">{assessment.type}</p>
                      <p className="text-sm text-gray-500">{assessment.date}</p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        assessment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent assessments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default MentalHealthDashboard;