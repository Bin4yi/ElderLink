import React, { useState, useEffect } from 'react';
import { ambulanceService } from '../../services/ambulance';
import socketService from '../../services/socket';
import Loading from '../common/Loading';
import './AmbulanceTracker.css';

const AmbulanceTracker = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, available, en_route, busy

  useEffect(() => {
    loadAmbulances();
    setupSocketListeners();

    const interval = setInterval(loadAmbulances, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [filter]);

  const loadAmbulances = async () => {
    try {
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }
      filters.isActive = true;

      const response = await ambulanceService.getAllAmbulances(filters);
      setAmbulances(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading ambulances:', error);
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for ambulance location updates
    socketService.onAmbulanceLocationUpdate((data) => {
      console.log('📍 Ambulance location update:', data);
      loadAmbulances(); // Refresh list
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'en_route':
        return '#3b82f6';
      case 'busy':
        return '#f59e0b';
      case 'maintenance':
        return '#6b7280';
      case 'offline':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'en_route':
        return '🚑';
      case 'busy':
        return '⏳';
      case 'maintenance':
        return '🔧';
      case 'offline':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="ambulance-tracker loading">
        <Loading text="Loading ambulances..." />
      </div>
    );
  }

  return (
    <div className="ambulance-tracker">
      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({ambulances.length})
        </button>
        <button
          className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Available
        </button>
        <button
          className={`filter-btn ${filter === 'en_route' ? 'active' : ''}`}
          onClick={() => setFilter('en_route')}
        >
          En Route
        </button>
        <button
          className={`filter-btn ${filter === 'busy' ? 'active' : ''}`}
          onClick={() => setFilter('busy')}
        >
          Busy
        </button>
      </div>

      {/* Ambulance List */}
      <div className="ambulance-grid">
        {ambulances.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🚑</span>
            <p>No ambulances found</p>
          </div>
        ) : (
          ambulances.map((ambulance) => (
            <div key={ambulance.id} className="ambulance-card">
              {/* Status Badge */}
              <div
                className="status-badge"
                style={{ backgroundColor: getStatusColor(ambulance.status) }}
              >
                {getStatusIcon(ambulance.status)} {ambulance.status.replace('_', ' ').toUpperCase()}
              </div>

              {/* Ambulance Info */}
              <div className="ambulance-info">
                <h3>{ambulance.vehicleNumber}</h3>
                <p className="license-plate">🚗 {ambulance.licensePlate}</p>
                <p className="type">
                  {ambulance.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>

              {/* Driver Info */}
              {ambulance.driver && (
                <div className="driver-info">
                  <h4>👨‍⚕️ Driver:</h4>
                  <p>
                    {ambulance.driver.firstName} {ambulance.driver.lastName}
                  </p>
                  {ambulance.driver.phone && <p>📞 {ambulance.driver.phone}</p>}
                </div>
              )}

              {/* Hospital */}
              {ambulance.hospital && (
                <div className="hospital-info">
                  <p>🏥 {ambulance.hospital}</p>
                </div>
              )}

              {/* Current Location */}
              {ambulance.currentLocation?.latitude && ambulance.currentLocation?.longitude && (
                <div className="location-info">
                  <p className="coordinates">
                    📍 {ambulance.currentLocation.latitude.toFixed(6)},{' '}
                    {ambulance.currentLocation.longitude.toFixed(6)}
                  </p>
                  {ambulance.currentLocation.timestamp && (
                    <p className="last-update">
                      Last update: {new Date(ambulance.currentLocation.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${ambulance.currentLocation.latitude},${ambulance.currentLocation.longitude}`,
                        '_blank'
                      )
                    }
                  >
                    🗺️ View on Map
                  </button>
                </div>
              )}

              {/* Active Dispatch Info */}
              {ambulance.activeDispatch && (
                <div className="active-dispatch">
                  <h4>🚨 Active Dispatch:</h4>
                  <p>Emergency ID: {ambulance.activeDispatch.emergencyAlertId}</p>
                  <p>Status: {ambulance.activeDispatch.status}</p>
                  {ambulance.activeDispatch.estimatedArrivalTime && (
                    <p>
                      ETA: {new Date(ambulance.activeDispatch.estimatedArrivalTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}

              {/* Equipment */}
              {ambulance.equipment && Object.keys(ambulance.equipment).length > 0 && (
                <div className="equipment-info">
                  <h4>Equipment:</h4>
                  <div className="equipment-tags">
                    {Object.entries(ambulance.equipment)
                      .filter(([_, value]) => value)
                      .map(([key]) => (
                        <span key={key} className="equipment-tag">
                          {key}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AmbulanceTracker;
