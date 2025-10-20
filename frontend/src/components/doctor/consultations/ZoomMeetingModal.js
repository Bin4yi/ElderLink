// src/components/doctor/consultations/ZoomMeetingModal.js
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import { Video, Calendar, Clock, User, Link as LinkIcon, Copy, CheckCircle, ExternalLink, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const ZoomMeetingModal = ({ consultation, isOpen, onClose, onStartMeeting, isMonthlySession = false }) => {
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [zoomData, setZoomData] = useState(null);

  if (!consultation) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Meeting link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const createZoomMeeting = async () => {
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      
      // Determine the endpoint based on whether this is a monthly session or appointment
      const endpoint = isMonthlySession 
        ? `http://localhost:5000/api/monthly-sessions/${consultation.id}/create-zoom`
        : `http://localhost:5000/api/doctor/appointments/${consultation.id}/create-zoom`;
      
      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Zoom meeting created successfully!');
        // Update local zoom data
        setZoomData({
          zoomJoinUrl: response.data.data.joinUrl,
          zoomPassword: response.data.data.password,
          zoomMeetingId: response.data.data.meetingId,
          zoomStartUrl: response.data.data.startUrl
        });
        
        // Update consultation object
        consultation.zoomJoinUrl = response.data.data.joinUrl;
        consultation.zoomPassword = response.data.data.password;
        consultation.zoomMeetingId = response.data.data.meetingId;
      } else {
        toast.error(response.data.message || 'Failed to create Zoom meeting');
      }
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to create Zoom meeting');
    } finally {
      setCreating(false);
    }
  };

  const handleStartMeeting = () => {
    const joinUrl = zoomData?.zoomJoinUrl || consultation.zoomJoinUrl;
    if (joinUrl) {
      window.open(joinUrl, '_blank');
      if (onStartMeeting) {
        onStartMeeting(consultation);
      }
    } else {
      toast.error('No Zoom meeting link available');
    }
  };

  // Use either the newly created zoom data or the existing consultation data
  const currentZoomData = zoomData || {
    zoomJoinUrl: consultation.zoomJoinUrl,
    zoomPassword: consultation.zoomPassword,
    zoomMeetingId: consultation.zoomMeetingId
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Video Consultation"
      size="medium"
    >
      <div className="space-y-6">
        {/* Patient Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {consultation.elder?.firstName} {consultation.elder?.lastName}
              </h3>
              <p className="text-gray-600">Patient</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>
                {new Date(consultation.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{consultation.appointmentTime}</span>
            </div>
          </div>

          {consultation.reason && (
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-600 mb-1">Reason for Consultation</p>
              <p className="text-gray-900">{consultation.reason}</p>
            </div>
          )}
        </div>

        {/* Zoom Meeting Details */}
        {currentZoomData.zoomJoinUrl ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Video className="w-5 h-5" />
              <span className="font-semibold">Zoom Meeting Ready</span>
            </div>

            {/* Mock Meeting Warning (if it's a development mock) */}
            {currentZoomData.zoomJoinUrl?.includes('mock') || currentZoomData.zoomMeetingId?.length === 10 ? (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Development Mode:</strong> This is a mock Zoom meeting for testing. 
                  Configure real Zoom credentials in production.
                </p>
              </div>
            ) : null}

            {/* Meeting Link */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Meeting Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentZoomData.zoomJoinUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => copyToClipboard(currentZoomData.zoomJoinUrl)}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Meeting Password */}
            {currentZoomData.zoomPassword && (
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Meeting Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currentZoomData.zoomPassword}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(currentZoomData.zoomPassword)}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Meeting ID */}
            {currentZoomData.zoomMeetingId && (
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Meeting ID
                </label>
                <p className="text-gray-900 font-mono text-lg">{currentZoomData.zoomMeetingId}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Video className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 mb-1">No Zoom Meeting Scheduled</p>
                <p className="text-sm text-yellow-700">
                  A Zoom meeting link has not been created for this consultation yet. 
                  Click the button below to create one now.
                </p>
              </div>
            </div>

            {/* Create Zoom Meeting Button */}
            <button
              onClick={createZoomMeeting}
              disabled={creating}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Meeting...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Create Zoom Meeting
                </>
              )}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {currentZoomData.zoomJoinUrl && (
            <button
              onClick={handleStartMeeting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Start Video Call
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">📝 Before joining:</p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Ensure your camera and microphone are working</li>
            <li>Find a quiet, well-lit location</li>
            <li>Have the patient's medical records ready</li>
            <li>Test your internet connection</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ZoomMeetingModal;
