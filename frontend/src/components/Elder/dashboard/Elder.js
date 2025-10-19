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
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Video,
  FileText,
  Thermometer,
  Wind,
  Target,
  ArrowRight,
  Stethoscope,
  MapPin,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { useAuth } from '../../../context/AuthContext';
import { elderService } from '../../../services/elder';
import { healthMonitoringService } from '../../../services/healthMonitoring';
import { appointmentService } from '../../../services/appointment';
import toast from 'react-hot-toast';

const ElderDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState({});
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentHealthData, setRecentHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    healthScore: 0,
    nextAppointment: 'No upcoming appointments',
    medicationCount: 0,
    carePlan: 'Standard'
  });
  
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch elder profile
      const profileResponse = await elderService.getElderProfile();
      const elderProfile = profileResponse.elder || profileResponse;
      setProfile(elderProfile);

      // Fetch health monitoring data (last 7 days)
      if (elderProfile.id) {
        try {
          const healthResponse = await healthMonitoringService.getElderHealthHistory(elderProfile.id, 7);
          if (healthResponse.success && healthResponse.data) {
            setRecentHealthData(healthResponse.data);
            
            // Get latest health metrics
            if (healthResponse.data.length > 0) {
              const latest = healthResponse.data[0];
              setHealthMetrics({
                heartRate: latest.heartRate,
                bloodPressureSystolic: latest.bloodPressureSystolic,
                bloodPressureDiastolic: latest.bloodPressureDiastolic,
                temperature: latest.temperature,
                oxygenSaturation: latest.oxygenSaturation,
                weight: latest.weight,
                sleepHours: latest.sleepHours,
                notes: latest.notes
              });

              // Calculate health score based on vitals
              const healthScore = calculateHealthScore(latest);
              setStats(prev => ({ ...prev, healthScore }));
            }
          }
        } catch (error) {
          console.error('Health data fetch error:', error);
          setRecentHealthData([]);
        }
      }

      // Fetch appointments
      try {
        const appointmentsResponse = await appointmentService.getAppointments();
        if (appointmentsResponse.success && appointmentsResponse.data) {
          const upcoming = appointmentsResponse.data
            .filter(apt => apt.status === 'scheduled' && new Date(apt.appointmentDate) > new Date())
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
            .slice(0, 5);
          
          setUpcomingAppointments(upcoming);

          // Set next appointment info
          if (upcoming.length > 0) {
            const nextApt = upcoming[0];
            const aptDate = new Date(nextApt.appointmentDate);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            let nextAppointmentText;
            if (aptDate.toDateString() === today.toDateString()) {
              nextAppointmentText = 'Today';
            } else if (aptDate.toDateString() === tomorrow.toDateString()) {
              nextAppointmentText = 'Tomorrow';
            } else {
              nextAppointmentText = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            
            setStats(prev => ({ ...prev, nextAppointment: nextAppointmentText }));
          }
        }
      } catch (error) {
        console.error('Appointments fetch error:', error);
        setUpcomingAppointments([]);
      }

      // Set care plan from subscription
      if (elderProfile.subscription?.plan) {
        setStats(prev => ({ ...prev, carePlan: elderProfile.subscription.plan }));
      }

      // Count medications (if available in profile)
      if (elderProfile.currentMedications) {
        const medCount = elderProfile.currentMedications.split(',').filter(m => m.trim()).length;
        setStats(prev => ({ ...prev, medicationCount: medCount }));
      }

    } catch (error) {
      console.error('Failed to load elder dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate health score based on vital signs
  const calculateHealthScore = (vitals) => {
    let score = 100;
    
    // Heart rate check (normal: 60-100)
    if (vitals.heartRate) {
      if (vitals.heartRate < 60 || vitals.heartRate > 100) score -= 15;
      else if (vitals.heartRate < 65 || vitals.heartRate > 95) score -= 5;
    }
    
    // Blood pressure check (normal systolic: 90-140)
    if (vitals.bloodPressureSystolic) {
      if (vitals.bloodPressureSystolic < 90 || vitals.bloodPressureSystolic > 140) score -= 15;
      else if (vitals.bloodPressureSystolic < 95 || vitals.bloodPressureSystolic > 135) score -= 5;
    }
    
    // Temperature check (normal: 97-99°F)
    if (vitals.temperature) {
      if (vitals.temperature < 97 || vitals.temperature > 99) score -= 10;
    }
    
    // Oxygen saturation check (normal: 95-100%)
    if (vitals.oxygenSaturation) {
      if (vitals.oxygenSaturation < 95) score -= 20;
      else if (vitals.oxygenSaturation < 97) score -= 10;
    }
    
    return Math.max(score, 0);
  };

  // Get status color for vital signs
  const getVitalStatus = (value, minNormal, maxNormal) => {
    if (!value) return 'text-gray-400';
    if (value < minNormal || value > maxNormal) return 'text-red-600';
    if (value < minNormal + 5 || value > maxNormal - 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Get health score color
  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <Loading text="Loading your dashboard..." />;
  }

  if (!profile) {
    return (
      <RoleLayout title="My Health Dashboard" menuItems={menuItems}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">Unable to load your profile information.</p>
            <button 
              onClick={loadDashboardData}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </RoleLayout>
    );
  }

  const menuItems = [
    { icon: Activity, label: 'Dashboard', path: '/elder/dashboard' },
    { icon: Heart, label: 'Health Monitoring', path: '/elder/health-monitoring' },
    { icon: FileText, label: 'Health Reports', path: '/elder/health-reports' },
    { icon: Calendar, label: 'Appointments', path: '/elder/appointments' },
    { icon: Pill, label: 'Medications', path: '/elder/medications' },
    { icon: Bell, label: 'Notifications', path: '/elder/notifications' },
    { icon: User, label: 'Profile', path: '/elder/profile' },
    { icon: Phone, label: 'Emergency', path: '/elder/emergency' }
  ];

  return (
    <RoleLayout title="My Health Dashboard" menuItems={menuItems}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        
        {/* Modern Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/40 shadow-xl">
                  {profile.photo ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/elders/${profile.photo}`}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome back, {profile.firstName}!
                  </h1>
                  <p className="text-white/90 text-lg">
                    Here's your health overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/elder/emergency')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  SOS
                </button>
                <button
                  onClick={() => navigate('/elder/health-monitoring')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition border border-white/30"
                >
                  <Activity className="w-5 h-5" />
                  Log Vitals
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Health Score */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className={`text-3xl font-bold ${getHealthScoreColor(stats.healthScore)}`}>
                {stats.healthScore}%
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Health Score</p>
            <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${stats.healthScore >= 90 ? 'bg-green-500' : stats.healthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${stats.healthScore}%` }}
              ></div>
            </div>
          </div>

          {/* Next Appointment */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Next Appointment</p>
            <p className="text-xl font-bold text-gray-900">{stats.nextAppointment}</p>
          </div>

          {/* Medications */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.medicationCount}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Active Medications</p>
          </div>

          {/* Care Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Care Plan</p>
            <p className="text-xl font-bold text-gray-900 capitalize">{stats.carePlan}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Current Vitals */}
            {Object.keys(healthMetrics).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Activity className="w-7 h-7 text-blue-600" />
                    Current Vitals
                  </h2>
                  <button
                    onClick={() => navigate('/elder/health-monitoring')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    View History
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Heart Rate */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-100 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="w-6 h-6 text-red-600" />
                      <span className="text-sm text-gray-700 font-semibold">Heart Rate</span>
                    </div>
                    <p className={`text-3xl font-bold ${getVitalStatus(healthMetrics.heartRate, 60, 100)}`}>
                      {healthMetrics.heartRate || '--'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">bpm</p>
                  </div>

                  {/* Blood Pressure */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-gray-700 font-semibold">Blood Pressure</span>
                    </div>
                    <p className={`text-2xl font-bold ${getVitalStatus(healthMetrics.bloodPressureSystolic, 90, 140)}`}>
                      {healthMetrics.bloodPressureSystolic || '--'}/{healthMetrics.bloodPressureDiastolic || '--'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">mmHg</p>
                  </div>

                  {/* Temperature */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-100 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-3">
                      <Thermometer className="w-6 h-6 text-orange-600" />
                      <span className="text-sm text-gray-700 font-semibold">Temperature</span>
                    </div>
                    <p className={`text-3xl font-bold ${getVitalStatus(healthMetrics.temperature, 97, 99)}`}>
                      {healthMetrics.temperature || '--'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">°F</p>
                  </div>

                  {/* Oxygen Saturation */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-3">
                      <Wind className="w-6 h-6 text-cyan-600" />
                      <span className="text-sm text-gray-700 font-semibold">Oxygen</span>
                    </div>
                    <p className={`text-3xl font-bold ${getVitalStatus(healthMetrics.oxygenSaturation, 95, 100)}`}>
                      {healthMetrics.oxygenSaturation || '--'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">%</p>
                  </div>

                  {/* Weight */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="w-6 h-6 text-purple-600" />
                      <span className="text-sm text-gray-700 font-semibold">Weight</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {healthMetrics.weight || '--'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">lbs</p>
                  </div>

                  {/* Sleep */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 hover:shadow-lg transition">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-6 h-6 text-indigo-600" />
                      <span className="text-sm text-gray-700 font-semibold">Sleep</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {healthMetrics.sleepHours || '--'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">hours</p>
                  </div>
                </div>

                {healthMetrics.notes && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-900">Note:</span> {healthMetrics.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Health History */}
            {recentHealthData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-blue-600" />
                  Recent Health History
                </h2>
                <div className="space-y-4">
                  {recentHealthData.slice(0, 5).map((record, index) => (
                    <div
                      key={record.id || index}
                      className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-lg shadow-sm">
                          {new Date(record.monitoringDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          record.alertLevel === 'critical' ? 'bg-red-100 text-red-700' :
                          record.alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {record.alertLevel === 'critical' ? '🚨 Critical' :
                           record.alertLevel === 'warning' ? '⚠️ Warning' :
                           '✅ Normal'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="text-xs text-gray-600">Heart Rate</p>
                            <p className={`font-bold ${getVitalStatus(record.heartRate, 60, 100)}`}>
                              {record.heartRate} bpm
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-600">BP</p>
                            <p className={`font-bold ${getVitalStatus(record.bloodPressureSystolic, 90, 140)}`}>
                              {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="w-5 h-5 text-cyan-500" />
                          <div>
                            <p className="text-xs text-gray-600">O₂</p>
                            <p className={`font-bold ${getVitalStatus(record.oxygenSaturation, 95, 100)}`}>
                              {record.oxygenSaturation}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-xs text-gray-600">Temp</p>
                            <p className={`font-bold ${getVitalStatus(record.temperature, 97, 99)}`}>
                              {record.temperature}°F
                            </p>
                          </div>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-700">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/elder/health-monitoring')}
                  className="mt-6 w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  View Full History
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-blue-600" />
                  Upcoming Appointments
                </h2>
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-lg">
                            <span className="text-2xl">{new Date(apt.appointmentDate).getDate()}</span>
                            <span className="text-xs uppercase">
                              {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">Dr. {apt.doctorName || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-600 font-semibold">
                              {new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            apt.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{apt.consultationType || 'General Consultation'}</p>
                        </div>
                        {apt.zoomJoinUrl && (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition shadow-md">
                            <Video className="w-4 h-4" />
                            Join Video Call
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/elder/appointments')}
                  className="mt-6 w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  View All Appointments
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Phone className="w-6 h-6" />
                Emergency Contact
              </h2>
              <button
                onClick={() => window.location.href = 'tel:911'}
                className="w-full bg-white text-red-600 py-3 rounded-xl font-bold text-lg mb-4 hover:bg-red-50 transition shadow-lg flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                Call 911
              </button>
              {profile.emergencyContact && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-sm text-white/90 mb-2">Family Contact:</p>
                  <p className="font-bold text-lg">{profile.emergencyContact}</p>
                  {profile.emergencyPhone && (
                    <a 
                      href={`tel:${profile.emergencyPhone}`}
                      className="mt-2 inline-block bg-white/30 hover:bg-white/40 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      {profile.emergencyPhone}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Personal Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-bold text-gray-900">{profile.age || 'N/A'} years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-bold text-gray-900 capitalize">{profile.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-bold text-gray-900">{profile.phoneNumber || 'N/A'}</span>
                </div>
                {profile.address && (
                  <div className="flex items-start gap-2 py-2">
                    <MapPin className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{profile.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            {(profile.bloodType || profile.allergies || profile.medicalConditions || profile.currentMedications) && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Medical Information
                </h2>
                <div className="space-y-4">
                  {profile.bloodType && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Blood Type:</p>
                      <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-lg">
                        {profile.bloodType}
                      </span>
                    </div>
                  )}
                  {profile.allergies && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Allergies:</p>
                      <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {profile.allergies}
                      </p>
                    </div>
                  )}
                  {profile.medicalConditions && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Medical Conditions:</p>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {profile.medicalConditions}
                      </p>
                    </div>
                  )}
                  {profile.currentMedications && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Current Medications:</p>
                      <p className="text-gray-900 bg-purple-50 p-3 rounded-lg border border-purple-200">
                        {profile.currentMedications}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Doctor */}
            {profile.doctorName && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                  Assigned Doctor
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {profile.doctorName?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{profile.doctorName}</p>
                    <p className="text-sm text-gray-600">{profile.doctorPhone || 'Contact not available'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default ElderDashboard;