// frontend/src/components/doctor/sessions/ZoomMeetingManager.js
import React, { useState, useEffect } from 'react';
import { 
  createZoomMeeting, 
  sendMeetingLinks, 
  startMeeting,
  getDoctorMonthlySessions 
} from '../../../services/monthlySessionService';
import './ZoomMeetingManager.css';

const ZoomMeetingManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingSession, setProcessingSession] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // upcoming, today, all

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.sessionDate = today;
      } else if (filter === 'upcoming') {
        params.status = 'scheduled';
      }

      const response = await getDoctorMonthlySessions(params);
      setSessions(response.data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZoomMeeting = async (sessionId) => {
    try {
      setProcessingSession(sessionId);
      setError(null);

      const response = await createZoomMeeting(sessionId);
      
      alert(`✅ Zoom meeting created successfully!\n\nMeeting ID: ${response.data.meetingId}\nPassword: ${response.data.password}`);

      // Refresh sessions
      await fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to create Zoom meeting');
      alert(`❌ Error: ${err.message || 'Failed to create Zoom meeting'}`);
    } finally {
      setProcessingSession(null);
    }
  };

  const handleSendLinks = async (sessionId) => {
    try {
      setProcessingSession(sessionId);
      setError(null);

      await sendMeetingLinks(sessionId);
      
      alert('✅ Zoom links sent successfully to family member via email and mobile app!');

      // Refresh sessions
      await fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to send Zoom links');
      alert(`❌ Error: ${err.message || 'Failed to send Zoom links'}`);
    } finally {
      setProcessingSession(null);
    }
  };

  const handleStartMeeting = async (sessionId, startUrl) => {
    try {
      setProcessingSession(sessionId);
      
      // Get the latest start URL in case session was updated
      const response = await startMeeting(sessionId);
      
      // Open Zoom meeting in new tab
      window.open(response.data.startUrl || startUrl, '_blank');

      // Refresh sessions to show updated status
      await fetchSessions();
    } catch (err) {
      alert(`❌ Error: ${err.message || 'Failed to start meeting'}`);
    } finally {
      setProcessingSession(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} copied to clipboard!`);
  };

  const getSessionStatusBadge = (status) => {
    const statusClasses = {
      'scheduled': 'status-scheduled',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'missed': 'status-missed'
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="zoom-manager-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zoom-manager-container">
      <div className="zoom-header">
        <h1>📹 Zoom Meeting Manager</h1>
        <p>Create and manage Zoom meetings for monthly sessions</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          📅 Upcoming
        </button>
        <button 
          className={filter === 'today' ? 'active' : ''}
          onClick={() => setFilter('today')}
        >
          🕐 Today
        </button>
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          📋 All Sessions
        </button>
      </div>

      {/* Sessions List */}
      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <h3>No sessions found</h3>
            <p>No {filter === 'all' ? '' : filter} sessions available.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <div className="session-info">
                  <h3>{session.elder?.firstName} {session.elder?.lastName}</h3>
                  <p className="session-date">
                    📅 {new Date(session.sessionDate).toLocaleDateString()} at {session.sessionTime}
                  </p>
                  <p className="session-duration">⏱️ {session.duration} minutes</p>
                </div>
                <div className="session-status">
                  {getSessionStatusBadge(session.status)}
                </div>
              </div>

              {/* Family Member Info */}
              {session.familyMember && (
                <div className="family-info">
                  <p><strong>Family Contact:</strong> {session.familyMember.firstName} {session.familyMember.lastName}</p>
                  <p><strong>Email:</strong> {session.familyMember.email}</p>
                </div>
              )}

              {/* Zoom Meeting Info */}
              {session.zoomMeetingId ? (
                <div className="zoom-info">
                  <h4>🎥 Zoom Meeting Details</h4>
                  <div className="zoom-detail">
                    <label>Meeting ID:</label>
                    <div className="copy-field">
                      <input type="text" value={session.zoomMeetingId} readOnly />
                      <button 
                        onClick={() => copyToClipboard(session.zoomMeetingId, 'Meeting ID')}
                        className="copy-btn"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                  <div className="zoom-detail">
                    <label>Password:</label>
                    <div className="copy-field">
                      <input type="text" value={session.zoomPassword} readOnly />
                      <button 
                        onClick={() => copyToClipboard(session.zoomPassword, 'Password')}
                        className="copy-btn"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                  <div className="zoom-detail">
                    <label>Join URL:</label>
                    <div className="copy-field">
                      <input type="text" value={session.zoomJoinUrl} readOnly />
                      <button 
                        onClick={() => copyToClipboard(session.zoomJoinUrl, 'Join URL')}
                        className="copy-btn"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-zoom-info">
                  <p>⚠️ No Zoom meeting created yet</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="session-actions">
                {!session.zoomMeetingId ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleCreateZoomMeeting(session.id)}
                    disabled={processingSession === session.id}
                  >
                    {processingSession === session.id ? '⏳ Creating...' : '➕ Create Zoom Meeting'}
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleStartMeeting(session.id, session.zoomStartUrl)}
                      disabled={processingSession === session.id || session.status === 'completed'}
                    >
                      {processingSession === session.id ? '⏳ Starting...' : '🚀 Start Meeting'}
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleSendLinks(session.id)}
                      disabled={processingSession === session.id}
                    >
                      {processingSession === session.id ? '⏳ Sending...' : '📧 Send Links'}
                    </button>

                    <button
                      className="btn btn-info"
                      onClick={() => window.open(session.zoomJoinUrl, '_blank')}
                    >
                      🔗 Preview Join Link
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ZoomMeetingManager;
