import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, AlertCircle, Truck, BarChart3, Clock, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleLayout from '../common/RoleLayout';
import { coordinatorService } from '../../services/ambulance';
import socketService from '../../services/socket';
import EmergencyQueue from './EmergencyQueue';
import AmbulanceManagement from './AmbulanceManagement';
import DriverManagement from './DriverManagement';
import AmbulanceTracker from './AmbulanceTracker';
import ResponseTimeAnalytics from './ResponseTimeAnalytics';

const CoordinatorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(true);
  
  // Get tab from URL query params, default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    loadDashboardData();
    setupSocketListeners();
    
    // Request notification permission on load
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await coordinatorService.getDashboardOverview();
      setOverview(data.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    const socket = socketService.connect();
    socketService.joinCoordinatorRoom();

    // Create audio element for emergency alert sound
    const playEmergencySound = () => {
      if (!alertSoundEnabled) {
        console.log('🔇 Emergency sound muted by user');
        return;
      }
      
      try {
        // Create audio context for emergency siren sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play multiple beeps with increasing urgency (siren-like)
        const beepCount = 5;
        const beepDuration = 0.2;
        const beepGap = 0.15;
        
        for (let i = 0; i < beepCount; i++) {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Emergency frequency (high pitch alert) - alternating high/low like siren
          oscillator.frequency.value = i % 2 === 0 ? 800 : 600;
          oscillator.type = 'sine';
          
          // Volume envelope
          const startTime = audioContext.currentTime + (i * (beepDuration + beepGap));
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + beepDuration);
        }
        
        console.log('🔊 Emergency alert sound played');
      } catch (error) {
        console.error('Failed to play emergency sound:', error);
      }
    };

    // Listen for emergency alerts
    socketService.onEmergencyAlert((data) => {
      console.log('🚨 New emergency alert:', data);
      
      // Play emergency sound immediately
      playEmergencySound();
      
      // Vibrate if supported (for tablets/mobile coordinators)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
      }
      
      // Show toast notification with sound
      toast.error(`🚨 NEW EMERGENCY ALERT! 
Priority: ${data.priority || 'HIGH'} 
Elder: ${data.elderName || 'Unknown'}
Location: ${data.location?.address?.city || 'Unknown location'}`, {
        duration: 10000, // 10 seconds
        icon: '🚨',
        style: {
          background: '#DC2626',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '3px solid #991B1B',
        },
      });
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        const notification = new Notification('🚨 EMERGENCY ALERT!', {
          body: `Priority: ${data.priority || 'HIGH'}\nElder: ${data.elderName}\nLocation: ${data.location?.address?.city || 'Unknown'}`,
          icon: '/ambulance-icon.png',
          badge: '/ambulance-icon.png',
          tag: 'emergency-alert',
          requireInteraction: true, // Notification stays until user interacts
          vibrate: [200, 100, 200, 100, 200], // Vibration pattern for mobile
        });
        
        // Play sound again when notification is shown
        notification.onshow = () => {
          playEmergencySound();
        };
        
        // Navigate to queue when notification is clicked
        notification.onclick = () => {
          window.focus();
          setActiveTab('queue');
          notification.close();
        };
      } else if (Notification.permission !== 'denied') {
        // Request permission if not denied
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('✅ Notification permission granted');
          }
        });
      }
      
      // Refresh dashboard data
      loadDashboardData();
      
      // Auto-switch to queue tab if on overview
      if (activeTab === 'overview') {
        setActiveTab('queue');
      }
    });

    // Listen for dispatch status updates
    socketService.onDispatchStatusUpdate((data) => {
      console.log('🔄 Dispatch status update:', data);
      
      // Show subtle notification for status updates
      toast.success(`Dispatch ${data.dispatchId} updated: ${data.status}`, {
        duration: 3000,
        icon: '🚑',
      });
      
      loadDashboardData();
    });
  };

  if (loading && !overview) {
    return (
      <RoleLayout title="Emergency Coordinator Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="🚑 Emergency Coordinator Dashboard">
      {/* Active Emergency Alert Banner */}
      {overview && overview.activeEmergencies > 0 && (
        <div className="mb-6 bg-red-600 border-4 border-red-800 rounded-lg p-4 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full animate-bounce">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">
                  🚨 ACTIVE EMERGENCIES: {overview.activeEmergencies}
                </h3>
                <p className="text-red-100 text-sm">
                  {overview.pendingEmergencies > 0 && `${overview.pendingEmergencies} pending dispatch | `}
                  {overview.enRouteAmbulances > 0 && `${overview.enRouteAmbulances} en route`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('queue')}
              className="px-6 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-lg"
            >
              VIEW EMERGENCY QUEUE →
            </button>
          </div>
        </div>
      )}

      {/* Sound Toggle and Settings Bar */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setAlertSoundEnabled(!alertSoundEnabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            alertSoundEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={alertSoundEnabled ? 'Click to mute alerts' : 'Click to enable alerts'}
        >
          {alertSoundEnabled ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Alert Sound ON</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Alert Sound OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'queue'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Emergency Queue
              {overview?.pendingEmergencies > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {overview.pendingEmergencies}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ambulances')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ambulances'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Manage Ambulances
            </div>
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'drivers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage Drivers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fleet'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Fleet Tracker
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </div>
          </button>
        </nav>
      </div>

      {/* Stats Overview - Show on overview tab */}
      {activeTab === 'overview' && overview && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Active Emergencies</p>
                <p className="text-3xl font-bold">{overview.activeEmergencies || 0}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-3xl font-bold">{overview.pendingEmergencies || 0}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Available Ambulances</p>
                <p className="text-3xl font-bold">{overview.availableAmbulances || 0}</p>
              </div>
              <Truck className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">En Route</p>
                <p className="text-3xl font-bold">{overview.enRouteAmbulances || 0}</p>
              </div>
              <MapPin className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Completed Today</p>
                <p className="text-3xl font-bold">{overview.completedToday || 0}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Avg Response Time</p>
                <p className="text-3xl font-bold">{overview.averageResponseTime || 0}s</p>
              </div>
              <Clock className="w-12 h-12 text-indigo-200" />
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('queue')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                <p className="font-semibold text-gray-900">View Emergency Queue</p>
                <p className="text-sm text-gray-600">Check pending emergencies</p>
              </button>
              <button
                onClick={() => setActiveTab('ambulances')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <Truck className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-semibold text-gray-900">Manage Ambulances</p>
                <p className="text-sm text-gray-600">Add, edit, or remove ambulances</p>
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <MapPin className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-semibold text-gray-900">Track Fleet</p>
                <p className="text-sm text-gray-600">Monitor real-time locations</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Emergency Queue</h3>
              <EmergencyQueue limit={5} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Response Time Trends</h3>
              <ResponseTimeAnalytics compact={true} />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'queue' && <EmergencyQueue />}
      {activeTab === 'ambulances' && <AmbulanceManagement />}
      {activeTab === 'drivers' && <DriverManagement />}
      {activeTab === 'fleet' && <AmbulanceTracker />}
      {activeTab === 'analytics' && <ResponseTimeAnalytics />}
    </RoleLayout>
  );
};

export default CoordinatorDashboard;
