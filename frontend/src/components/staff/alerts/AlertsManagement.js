import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { healthAlertService } from '../../../services/healthAlerts';
import useHealthAlerts from '../../../hooks/useHealthAlerts';
import HealthAlertModal from '../../common/HealthAlertModal';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  Clock, 
  User, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { alerts: realtimeAlerts, connected } = useHealthAlerts(user.id);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (realtimeAlerts.length > 0) {
      const latestAlert = realtimeAlerts[0];
      setSelectedAlert(latestAlert);
      loadAlerts();
    }
  }, [realtimeAlerts]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await healthAlertService.getStaffAlerts();
      if (response.success) {
        const allAlerts = response.data || [];
        
        // Deduplicate alerts by grouping by healthMonitoringId
        // Keep only the most recent alert for each health monitoring record
        const uniqueAlerts = Object.values(
          allAlerts.reduce((acc, alert) => {
            const key = alert.healthMonitoringId || alert.id;
            
            // If this is a new key or the current alert is more recent
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
        
        // Sort by date (most recent first)
        uniqueAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAlerts(uniqueAlerts);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await healthAlertService.acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
      loadAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await healthAlertService.resolveAlert(alertId);
      toast.success('Alert resolved');
      loadAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleEmergencyContact = async (alertId) => {
    try {
      await healthAlertService.markEmergencyContacted(alertId);
      toast.success('Emergency services contacted');
      loadAlerts();
    } catch (error) {
      console.error('Failed to mark emergency contacted:', error);
      toast.error('Failed to update alert');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-red-200';
      case 'high': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400 shadow-orange-200';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-400 shadow-yellow-200';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'high': return <AlertCircle className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-50 text-red-700 border-red-200';
      case 'acknowledged': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <BellRing className="w-4 h-4" />;
      case 'acknowledged': return <Shield className="w-4 h-4" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  if (loading) {
    return (
      <RoleLayout title="Alert Management">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading alerts...</p>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Alert Management">
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header with Gradient */}
          <div className="relative bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 rounded-2xl shadow-2xl p-8 mb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    {connected ? (
                      <BellRing className="w-8 h-8 text-white animate-pulse" />
                    ) : (
                      <Bell className="w-8 h-8 text-white/70" />
                    )}
                  </div>
                  {alerts.filter(a => a.status === 'active').length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-pulse">
                      {alerts.filter(a => a.status === 'active').length}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Health Alerts</h1>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden lg:flex gap-6">
                {[
                  { label: 'Active', count: alerts.filter(a => a.status === 'active').length, color: 'red' },
                  { label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length, color: 'orange' }
                ].map((stat) => (
                  <div key={stat.label} className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                    <div className="text-3xl font-bold text-white">{stat.count}</div>
                    <div className="text-white/80 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">Filter Alerts</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Status Filter</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 hover:bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">🔴 Active</option>
                  <option value="acknowledged">🟡 Acknowledged</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Severity Filter</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 hover:bg-white"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">🚨 Critical</option>
                  <option value="high">⚠️ High</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="low">ℹ️ Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterSeverity('all');
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Alerts Found</h3>
                <p className="text-gray-600 text-lg">
                  {alerts.length === 0 
                    ? 'No health alerts at this time. All elders are in stable condition! 🎉'
                    : 'No alerts match your selected filters. Try adjusting the filter criteria.'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-l-4 cursor-pointer"
                  style={{
                    borderLeftColor: 
                      alert.severity === 'critical' ? '#dc2626' :
                      alert.severity === 'high' ? '#ea580c' :
                      alert.severity === 'medium' ? '#ca8a04' : '#2563eb'
                  }}
                  onClick={() => setSelectedAlert({
                    ...alert,
                    elderName: alert.elder ? `${alert.elder.firstName} ${alert.elder.lastName}` : 'Unknown',
                    timestamp: alert.createdAt
                  })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Elder Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                          {alert.elder?.photo ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/uploads/elders/${alert.elder.photo}`}
                              alt={`${alert.elder.firstName} ${alert.elder.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        {alert.severity === 'critical' && alert.status === 'active' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full"></div>
                        )}
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {alert.elder ? `${alert.elder.firstName} ${alert.elder.lastName}` : 'Unknown Elder'}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(alert.createdAt).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-800 font-medium text-lg mb-2">{alert.message}</p>
                        <p className="text-sm text-gray-600 mb-4">
                          Alert Type: <span className="font-semibold">{alert.alertType.replace(/_/g, ' ').toUpperCase()}</span>
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-md ${getSeverityColor(alert.severity)}`}>
                            {getSeverityIcon(alert.severity)}
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(alert.status)}`}>
                            {getStatusIcon(alert.status)}
                            {alert.status.toUpperCase()}
                          </span>
                          {alert.emergencyContacted && (
                            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Shield className="w-4 h-4" />
                              Emergency Contacted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Indicator */}
                    <div className="flex-shrink-0">
                      {alert.severity === 'critical' && alert.status === 'active' && (
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <BellRing className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
        {selectedAlert && (
          <HealthAlertModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            onEmergencyContact={handleEmergencyContact}
          />
        )}
      </>
    </RoleLayout>
  );
};




export default AlertsManagement;
