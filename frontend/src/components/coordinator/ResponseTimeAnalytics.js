import React, { useState, useEffect } from 'react';
import { coordinatorService } from '../../services/ambulance';
import './ResponseTimeAnalytics.css';

const ResponseTimeAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('7d'); // 24h, 7d, 30d
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await coordinatorService.getAnalytics(period);
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics error">
        <p>Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Period Selector */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === '24h' ? 'active' : ''}`}
          onClick={() => setPeriod('24h')}
        >
          Last 24 Hours
        </button>
        <button
          className={`period-btn ${period === '7d' ? 'active' : ''}`}
          onClick={() => setPeriod('7d')}
        >
          Last 7 Days
        </button>
        <button
          className={`period-btn ${period === '30d' ? 'active' : ''}`}
          onClick={() => setPeriod('30d')}
        >
          Last 30 Days
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🚨</div>
          <div className="metric-value">{analytics.totalEmergencies}</div>
          <div className="metric-label">Total Emergencies</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-value">{analytics.completedEmergencies}</div>
          <div className="metric-label">Completed</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-value">{analytics.completionRate.toFixed(1)}%</div>
          <div className="metric-label">Completion Rate</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-value">{analytics.averageResponseTime}s</div>
          <div className="metric-label">Avg Response Time</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📍</div>
          <div className="metric-value">{analytics.averageDistance.toFixed(2)} km</div>
          <div className="metric-label">Avg Distance</div>
        </div>
      </div>

      {/* Emergencies by Type */}
      <div className="chart-section">
        <h3>📋 Emergencies by Type</h3>
        <div className="chart-list">
          {analytics.emergenciesByType && analytics.emergenciesByType.length > 0 ? (
            analytics.emergenciesByType.map((item) => (
              <div key={item.alertType} className="chart-item">
                <div className="chart-label">{item.alertType.replace('_', ' ')}</div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(item.count / analytics.totalEmergencies) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}</div>
              </div>
            ))
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>

      {/* Emergencies by Priority */}
      <div className="chart-section">
        <h3>⚠️ Emergencies by Priority</h3>
        <div className="chart-list">
          {analytics.emergenciesByPriority && analytics.emergenciesByPriority.length > 0 ? (
            analytics.emergenciesByPriority.map((item) => (
              <div key={item.priority} className="chart-item">
                <div className={`chart-label priority-${item.priority}`}>
                  {item.priority.toUpperCase()}
                </div>
                <div className="chart-bar-container">
                  <div
                    className={`chart-bar priority-${item.priority}`}
                    style={{
                      width: `${(item.count / analytics.totalEmergencies) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}</div>
              </div>
            ))
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>

      {/* Top Performing Ambulances */}
      <div className="chart-section">
        <h3>🏆 Top Performing Ambulances</h3>
        <div className="table-container">
          {analytics.topAmbulances && analytics.topAmbulances.length > 0 ? (
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Completed</th>
                  <th>Avg Response</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topAmbulances.map((ambulance, index) => (
                  <tr key={ambulance.ambulanceId}>
                    <td className="rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="vehicle">{ambulance.ambulance.vehicleNumber}</td>
                    <td className="type">{ambulance.ambulance.type.replace(/_/g, ' ')}</td>
                    <td className="completed">{ambulance.completedDispatch}</td>
                    <td className="response">
                      {Math.round(ambulance.avgResponseTime)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseTimeAnalytics;
