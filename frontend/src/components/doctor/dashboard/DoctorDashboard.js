// src/components/doctor/dashboard/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import toast from 'react-hot-toast';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Clock,
  AlertCircle,
  CheckCircle,
  Heart,
  TrendingUp,
  Activity,
  DollarSign,
  CalendarDays,
  Bell,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import doctorDashboardService from '../../../services/doctorDashboard';

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data
      const [statsRes, scheduleRes, activityRes, alertsRes, upcomingRes] = await Promise.all([
        doctorDashboardService.getDashboardStats(),
        doctorDashboardService.getTodaySchedule(),
        doctorDashboardService.getRecentActivity(5),
        doctorDashboardService.getHealthAlerts('critical', 5),
        doctorDashboardService.getUpcomingAppointments(7, 5)
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      if (scheduleRes.success) {
        setTodaySchedule(scheduleRes.schedule);
      }

      if (activityRes.success) {
        setRecentActivity(activityRes.activity);
      }

      if (alertsRes.success) {
        setHealthAlerts(alertsRes.alerts);
      }

      if (upcomingRes.success) {
        setUpcomingAppointments(upcomingRes.appointments);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading doctor dashboard..." />;
  }

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[severity] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-teal-100 text-teal-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth(currentDate);

  return (
    <RoleLayout title="Doctor Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, Dr. {user?.firstName}!
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                {stats ? (
                  <>
                    You have <span className="font-semibold">{stats.todayAppointments}</span> appointments today. 
                    {stats.completedToday > 0 && ` You've completed ${stats.completedToday} so far!`}
                  </>
                ) : 'Loading your schedule...'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-white/80">
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalPatients || 0}</p>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              Active
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Today's Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.todayAppointments || 0}</p>
            <p className="text-xs text-blue-600">{stats?.completedToday || 0} completed</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.pendingAppointments || 0}</p>
            <p className="text-xs text-orange-600">Awaiting confirmation</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Completed Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.completedToday || 0}</p>
            <p className="text-xs text-green-600">
              {stats?.completionRate || 0}% completion rate
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Health Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.activeHealthAlerts || 0}</p>
            <p className="text-xs text-red-600">
              {stats?.criticalHealthAlerts || 0} critical
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Monthly Consults</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.monthlyConsultations || 0}</p>
            <p className="text-xs text-blue-600">
              Avg {stats?.averageConsultationsPerDay || 0}/day
            </p>
          </div>
        </div>

        {/* Quick Actions - Removed Video Call */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/doctor/patients')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all text-left group border border-gray-100 hover:border-blue-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">View Patients</h3>
            <p className="text-gray-600 text-sm">Access patient records and history</p>
          </button>

          <button 
            onClick={() => navigate('/doctor/appointments')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all text-left group border border-gray-100 hover:border-green-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Appointments</h3>
            <p className="text-gray-600 text-sm">View and manage your schedule</p>
          </button>

          <button 
            onClick={() => navigate('/doctor/prescriptions')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all text-left group border border-gray-100 hover:border-purple-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Prescriptions</h3>
            <p className="text-gray-600 text-sm">Create and review prescriptions</p>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar - Compact Modern Design */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                  {day.charAt(0)}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                    ${!date ? 'invisible' : ''}
                    ${isToday(date) ? 'bg-blue-600 text-white font-bold hover:bg-blue-700' : ''}
                    ${isSelected(date) && !isToday(date) ? 'bg-blue-100 text-blue-900 font-semibold' : ''}
                    ${!isToday(date) && !isSelected(date) ? 'hover:bg-gray-100 text-gray-700' : ''}
                  `}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <button 
                onClick={() => navigate('/doctor/appointments')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {todaySchedule.length > 0 ? (
                todaySchedule.map(appointment => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {appointment.patient?.photo ? (
                          <img 
                            src={appointment.patient.photo} 
                            alt={appointment.patient.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {appointment.patient?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-gray-600">{appointment.reason || appointment.type}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatTime(appointment.time)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid: Health Alerts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Alerts */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                Critical Health Alerts
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                {healthAlerts.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {healthAlerts.length > 0 ? (
                healthAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm">
                        {alert.patient?.name || 'Unknown Patient'}
                      </p>
                      <span className="text-xs font-medium uppercase">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    {alert.triggerValue && (
                      <div className="flex items-center text-xs space-x-4">
                        <span>Value: <strong>{alert.triggerValue}</strong></span>
                        {alert.normalRange && <span>Normal: {alert.normalRange}</span>}
                      </div>
                    )}
                    {alert.patient?.phone && (
                      <div className="flex items-center mt-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3 mr-1" />
                        {alert.patient.phone}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p className="text-sm">No critical alerts at this time</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <div 
                    key={activity.id} 
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.priority === 'high' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {activity.patient?.name || 'Unknown Patient'}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {getTimeAgo(activity.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {activity.diagnosis || activity.treatment || 'Consultation completed'}
                      </p>
                      {activity.followUpDate && (
                        <div className="flex items-center mt-1 text-xs text-blue-600">
                          <Calendar className="w-3 h-3 mr-1" />
                          Follow-up: {new Date(activity.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Heart className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments (Next 7 Days)</h3>
            <button 
              onClick={() => navigate('/doctor/appointments')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(apt => (
                <div 
                  key={apt.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {apt.patient?.photo ? (
                        <img 
                          src={apt.patient.photo} 
                          alt={apt.patient.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {apt.patient?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">{apt.reason || apt.type}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(apt.time)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No upcoming appointments in the next 7 days</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default DoctorDashboard;
