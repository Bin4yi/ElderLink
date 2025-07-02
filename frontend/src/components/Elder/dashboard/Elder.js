import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  Pill, 
  Phone, 
  User, 
  Shield,
  Activity,
  Clock,
  Bell
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { useAuth } from '../../../context/AuthContext';
import { elderService } from '../../../services/elder';
import toast from 'react-hot-toast';

const ElderDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const profileData = await elderService.getElderProfile();
      setProfile(profileData.elder);
      
      // TODO: Load other data (appointments, medications, etc.)
      // This would be implemented with additional API endpoints
      
    } catch (error) {
      console.error('Failed to load elder dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading your dashboard..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Profile Not Found</h2>
          <p className="text-gray-500">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: Activity, label: 'Health Overview', path: '/elder/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/elder/appointments' },
    { icon: Pill, label: 'Medications', path: '/elder/medications' },
    { icon: Bell, label: 'Notifications', path: '/elder/notifications' },
    { icon: User, label: 'Profile', path: '/elder/profile' },
    { icon: Phone, label: 'Emergency', path: '/elder/emergency' }
  ];

  return (
    <RoleLayout title="My Health Dashboard" menuItems={menuItems}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {profile.photo ? (
                <img
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/elders/${profile.photo}`}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {profile.firstName}!
              </h1>
              <p className="text-white/80">
                Here's your health overview for today
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Heart className="w-10 h-10 text-red-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Calendar className="w-10 h-10 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Next Appointment</p>
                <p className="text-lg font-semibold">Tomorrow</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Pill className="w-10 h-10 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Medications</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Shield className="w-10 h-10 text-purple-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Care Plan</p>
                <p className="text-lg font-semibold capitalize">{profile.subscription?.plan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Today's Schedule
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold">Morning Medication</p>
                <p className="text-sm text-gray-600">8:00 AM - Blood pressure medication</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold">Doctor Visit</p>
                <p className="text-sm text-gray-600">2:00 PM - Dr. Johnson checkup</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-semibold">Evening Medication</p>
                <p className="text-sm text-gray-600">7:00 PM - Vitamins</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-red-500" />
              Emergency Contact
            </h2>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-800">Family Emergency</p>
                <p className="text-red-700">{profile.emergencyContact}</p>
                <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                  Call Now
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-800">Medical Emergency</p>
                <p className="text-blue-700">911</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Emergency Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Health Information Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Health Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Current Medications</h3>
              <p className="text-gray-600">{profile.currentMedications || 'No medications listed'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Allergies</h3>
              <p className="text-gray-600">{profile.allergies || 'No known allergies'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Chronic Conditions</h3>
              <p className="text-gray-600">{profile.chronicConditions || 'None reported'}</p>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default ElderDashboard;