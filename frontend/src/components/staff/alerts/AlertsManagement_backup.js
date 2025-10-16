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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {connected ? (
                    <BellRing className="w-8 h-8 text-blue-600 animate-pulse" />
                  ) : (
                    <Bell className="w-8 h-8 text-gray-400" />
                  )}
                  {alerts.filter(a => a.status === 'active').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {alerts.filter(a => a.status === 'active').length}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Health Alerts</h1>
                  <p className="text-gray-600 mt-1">
                    {connected ? 'ðŸŸ¢ Real-time monitoring active' : 'ðŸ”´ Connecting...'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Alerts Found</h3>
                <p className="text-gray-500">
                  {alerts.length === 0 
                    ? 'No health alerts at this time. All elders are stable.'
                    : 'No alerts match the selected filters.'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedAlert({
                    ...alert,
                    elderName: alert.elder ? `${alert.elder.firstName} ${alert.elder.lastName}` : 'Unknown',
                    timestamp: alert.createdAt
                  })}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {alert.elder?.photo ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/uploads/elders/${alert.elder.photo}`}
                              alt={`${alert.elder.firstName} ${alert.elder.lastName}`}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {alert.elder ? `${alert.elder.firstName} ${alert.elder.lastName}` : 'Unknown Elder'}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-gray-800 font-medium">{alert.message}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {alert.alertType.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </span>
                        {alert.emergencyContacted && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            Emergency Contacted
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {alert.severity === 'critical' && alert.status === 'active' && (
                        <BellRing className="w-6 h-6 text-red-600 animate-pulse" />
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
    </RoleLayout>
  );
};

export default AlertsManagement;