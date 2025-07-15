// src/components/doctor/dashboard/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Clock,
  AlertCircle,
  CheckCircle,
  Video,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import AppointmentManagement from '../appointments/AppointmentManagement'; // ✅ FIXED: Updated path


const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // ✅ ADD THIS STATE
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingConsultations: 0,
    completedToday: 0,
    emergencyAlerts: 0,
    avgRating: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual API calls
      setTimeout(() => {
        setStats({
          totalPatients: 156,
          todayAppointments: 8,
          pendingConsultations: 3,
          completedToday: 5,
          emergencyAlerts: 2,
          avgRating: 4.8
        });
        
        setTodaySchedule([
          { id: 1, time: '09:00 AM', patient: 'Eleanor Johnson', type: 'Video Call', status: 'completed' },
          { id: 2, time: '10:30 AM', patient: 'Robert Smith', type: 'Check-up', status: 'completed' },
          { id: 3, time: '02:00 PM', patient: 'Mary Wilson', type: 'Follow-up', status: 'upcoming' },
          { id: 4, time: '03:30 PM', patient: 'James Brown', type: 'Video Call', status: 'upcoming' },
        ]);

        setRecentConsultations([
          { id: 1, patient: 'Eleanor Johnson', condition: 'Hypertension follow-up', date: '2 hours ago', priority: 'normal' },
          { id: 2, patient: 'Robert Smith', condition: 'Diabetes check', date: '1 day ago', priority: 'high' },
          { id: 3, patient: 'Mary Wilson', condition: 'Heart monitoring', date: '2 days ago', priority: 'normal' },
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading doctor dashboard..." />;
  }

  // ✅ ADD TAB RENDERING FUNCTION
  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return <AppointmentManagement />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Good morning, Dr. {user?.firstName}!
        </h1>
        <p className="text-white/80">
          You have {stats.todayAppointments} appointments today. Ready to care for your patients?
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Users className="w-10 h-10 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
              <p className="text-xs text-green-500">+3 this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Calendar className="w-10 h-10 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              <p className="text-xs text-blue-500">{stats.completedToday} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Video className="w-10 h-10 text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Pending Consults</p>
              <p className="text-2xl font-bold">{stats.pendingConsultations}</p>
              <p className="text-xs text-orange-500">Needs attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <CheckCircle className="w-10 h-10 text-teal-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold">{stats.completedToday}</p>
              <p className="text-xs text-green-500">Great progress!</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="w-10 h-10 text-red-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Emergency Alerts</p>
              <p className="text-2xl font-bold">{stats.emergencyAlerts}</p>
              <p className="text-xs text-red-500">Immediate attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="w-10 h-10 text-yellow-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold">{stats.avgRating}</p>
              <p className="text-xs text-yellow-500">⭐⭐⭐⭐⭐</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => setActiveTab('appointments')}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">View Appointments</h3>
          <p className="text-gray-600">Manage your patient appointments</p>
        </button>

        <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">View Patients</h3>
          <p className="text-gray-600">Access patient records and history</p>
        </button>

        <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Video className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Start Video Call</h3>
          <p className="text-gray-600">Begin a consultation with patient</p>
        </button>

        <button className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Emergency Alerts</h3>
          <p className="text-gray-600">Check urgent patient notifications</p>
        </button>
      </div>

      {/* Today's Schedule & Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            {todaySchedule.map(appointment => (
              <div key={appointment.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 w-20">
                  {appointment.time}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{appointment.patient}</p>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  appointment.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {appointment.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Consultations</h3>
          <div className="space-y-4">
            {recentConsultations.map(consultation => (
              <div key={consultation.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  consultation.priority === 'high' ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{consultation.patient}</p>
                  <p className="text-sm text-gray-600">{consultation.condition}</p>
                  <p className="text-xs text-gray-500">{consultation.date}</p>
                </div>
                <Heart className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <RoleLayout title="Doctor Dashboard">
      {/* ✅ ADD TAB NAVIGATION */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Appointments
          </button>
        </nav>
      </div>

      {/* ✅ RENDER CONTENT BASED ON ACTIVE TAB */}
      {renderContent()}
    </RoleLayout>
  );
};

export default DoctorDashboard;