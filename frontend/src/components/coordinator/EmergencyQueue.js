import React, { useState, useEffect } from 'react';
import { coordinatorService, ambulanceService } from '../../services/ambulance';
import DispatchPanel from './DispatchPanel';
import Loading from '../common/Loading';
import './EmergencyQueue.css';

const EmergencyQueue = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showDispatchPanel, setShowDispatchPanel] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, active

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadEmergencies, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [filter]);

  const loadEmergencies = async () => {
    try {
      const filters = {};
      if (filter === 'pending') {
        filters.status = 'pending,acknowledged';
      } else if (filter === 'active') {
        filters.status = 'dispatched,en_route,arrived';
      }

      const response = await coordinatorService.getEmergencyQueue(filters);
      setEmergencies(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading emergencies:', error);
      setLoading(false);
    }
  };

  const handleAcknowledge = async (emergencyId) => {
    try {
      await coordinatorService.acknowledgeEmergency(emergencyId);
      loadEmergencies();
    } catch (error) {
      console.error('Error acknowledging emergency:', error);
      alert('Failed to acknowledge emergency');
    }
  };

  const handleDispatch = (emergency) => {
    setSelectedEmergency(emergency);
    setShowDispatchPanel(true);
  };

  const handleDispatchComplete = () => {
    setShowDispatchPanel(false);
    setSelectedEmergency(null);
    loadEmergencies();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ef4444';
      case 'acknowledged':
        return '#f59e0b';
      case 'dispatched':
        return '#3b82f6';
      case 'en_route':
        return '#8b5cf6';
      case 'arrived':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="emergency-queue loading">
        <Loading text="Loading emergencies..." />
      </div>
    );
  }

  return (
    <div className="emergency-queue">
      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({emergencies.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
      </div>

      {/* Emergency List */}
      <div className="emergency-list">
        {emergencies.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <p>No emergencies in queue</p>
          </div>
        ) : (
          emergencies.map((emergency) => (
            <div key={emergency.id} className="emergency-card">
              {/* Header */}
              <div className="emergency-header">
                <div className="priority-badge" style={{ backgroundColor: getPriorityColor(emergency.priority) }}>
                  {emergency.priority.toUpperCase()}
                </div>
                <div className="status-badge" style={{ backgroundColor: getStatusColor(emergency.status) }}>
                  {emergency.status.replace('_', ' ').toUpperCase()}
                </div>
                <div className="time-badge">{formatTime(emergency.timestamp)}</div>
              </div>

              {/* Elder Info */}
              <div className="emergency-content">
                <div className="elder-info">
                  <h3>
                    {emergency.elder?.user?.firstName} {emergency.elder?.user?.lastName}
                  </h3>
                  <p className="alert-type">📱 {emergency.alertType.replace('_', ' ')}</p>
                  <p className="location">📍 {emergency.location?.address || 'Location unavailable'}</p>
                  {emergency.elder?.user?.phone && (
                    <p className="contact">📞 {emergency.elder.user.phone}</p>
                  )}
                </div>

                {/* Medical Info */}
                {emergency.medicalInfo && (
                  <div className="medical-info">
                    <h4>Medical Information:</h4>
                    {emergency.medicalInfo.conditions && (
                      <p>🏥 Conditions: {emergency.medicalInfo.conditions.join(', ')}</p>
                    )}
                    {emergency.medicalInfo.medications && (
                      <p>💊 Medications: {emergency.medicalInfo.medications.join(', ')}</p>
                    )}
                    {emergency.medicalInfo.allergies && (
                      <p>⚠️ Allergies: {emergency.medicalInfo.allergies.join(', ')}</p>
                    )}
                  </div>
                )}

                {/* Vitals */}
                {emergency.vitals && (
                  <div className="vitals">
                    <h4>Vitals:</h4>
                    {emergency.vitals.heartRate && <span>❤️ {emergency.vitals.heartRate} bpm</span>}
                    {emergency.vitals.bloodPressure && <span>🩺 {emergency.vitals.bloodPressure}</span>}
                    {emergency.vitals.oxygenSaturation && <span>💨 {emergency.vitals.oxygenSaturation}%</span>}
                  </div>
                )}

                {/* Dispatch Info */}
                {emergency.dispatch && (
                  <div className="dispatch-info">
                    <h4>🚑 Dispatch:</h4>
                    <p>Ambulance: {emergency.dispatch.ambulance?.vehicleNumber}</p>
                    <p>Driver: {emergency.dispatch.ambulance?.driver?.firstName} {emergency.dispatch.ambulance?.driver?.lastName}</p>
                    {emergency.dispatch.distance && <p>Distance: {parseFloat(emergency.dispatch.distance).toFixed(2)} km</p>}
                    {emergency.dispatch.estimatedArrivalTime && (
                      <p>ETA: {new Date(emergency.dispatch.estimatedArrivalTime).toLocaleTimeString()}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="emergency-actions">
                {emergency.status === 'pending' && (
                  <button
                    className="btn btn-warning"
                    onClick={() => handleAcknowledge(emergency.id)}
                  >
                    👁️ Acknowledge
                  </button>
                )}
                {(emergency.status === 'pending' || emergency.status === 'acknowledged') && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDispatch(emergency)}
                  >
                    🚑 Dispatch Ambulance
                  </button>
                )}
                {emergency.location?.latitude && emergency.location?.longitude && (
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${emergency.location.latitude},${emergency.location.longitude}`,
                        '_blank'
                      )
                    }
                  >
                    🗺️ View on Map
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Panel Modal */}
      {showDispatchPanel && selectedEmergency && (
        <DispatchPanel
          emergency={selectedEmergency}
          onClose={() => setShowDispatchPanel(false)}
          onDispatchComplete={handleDispatchComplete}
        />
      )}
    </div>
  );
};

export default EmergencyQueue;
