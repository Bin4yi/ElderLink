// src/components/doctor/consultations/ScheduleSessionModal.js
import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Send, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import monthlySessionService from '../../../services/monthlySession';

const ScheduleSessionModal = ({ isOpen, onClose, appointment, onScheduled }) => {
  const [loading, setLoading] = useState(false);
  const [zoomCreated, setZoomCreated] = useState(false);
  const [linksSent, setLinksSent] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleCreateZoomMeeting = async () => {
    try {
      setLoading(true);
      // Create Zoom meeting
      const response = await monthlySessionService.createZoomMeeting(appointment.id);
      
      if (response.success) {
        toast.success('Zoom meeting created successfully!');
        setZoomCreated(true);
      } else {
        toast.error(response.message || 'Failed to create Zoom meeting');
      }
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      toast.error('Failed to create Zoom meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLinks = async () => {
    try {
      setLoading(true);
      // Send Zoom links via email and notification
      const response = await monthlySessionService.sendMeetingLinks(appointment.id);
      
      if (response.success) {
        toast.success('Zoom links sent to family member!');
        setLinksSent(true);
        if (onScheduled) {
          onScheduled();
        }
      } else {
        toast.error(response.message || 'Failed to send links');
      }
    } catch (error) {
      console.error('Error sending links:', error);
      toast.error('Failed to send links');
    } finally {
      setLoading(false);
    }
  };

  const elder = appointment.elder || {};
  const familyMember = appointment.familyMember || {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Schedule Zoom Session</h2>
                <p className="text-green-100">Create and send meeting link</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Appointment Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-3">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-semibold text-gray-900">{elder.firstName} {elder.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Family Member</p>
                <p className="font-semibold text-gray-900">{familyMember.firstName} {familyMember.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold text-gray-900">{appointment.appointmentTime}</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1: Create Zoom Meeting */}
            <div className={`border-2 rounded-xl p-4 ${zoomCreated ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${zoomCreated ? 'bg-green-600' : 'bg-gray-300'}`}>
                    {zoomCreated ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold">1</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Create Zoom Meeting</p>
                    <p className="text-sm text-gray-600">Generate Zoom meeting link</p>
                  </div>
                </div>
                <button
                  onClick={handleCreateZoomMeeting}
                  disabled={loading || zoomCreated}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    zoomCreated
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading && !zoomCreated ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : zoomCreated ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Created
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Send Links */}
            <div className={`border-2 rounded-xl p-4 ${linksSent ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${linksSent ? 'bg-green-600' : 'bg-gray-300'}`}>
                    {linksSent ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold">2</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Send Meeting Links</p>
                    <p className="text-sm text-gray-600">Email + mobile notification to family</p>
                  </div>
                </div>
                <button
                  onClick={handleSendLinks}
                  disabled={loading || !zoomCreated || linksSent}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    linksSent
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : !zoomCreated
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading && zoomCreated && !linksSent ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : linksSent ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {linksSent && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="font-semibold">Session scheduled successfully!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                The family member has received the Zoom link via email and mobile notification.
                You can now start the session when it's time.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {linksSent ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
