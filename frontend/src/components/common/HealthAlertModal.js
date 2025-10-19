// frontend/src/components/common/HealthAlertModal.js
import React from 'react';
import { X, AlertTriangle, Heart, Activity, Thermometer, Wind, UserCheck } from 'lucide-react';

const HealthAlertModal = ({ alert, onClose, onAcknowledge, onResolve }) => {

  const getAlertIcon = () => {
    switch (alert.alertType) {
      case 'HIGH_BLOOD_PRESSURE':
      case 'LOW_BLOOD_PRESSURE':
        return <Activity className="w-8 h-8" />;
      case 'HIGH_HEART_RATE':
      case 'LOW_HEART_RATE':
        return <Heart className="w-8 h-8" />;
      case 'HIGH_TEMPERATURE':
      case 'LOW_TEMPERATURE':
        return <Thermometer className="w-8 h-8" />;
      case 'LOW_OXYGEN':
        return <Wind className="w-8 h-8" />;
      default:
        return <AlertTriangle className="w-8 h-8" />;
    }
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const handleAcknowledge = async () => {
    if (onAcknowledge) {
      await onAcknowledge(alert.id);
    }
  };

  const handleResolve = async () => {
    if (onResolve) {
      await onResolve(alert.id);
    }
    onClose();
  };

  return (
    <>

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className={`p-6 border-b-4 ${getSeverityColor()}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getAlertIcon()}
                <div>
                  <h3 className="text-xl font-bold">Health Alert</h3>
                  <p className="text-sm font-semibold mt-1">
                    {alert.elderName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Severity Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor()}`}>
                {alert.severity.toUpperCase()} PRIORITY
              </span>
              <span className="text-sm text-gray-500">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Alert Message */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 font-medium">{alert.message}</p>
            </div>

            {/* Vital Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Trigger Value</p>
                <p className="font-semibold text-blue-900">{alert.triggerValue}</p>
              </div>
              {alert.normalRange && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Normal Range</p>
                  <p className="font-semibold text-green-900">{alert.normalRange}</p>
                </div>
              )}
            </div>

            {/* Alert Type */}
            <div>
              <p className="text-sm text-gray-600">Alert Type:</p>
              <p className="font-medium text-gray-800">
                {alert.alertType.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-3">
              {alert.status === 'active' && (
                <button
                  onClick={handleAcknowledge}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Acknowledge
                </button>
              )}
              
              {(alert.status === 'acknowledged' || alert.status === 'active') && (
                <button
                  onClick={handleResolve}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthAlertModal;
