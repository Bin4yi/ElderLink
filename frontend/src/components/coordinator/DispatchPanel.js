import React, { useState, useEffect } from 'react';
import { coordinatorService, ambulanceService } from '../../services/ambulance';
import Loading from '../common/Loading';
import './DispatchPanel.css';

const DispatchPanel = ({ emergency, onClose, onDispatchComplete }) => {
  const [availableAmbulances, setAvailableAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [hospitalDestination, setHospitalDestination] = useState('');
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    loadAvailableAmbulances();
  }, []);

  const loadAvailableAmbulances = async () => {
    try {
      setLoading(true);
      const latitude = emergency.location?.latitude;
      const longitude = emergency.location?.longitude;

      if (latitude && longitude) {
        const response = await ambulanceService.getAvailableAmbulances(latitude, longitude, 10);
        setAvailableAmbulances(response.data || []);
      } else {
        const response = await ambulanceService.getAllAmbulances({ status: 'available' });
        setAvailableAmbulances(response.data || []);
      }
    } catch (error) {
      console.error('Error loading ambulances:', error);
      alert('Failed to load available ambulances');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!selectedAmbulance) {
      alert('Please select an ambulance');
      return;
    }

    try {
      setDispatching(true);
      await coordinatorService.dispatchAmbulance(emergency.id, {
        ambulanceId: selectedAmbulance.id,
        hospitalDestination: hospitalDestination || undefined,
      });
      alert('✅ Ambulance dispatched successfully!');
      onDispatchComplete();
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
      alert('Failed to dispatch ambulance: ' + (error.response?.data?.message || error.message));
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="dispatch-panel-overlay" onClick={onClose}>
      <div className="dispatch-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dispatch-header">
          <h2>🚑 Dispatch Ambulance</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Emergency Info */}
        <div className="emergency-summary">
          <h3>Emergency Details:</h3>
          <p>
            <strong>Patient:</strong> {emergency.elder?.user?.firstName} {emergency.elder?.user?.lastName}
          </p>
          <p>
            <strong>Priority:</strong>{' '}
            <span className={`priority-${emergency.priority}`}>{emergency.priority.toUpperCase()}</span>
          </p>
          <p>
            <strong>Type:</strong> {emergency.alertType.replace('_', ' ')}
          </p>
          <p>
            <strong>Location:</strong> {emergency.location?.address || 'Unknown'}
          </p>
        </div>

        {/* Hospital Destination */}
        <div className="hospital-input">
          <label>
            <strong>Hospital Destination (Optional):</strong>
          </label>
          <input
            type="text"
            placeholder="e.g., National Hospital Colombo"
            value={hospitalDestination}
            onChange={(e) => setHospitalDestination(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Available Ambulances */}
        <div className="ambulance-selection">
          <h3>Available Ambulances ({availableAmbulances.length}):</h3>

          {loading ? (
            <Loading text="Loading ambulances..." size="small" />
          ) : availableAmbulances.length === 0 ? (
            <div className="no-ambulances">
              <p>⚠️ No ambulances available</p>
              <button onClick={loadAvailableAmbulances} className="btn btn-secondary">
                🔄 Refresh
              </button>
            </div>
          ) : (
            <div className="ambulance-list">
              {availableAmbulances.map((ambulance) => (
                <div
                  key={ambulance.id}
                  className={`ambulance-card ${selectedAmbulance?.id === ambulance.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAmbulance(ambulance)}
                >
                  <div className="ambulance-header">
                    <h4>{ambulance.vehicleNumber}</h4>
                    <span className={`type-badge type-${ambulance.type.replace('_', '-')}`}>
                      {ambulance.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="ambulance-info">
                    <p>🚗 {ambulance.licensePlate}</p>
                    {ambulance.driver && (
                      <p>
                        👨‍⚕️ {ambulance.driver.firstName} {ambulance.driver.lastName}
                      </p>
                    )}
                    {ambulance.driver?.phone && <p>📞 {ambulance.driver.phone}</p>}
                    {ambulance.hospital && <p>🏥 {ambulance.hospital}</p>}
                    {ambulance.distance !== undefined && (
                      <p className="distance">
                        📍 <strong>{ambulance.distance.toFixed(2)} km</strong> away
                      </p>
                    )}
                    {ambulance.estimatedArrival !== undefined && (
                      <p className="eta">
                        ⏱️ ETA: <strong>{ambulance.estimatedArrival} min</strong>
                      </p>
                    )}
                  </div>

                  {/* Equipment */}
                  {ambulance.equipment && Object.keys(ambulance.equipment).length > 0 && (
                    <div className="ambulance-equipment">
                      <strong>Equipment:</strong>{' '}
                      {Object.entries(ambulance.equipment)
                        .filter(([_, value]) => value)
                        .map(([key]) => key)
                        .join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="dispatch-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={dispatching}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDispatch}
            disabled={!selectedAmbulance || dispatching}
          >
            {dispatching ? '⏳ Dispatching...' : '🚑 Dispatch Ambulance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchPanel;
