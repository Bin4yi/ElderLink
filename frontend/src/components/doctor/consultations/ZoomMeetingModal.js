// src/components/doctor/consultations/ZoomMeetingModal.js
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import { Video, Calendar, Clock, User, Link as LinkIcon, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const ZoomMeetingModal = ({ consultation, isOpen, onClose, onStartMeeting }) => {
  const [copied, setCopied] = useState(false);

  if (!consultation) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Meeting link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMeeting = () => {
    if (consultation.zoomJoinUrl) {
      window.open(consultation.zoomJoinUrl, '_blank');
      if (onStartMeeting) {
        onStartMeeting(consultation);
      }
    } else {
      toast.error('No Zoom meeting link available');
    }
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
        {consultation.zoomJoinUrl ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Video className="w-5 h-5" />
              <span className="font-semibold">Zoom Meeting Ready</span>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Meeting Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={consultation.zoomJoinUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => copyToClipboard(consultation.zoomJoinUrl)}
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
            {consultation.zoomPassword && (
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Meeting Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={consultation.zoomPassword}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(consultation.zoomPassword)}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Meeting ID */}
            {consultation.zoomMeetingId && (
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Meeting ID
                </label>
                <p className="text-gray-900 font-mono text-lg">{consultation.zoomMeetingId}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 mb-1">No Zoom Meeting Scheduled</p>
                <p className="text-sm text-yellow-700">
                  A Zoom meeting link has not been created for this consultation yet. 
                  Please contact support or schedule a meeting manually.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {consultation.zoomJoinUrl && (
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
