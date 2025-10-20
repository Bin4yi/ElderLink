// frontend/src/components/Elder/sessions/ElderMonthlySessions.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Video, 
  Star,
  Activity,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import RoleLayout from '../../common/RoleLayout';
import monthlySessionService from '../../../services/monthlySession';
import toast from 'react-hot-toast';

const ElderMonthlySessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading elder monthly sessions...');
      
      const response = await monthlySessionService.getElderMonthlySessions();
      console.log('📋 Sessions response:', response);

      if (response.success && response.data) {
        const sessionsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.sessions || []);
        
        // Transform sessions data
        const transformedSessions = sessionsData.map(session => {
          const doctorUser = session.doctor?.user || session.doctor;
          
          return {
            id: session.id,
            title: `Monthly Health Check-up - ${new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            date: session.sessionDate,
            time: session.sessionTime,
            duration: session.duration || 45,
            status: session.status,
            zoomJoinUrl: session.zoomJoinUrl || null,
            zoomMeetingId: session.zoomMeetingId || null,
            zoomPassword: session.zoomPassword || null,
            doctor: doctorUser ? {
              id: doctorUser.id,
              name: `${doctorUser.firstName} ${doctorUser.lastName}`,
              specialization: session.doctor?.specialization || "General Medicine & Family Care",
              experience: session.doctor?.experience ? `${session.doctor.experience} years` : "15 years",
              rating: session.doctor?.rating || 4.8,
              phone: doctorUser.phone || "N/A",
              email: doctorUser.email,
              avatar: doctorUser.photo || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
            } : null,
            notes: session.notes || '',
            sessionSummary: session.sessionSummary || '',
          };
        });

        setSessions(transformedSessions);
        console.log('✅ Sessions loaded:', transformedSessions.length);
      } else {
        console.warn('⚠️ No sessions found');
        setSessions([]);
      }
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
      toast.error('Failed to load monthly sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      switch (filterStatus) {
        case 'upcoming':
          return session.status === 'scheduled' && sessionDate >= today;
        case 'today':
          return sessionDate.getTime() === today.getTime();
        case 'completed':
          return session.status === 'completed';
        case 'past':
          return sessionDate < today;
        case 'all':
          // Show only today and future sessions when "all" is selected
          return sessionDate >= today;
        default:
          // Default: Show only today and future sessions
          return sessionDate >= today;
      }
    });
  };

  const renderSessionCard = (session) => (
    <div
      key={session.id}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
            <p className="text-sm text-gray-600">Health monitoring session</p>
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

      {session.doctor && (
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
        </div>
      )}

      {/* Join Zoom Button */}
      {session.zoomJoinUrl ? (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Video Consultation Ready</span>
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active
            </span>
          </div>
          <a
            href={session.zoomJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
          >
            <Video className="w-5 h-5" />
            <span className="text-base">Join Health Session</span>
          </a>
          {session.zoomPassword && (
            <div className="mt-2 text-xs text-gray-600 bg-white px-3 py-1.5 rounded border border-green-200">
              <span className="font-medium">Meeting Password:</span> 
              <span className="ml-2 font-mono bg-gray-100 px-2 py-0.5 rounded">{session.zoomPassword}</span>
            </div>
          )}
        </div>
      ) : session.status === 'scheduled' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="flex items-center gap-2 text-gray-500">
            <Video className="w-4 h-4" />
            <span className="text-sm">Waiting for doctor to create video link...</span>
          </div>
        </div>
      )}

      {session.notes && (
        <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
          <p className="font-medium mb-1">Notes:</p>
          <p>{session.notes}</p>
        </div>
      )}

      {session.sessionSummary && (
        <div className="mt-3 text-sm text-gray-600 bg-green-50 rounded-lg p-3">
          <p className="font-medium mb-1">Session Summary:</p>
          <p>{session.sessionSummary}</p>
        </div>
      )}
    </div>
  );

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-gray-50 rounded-lg"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date === dateString);

      days.push(
        <div
          key={day}
          className={`h-20 p-2 rounded-lg border ${
            daySessions.length > 0 
              ? 'bg-green-50 border-green-200 hover:bg-green-100' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          } cursor-pointer transition-colors`}
        >
          <div className="text-sm font-medium text-gray-700">{day}</div>
          {daySessions.length > 0 && (
            <>
              {daySessions.map(session => (
                <div
                  key={session.id}
                  className="text-xs px-2 py-1 rounded bg-green-200 text-green-800 mb-1 font-medium truncate"
                  title={`${session.title} - ${session.time}`}
                >
                  {session.time}
                </div>
              ))}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RoleLayout>
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your monthly sessions...</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout>
      <div className="p-6 max-w-[95%] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Health Sessions</h1>
              <p className="text-gray-600">
                View your monthly health check-ups and consultations
              </p>
            </div>
            <button
              onClick={loadSessions}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Sessions</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'today', 'upcoming', 'completed', 'past'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
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
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Sessions
              </h2>
              <p className="text-gray-600">{getFilteredSessions().length} session(s) found</p>
            </div>

            <div className="space-y-6">
              {getFilteredSessions().length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No sessions found
                  </h3>
                  <p className="text-gray-600">
                    Your monthly health sessions will appear here
                  </p>
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
      </div>
    </RoleLayout>
  );
};

export default ElderMonthlySessions;
