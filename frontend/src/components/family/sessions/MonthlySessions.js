import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Video, 
  MapPin, 
  Star,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Activity,
  Heart,
  Brain,
  Shield,
  Award,
  CheckCircle,
  AlertCircle,
  Timer,
  Plus,
  RefreshCw
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import monthlySessionService from '../../../services/monthlySession';
import toast from 'react-hot-toast';

const MonthlySessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessionTimer, setSessionTimer] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  
  // Filter states
  const [filters, setFilters] = useState({
    month: '',
    doctor: '',
    status: '',
    elder: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching monthly sessions...');
      
      const response = await monthlySessionService.getMonthlySessions();
      console.log('📋 Monthly sessions response:', response);
      
      if (response.success && response.data) {
        const sessionsData = response.data.sessions || [];
        console.log('✅ Sessions loaded:', sessionsData.length);
        
        // Transform backend data to match the component's expected format
        const transformedSessions = sessionsData.map(session => {
          // Doctor data is nested: session.doctor.user contains the User info
          const doctorUser = session.doctor?.user || session.doctor;
          
          return {
            id: session.id,
            title: `Monthly Health Check-up - ${new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            date: session.sessionDate,
            time: session.sessionTime,
            duration: session.duration || 45,
            type: 'health',
            status: session.status,
            doctor: doctorUser ? {
              id: doctorUser.id,
              name: `${doctorUser.firstName} ${doctorUser.lastName}`,
              specialization: session.doctor?.specialization || "General Medicine & Family Care",
              experience: session.doctor?.experience ? `${session.doctor.experience} years` : "15 years",
              rating: session.doctor?.rating || 4.8,
              phone: doctorUser.phone || "N/A",
              email: doctorUser.email,
              avatar: doctorUser.photo || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
              licenseNumber: session.doctor?.licenseNumber || "N/A",
              hospital: session.doctor?.hospital || "ElderLink Medical Center",
              education: session.doctor?.education || "Medical School",
              availability: session.doctor?.availability || "Mon-Fri: 9:00 AM - 5:00 PM",
              bio: session.doctor?.bio || "Dedicated family physician with experience in geriatric care."
            } : null,
            elder: session.elder ? {
              name: `${session.elder.firstName} ${session.elder.lastName}`,
              age: session.elder.dateOfBirth ? Math.floor((new Date() - new Date(session.elder.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'
            } : { name: 'Unknown', age: 'N/A' },
            notes: session.notes || '',
            sessionSummary: session.sessionSummary || '',
            vitals: session.vitals || null
          };
        });
        
        setSessions(transformedSessions);
        
        if (transformedSessions.length === 0) {
          toast.info('No monthly sessions found. Create your first session!');
        }
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        setSessions([]);
        toast.info('No monthly sessions found.');
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      toast.error('Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Timer functionality
  useEffect(() => {
    const intervals = {};
    
    Object.keys(activeTimers).forEach(sessionId => {
      if (activeTimers[sessionId]) {
        intervals[sessionId] = setInterval(() => {
          setSessionTimer(prev => ({
            ...prev,
            [sessionId]: (prev[sessionId] || 0) + 1
          }));
        }, 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [activeTimers]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (sessionId) => {
    setActiveTimers(prev => ({ ...prev, [sessionId]: true }));
    toast.success('Session timer started');
  };

  const pauseTimer = (sessionId) => {
    setActiveTimers(prev => ({ ...prev, [sessionId]: false }));
    toast.info('Session timer paused');
  };

  const stopTimer = (sessionId) => {
    setActiveTimers(prev => ({ ...prev, [sessionId]: false }));
    setSessionTimer(prev => ({ ...prev, [sessionId]: 0 }));
    toast.success('Session timer stopped');
  };

  const getSessionIcon = (type) => {
    switch (type) {
      case 'health': return <Heart className="w-5 h-5" />;
      case 'mental': return <Brain className="w-5 h-5" />;
      case 'specialist': return <Shield className="w-5 h-5" />;
      case 'therapy': return <Activity className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    // All sessions are health type now, so return green
    return 'text-green-600 bg-green-100';
  };

  // Get unique values for filters
  const getUniqueMonths = () => {
    const months = new Set();
    sessions.forEach(session => {
      const date = new Date(session.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months).sort().reverse();
  };

  const getUniqueDoctors = () => {
    const doctors = new Map();
    sessions.forEach(session => {
      if (session.doctor) {
        doctors.set(session.doctor.id, session.doctor.name);
      }
    });
    return Array.from(doctors.entries());
  };

  const getUniqueElders = () => {
    const elders = new Set();
    sessions.forEach(session => {
      if (session.elder && session.elder.name !== 'Unknown') {
        elders.add(session.elder.name);
      }
    });
    return Array.from(elders).sort();
  };

  // Filter sessions based on selected filters
  const getFilteredSessions = () => {
    return sessions.filter(session => {
      // Month filter
      if (filters.month) {
        const sessionDate = new Date(session.date);
        const sessionMonth = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
        if (sessionMonth !== filters.month) return false;
      }

      // Doctor filter
      if (filters.doctor && session.doctor) {
        if (session.doctor.id !== filters.doctor) return false;
      }

      // Status filter
      if (filters.status && session.status !== filters.status) {
        return false;
      }

      // Elder filter
      if (filters.elder && session.elder) {
        if (session.elder.name !== filters.elder) return false;
      }

      return true;
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      month: '',
      doctor: '',
      status: '',
      elder: ''
    });
  };

  // Calendar functionality
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getSessionsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return sessions.filter(session => session.date === dateStr);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const renderSessionCard = (session) => (
    <div
      key={session.id}
      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500"
      onClick={() => setSelectedSession(session)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
            <p className="text-sm text-gray-600">{session.elder.name}, {session.elder.age} years</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{new Date(session.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{session.time} ({session.duration} min)</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <img
            src={session.doctor.avatar}
            alt={session.doctor.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{session.doctor.name}</p>
            <p className="text-sm text-gray-600">{session.doctor.specialization}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{session.doctor.rating}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDoctor(session.doctor);
          }}
          className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
        >
          View More
        </button>
      </div>

      {/* Timer Section */}
      {session.status === 'in-progress' && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Session Timer</span>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-600">
              {formatTime(sessionTimer[session.id] || 0)}
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            {!activeTimers[session.id] ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startTimer(session.id);
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  pauseTimer(session.id);
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopTimer(session.id);
              }}
              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}

      {session.notes && (
        <div className="text-sm text-gray-600 bg-green-50 rounded-lg p-3">
          <strong>Notes:</strong> {session.notes}
        </div>
      )}
    </div>
  );

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(dayName => (
            <div key={dayName} className="p-2 text-center text-sm font-medium text-gray-600">
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const sessionsForDay = getSessionsForDate(day);
            const hasSession = sessionsForDay.length > 0;
            return (
              <div
                key={index}
                className={`p-2 min-h-[80px] border border-gray-100 ${
                  day ? 'hover:bg-gray-50 cursor-pointer' : ''
                } ${hasSession ? 'bg-green-50 border-green-200' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${hasSession ? 'text-green-700' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    {sessionsForDay.map(session => (
                      <div
                        key={session.id}
                        className="text-xs px-2 py-1 rounded bg-green-200 text-green-800 mb-1 font-medium"
                        title={`${session.title} - ${session.time}`}
                      >
                        {session.time}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RoleLayout>
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading monthly sessions...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Sessions</h1>
              <p className="text-gray-600">
                Track and manage monthly health check-ups and therapy sessions for your elders
              </p>
            </div>
            <button
              onClick={() => navigate('/family/sessions/auto-schedule')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Schedule New Session
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Sessions
              </h3>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Month
                </label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Months</option>
                  {getUniqueMonths().map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return (
                      <option key={month} value={month}>{monthName}</option>
                    );
                  })}
                </select>
              </div>

              {/* Doctor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Doctor
                </label>
                <select
                  value={filters.doctor}
                  onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Doctors</option>
                  {getUniqueDoctors().map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Elder Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Elder
                </label>
                <select
                  value={filters.elder}
                  onChange={(e) => setFilters({ ...filters, elder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Elders</option>
                  {getUniqueElders().map(elder => (
                    <option key={elder} value={elder}>{elder}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.month || filters.doctor || filters.status || filters.elder) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  {filters.month && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(filters.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      <button onClick={() => setFilters({ ...filters, month: '' })} className="ml-1 hover:text-blue-900">✕</button>
                    </span>
                  )}
                  {filters.doctor && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <User className="w-3 h-3" />
                      {getUniqueDoctors().find(([id]) => id === filters.doctor)?.[1]}
                      <button onClick={() => setFilters({ ...filters, doctor: '' })} className="ml-1 hover:text-green-900">✕</button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                      <Activity className="w-3 h-3" />
                      {filters.status.replace('-', ' ')}
                      <button onClick={() => setFilters({ ...filters, status: '' })} className="ml-1 hover:text-purple-900">✕</button>
                    </span>
                  )}
                  {filters.elder && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                      <User className="w-3 h-3" />
                      {filters.elder}
                      <button onClick={() => setFilters({ ...filters, elder: '' })} className="ml-1 hover:text-amber-900">✕</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getFilteredSessions().filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getFilteredSessions().filter(s => s.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Family Doctor</p>
                <p className="text-lg font-bold text-gray-900">
                  {sessions.length > 0 && sessions[0].doctor 
                    ? sessions[0].doctor.name 
                    : 'Not Assigned'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next Session</p>
                <p className="text-sm font-bold text-gray-900">
                  {sessions.find(s => s.status === 'scheduled') 
                    ? new Date(sessions.find(s => s.status === 'scheduled').date).toLocaleDateString()
                    : 'None scheduled'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {(filters.month || filters.doctor || filters.status || filters.elder) ? 'Filtered' : 'Recent'} Sessions
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {getFilteredSessions().length} of {sessions.length} sessions
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={fetchSessions}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                
              </div>
            </div>

            <div className="space-y-6">
              {getFilteredSessions().length === 0 && sessions.length > 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Sessions Match Filters
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters to see more sessions.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reset Filters
                  </button>
                </div>
              ) : sessions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Monthly Sessions Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first monthly health check-up session to get started.
                  </p>
                  <button
                    onClick={() => navigate('/family/sessions/auto-schedule')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Monthly Session
                  </button>
                </div>
              ) : (
                getFilteredSessions().map(session => renderSessionCard(session))
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-1">
            {renderCalendar()}
          </div>
        </div>

        {/* Session Detail Modal */}
        {selectedSession && selectedSession.doctor && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedSession.title}
                    </h2>
                    <p className="text-gray-600">
                      {selectedSession.elder.name}, {selectedSession.elder.age} years old
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Doctor Biography */}
                <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                  <h3 className="text-lg font-semibold mb-3 text-green-800">About Dr. {selectedDoctor.name.split(' ')[1]}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedDoctor.bio}
                  </p>
                </div>

                {/* Professional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Professional Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">License Number:</span>
                        <span className="font-medium">{selectedDoctor.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hospital:</span>
                        <span className="font-medium">{selectedDoctor.hospital}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Education:</span>
                        <span className="font-medium">{selectedDoctor.education}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{selectedDoctor.experience}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Availability:</span>
                        <span className="font-medium text-green-600">{selectedDoctor.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{selectedDoctor.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{selectedDoctor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium">{selectedDoctor.hospital}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Sessions */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Sessions with {selectedDoctor.name}</h4>
                  <div className="space-y-3">
                    {sessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <h5 className="font-medium text-gray-900">{session.title}</h5>
                          <p className="text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString()} at {session.time}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Schedule Session
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default MonthlySessions;
