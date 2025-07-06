// src/components/staff/alerts/AlertsManagement.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';

const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, elder: 'Margaret Thompson', message: 'Blood pressure reading high', severity: 'high', time: '30 min ago', status: 'New' },
    { id: 2, elder: 'Robert Wilson', message: 'Missed morning medication', severity: 'medium', time: '1 hour ago', status: 'New' },
    { id: 3, elder: 'Dorothy Davis', message: 'Fall detection alert resolved', severity: 'low', time: '2 hours ago', status: 'New' },
    { id: 4, elder: 'Helen Smith', message: 'Irregular heartbeat detected', severity: 'high', time: '10 min ago', status: 'New' },
    { id: 5, elder: 'James Brown', message: 'Low blood sugar', severity: 'medium', time: '45 min ago', status: 'New' },
    { id: 6, elder: 'Patricia Johnson', message: 'Missed lunch', severity: 'low', time: '3 hours ago', status: 'New' },
    { id: 7, elder: 'William Lee', message: 'Wandering detected', severity: 'high', time: '5 min ago', status: 'New' },
    { id: 8, elder: 'Barbara Garcia', message: 'Medication taken late', severity: 'medium', time: '20 min ago', status: 'New' },
    { id: 9, elder: 'Charles Martinez', message: 'No activity detected', severity: 'low', time: '4 hours ago', status: 'New' },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, status: newStatus } : alert
    ));
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return '';
    }
  };

  return (
    <RoleLayout title="Alert Management">
      <div className="bg-white p-6 rounded-lg shadow space-y-10">

        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Recent Health Alerts</h2>
            <p className="text-gray-500 mt-2">
              Recent Health alerts for elderly residents. Review and take necessary actions.
            </p>
          </div>
        <div className="overflow-x-auto">
          {alerts.length === 0 ? (
            <p className="text-gray-500 italic">No recent alerts.</p>
          ) : (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Elder</th>
                  <th className="border px-4 py-2 text-left">Message</th>
                  <th className="border px-4 py-2 text-left">Severity</th>
                  <th className="border px-4 py-2 text-left">Time</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{alert.elder}</td>
                    <td className="border px-4 py-2">{alert.message}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityStyle(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </td>
                    <td className="border px-4 py-2">{alert.time}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.status === 'New'
                          ? 'bg-blue-100 text-blue-700'
                          : alert.status === 'Reviewed'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 space-x-2">
                      {alert.status === 'New' && (
                        <button
                          onClick={() => handleStatusChange(alert.id, 'Reviewed')}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded text-sm"
                        >
                          Mark Reviewed
                        </button>
                      )}
                      {alert.status !== 'Responded' && (
                        <button
                          onClick={() => handleStatusChange(alert.id, 'Responded')}
                          className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm"
                        >
                          Respond
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default AlertsManagement;
