// src/components/staff/dashboard/StaffDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { 
  Heart, 
  Users, 
  Clock, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Monitor,
  Clipboard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  ArrowRight,
  Thermometer,
  Droplet,
  Wind,
  MessageSquare,
  Scale,
  Moon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedElders: 0,
    todayTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    healthAlerts: 0,
    criticalAlerts: 0,
    averageRating: 0,
    completionRate: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [todaysVitals, setTodaysVitals] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [animateCards, setAnimateCards] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    // Trigger animation after component mounts
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  useEffect(() => {
    // Update clock every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load assigned elders
      const eldersResponse = await api.get('/elders/staff/assigned');
      const assignedElders = eldersResponse.data?.elders || eldersResponse.data?.data || eldersResponse.data || [];
      console.log('📊 Assigned Elders Response:', eldersResponse.data);
      console.log('📊 Assigned Elders Count:', assignedElders.length);
      
      // Load health alerts (deduplicated)
      const alertsResponse = await api.get('/health-alerts/staff');
      const allAlerts = alertsResponse.data?.data || alertsResponse.data || [];
      
      // Deduplicate alerts by healthMonitoringId (same as AlertsManagement)
      const uniqueAlerts = Object.values(
        allAlerts.reduce((acc, alert) => {
          const key = alert.healthMonitoringId || alert.id;
          
          // Keep only the most recent alert per health record
          if (!acc[key] || new Date(alert.createdAt) > new Date(acc[key].createdAt)) {
            acc[key] = alert;
          }
          // If same time, prioritize higher severity
          else if (new Date(alert.createdAt).getTime() === new Date(acc[key].createdAt).getTime()) {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            if (severityOrder[alert.severity] > severityOrder[acc[key].severity]) {
              acc[key] = alert;
            }
          }
          
          return acc;
        }, {})
      );
      
      // Sort by date and count by severity
      uniqueAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const criticalCount = uniqueAlerts.filter(a => 
        a.severity === 'critical' || a.severity === 'high'
      ).length;
      
      console.log('📊 Total Alerts (before dedup):', allAlerts.length);
      console.log('📊 Unique Alerts (after dedup):', uniqueAlerts.length);
      console.log('📊 Critical/High Alerts:', criticalCount);
      
      // Load health monitoring records - SAME AS HEALTH MONITORING PAGE
      const vitalsResponse = await api.get('/health-monitoring');
      const allRecords = vitalsResponse.data?.data || vitalsResponse.data?.healthMonitoring || [];
      
      // Filter today's records by monitoringDate (same logic as Health Monitoring page)
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const todaysVitalsRecords = allRecords.filter(record => {
        const recordDate = new Date(record.monitoringDate);
        return recordDate >= todayStart && recordDate < todayEnd;
      });
      
      // Sort by monitoring date (newest first) and show first 4
      const displayVitals = todaysVitalsRecords
        .sort((a, b) => new Date(b.monitoringDate) - new Date(a.monitoringDate))
        .slice(0, 4);
      
      console.log('📊 Total Today Vitals:', todaysVitalsRecords.length);
      console.log('📊 Displaying:', displayVitals.length);
      
      // Calculate real task statistics from today's vitals
      const totalTasks = todaysVitalsRecords.length;
      const completedTasks = todaysVitalsRecords.filter(v => v.notes && v.notes.length > 0).length;
      const pendingTasks = Math.max(0, assignedElders.length - totalTasks);
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({
        assignedElders: assignedElders.length,
        todayTasks: totalTasks,
        completedTasks: completedTasks,
        pendingTasks: pendingTasks,
        healthAlerts: uniqueAlerts.length, // Use deduplicated count
        criticalAlerts: criticalCount,
        averageRating: 0,
        completionRate
      });
      
      setRecentAlerts(uniqueAlerts.slice(0, 4));
      setTodaysVitals(displayVitals); // Show only today's records from Health Monitoring
      
      // Don't show fake upcoming tasks
      setUpcomingTasks([]);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getAlertColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <Loading text="Loading staff dashboard..." />;
  }

  return (
    <RoleLayout title="Care Staff Dashboard">
      <div className="space-y-6">
        {/* Welcome Section with Gradient */}
        <div className="relative bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 rounded-2xl p-8 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center">
                  {getGreeting()}, {user?.firstName}! 
                  <span className="ml-3 text-3xl">👋</span>
                </h1>
                <p className="text-white/90 text-lg">
                  {stats.assignedElders > 0 ? (
                    <>You are caring for <span className="font-bold">{stats.assignedElders}</span> elder{stats.assignedElders !== 1 ? 's' : ''}</>
                  ) : (
                    <>No elders assigned yet</>
                  )}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <Clock className="w-16 h-16 text-white/90 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-white/80 text-sm">
                  {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                icon: Heart, 
                title: 'Care Management', 
                desc: 'Manage daily care activities', 
                color: 'teal',
                path: '/staff/care'
              },
              { 
                icon: Monitor, 
                title: 'Health Monitoring', 
                desc: 'Check vital signs', 
                color: 'blue',
                path: '/staff/monitoring'
              },
              { 
                icon: AlertTriangle, 
                title: 'Alert Management', 
                desc: 'Review alerts', 
                color: 'red',
                path: '/staff/alerts',
                badge: stats.healthAlerts
              },
              { 
                icon: Activity, 
                title: 'Activity Reports', 
                desc: 'Generate reports', 
                color: 'green',
                path: '/staff/reports'
              }
            ].map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
                blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              };
              
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left group overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[action.color]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {action.badge > 0 && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold animate-pulse">
                          {action.badge}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{action.desc}</p>
                    <div className="flex items-center text-sm font-semibold text-gray-700 group-hover:text-teal-600">
                      Open <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout for Alerts and Vitals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Health Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Bell className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900">Recent Alerts</h2>
              </div>
              <button 
                onClick={() => navigate('/staff/alerts')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent alerts</p>
                <p className="text-sm text-gray-400 mt-2">All elders are doing well!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <div 
                    key={alert.id || index}
                    className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)} hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => navigate('/staff/alerts')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-semibold text-sm">{alert.severity?.toUpperCase()}</span>
                        </div>
                        <p className="text-gray-900 font-medium">{alert.message || alert.alertType || 'Health alert'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.Elder?.name && <span className="font-medium">{alert.Elder.name} • </span>}
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {alert.status === 'active' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Vital Signs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">Today's Vitals</h2>
              </div>
              <button 
                onClick={() => navigate('/staff/monitoring')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            {todaysVitals.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No vitals recorded today</p>
                <button 
                  onClick={() => navigate('/staff/monitoring')}
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Add Vital Signs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysVitals.slice(0, 4).map((vital, index) => (
                  <div 
                    key={vital.id || index}
                    className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/staff/monitoring')}
                  >
                    {/* Elder Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">
                          {vital.elder?.firstName} {vital.elder?.lastName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(vital.monitoringDate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Health Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vital.heartRate && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                          <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-bold text-gray-900">{vital.heartRate}</div>
                            <div className="text-gray-500">bpm</div>
                          </div>
                        </div>
                      )}
                      
                      {vital.bloodPressureSystolic && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                          <Activity className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-bold text-gray-900">
                              {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic || 0}
                            </div>
                            <div className="text-gray-500">mmHg</div>
                          </div>
                        </div>
                      )}
                      
                      {vital.temperature && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                          <Thermometer className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-bold text-gray-900">{vital.temperature}</div>
                            <div className="text-gray-500">°F</div>
                          </div>
                        </div>
                      )}
                      
                      {vital.weight && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                          <Scale className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-bold text-gray-900">{vital.weight}</div>
                            <div className="text-gray-500">lbs</div>
                          </div>
                        </div>
                      )}
                      
                      {vital.sleepHours && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                          <Moon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-bold text-gray-900">{vital.sleepHours}</div>
                            <div className="text-gray-500">hours</div>
                          </div>
                        </div>
                      )}
                      
                      {vital.oxygenSaturation && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                          <Wind className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="font-bold text-gray-900">{vital.oxygenSaturation}</div>
                            <div className="text-gray-500">%</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes if available */}
                    {vital.notes && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">Notes:</span> {vital.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Only show Upcoming Tasks section if there are actual tasks */}
        {upcomingTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">Upcoming Tasks</h2>
              </div>
              <button 
                onClick={() => navigate('/staff/care')}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center"
              >
                View Schedule <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-lg border ${task.urgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => navigate('/staff/care')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${task.urgent ? 'bg-red-100' : 'bg-blue-100'} flex items-center justify-center`}>
                        <Clock className={`w-6 h-6 ${task.urgent ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{task.task}</h3>
                        <p className="text-sm text-gray-600">{task.elder}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${task.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                        {task.time}
                      </div>
                      {task.urgent && (
                        <div className="text-xs text-red-600 font-semibold mt-1">URGENT</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default StaffDashboard;
