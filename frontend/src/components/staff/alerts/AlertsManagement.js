

import { useState } from 'react';
import { generateEmergencyPDF } from './emergencyPDF';
import RoleLayout from '../../common/RoleLayout';


const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, elder: 'Margaret Thompson', message: 'Blood pressure reading high', severity: 'high', time: '30 min ago', status: 'New' },
    { id: 2, elder: 'Robert Wilson', message: 'Missed morning medication', severity: 'medium', time: '1 hour ago', status: 'New' },
    { id: 3, elder: 'Dorothy Davis', message: 'Fall detection alert resolved', severity: 'low', time: '2 hours ago', status: 'New' },
    { id: 4, elder: 'Helen Smith', message: 'Irregular heartbeat detected', severity: 'high', time: '10 min ago', status: 'New' },
    
  ]);


  // Update the status of an alert by id
  const handleStatusChange = (alertId, newStatus) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      )
    );
  };

  // Emergency protocol functions
  const executeResponseProtocol = (alert) => {
    // Placeholder: Add logic to execute response protocol
    alertUser(`Response protocol executed for ${alert.elder}`);
    handleStatusChange(alert.id, 'Responded');
  };

  const contactEmergencyServices = (alert) => {
    // Placeholder: Add logic to contact emergency services
    alertUser(`Emergency services contacted for ${alert.elder}`);
    handleStatusChange(alert.id, 'Emergency Contacted');
  };

  const notifyNextOfKin = (alert) => {
    // Placeholder: Add logic to notify next of kin
    alertUser(`Next of kin notified for ${alert.elder}`);
    handleStatusChange(alert.id, 'Next of Kin Notified');
  };

  const documentEmergencyDetails = (alert) => {
    generateEmergencyPDF(alert);
    alertUser(`Emergency details documented for ${alert.elder}`);
    handleStatusChange(alert.id, 'Documented');
  };

  // Simple alert for demonstration
  const alertUser = (msg) => {
    window.alert(msg);
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
      <div className="bg-gradient-to-br from-white via-blue-50 to-gray-100 p-10 rounded-2xl shadow-2xl space-y-12 border border-gray-200">
        <div className="text-center mb-12">
         <h2 className="text-3xl font-bold text-gray-800">   Health Alerts for Elders</h2>
          <p className="text-gray-700 mt-3 text-base max-w-2xl mx-auto">
            Review and respond to urgent health alerts for elderly residents. Take immediate action as needed and document all interventions for compliance and safety.
          </p>
        </div>
        <div className="overflow-x-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 italic text-lg">No recent alerts.</p>
            </div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="bg-white shadow rounded-xl ">
                  <th className="border px-4 py-2 text-left font-bold rounded-tl-xl">Elder</th>
                  <th className="border px-4 py-2 text-left font-bold">Message</th>
                  <th className="border px-4 py-2 text-left font-bold">Severity</th>
                  <th className="border px-4 py-2 text-left font-bold">Time</th>
                  <th className="border px-4 py-2 text-left font-bold">Status</th>
                  <th className="border px-4 py-2 text-center font-bold">Contact Emergency Services</th>
                  <th className="border px-4 py-2 text-center font-bold">Notify Next of Kin</th>
                  <th className="border px-4 py-2 text-center font-bold rounded-tr-xl">Document Emergency Details</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert.id} className="bg-white shadow rounded-xl hover:shadow-lg transition-all">
                    <td className="border px-4 py-2 font-semibold text-gray-800 align-middle">{alert.elder}</td>
                    <td className="border px-6 py-2 text-gray-700 align-middle whitespace-pre-line">{alert.message}</td>
                    <td className="border px-4 py-2 align-middle">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow ${getSeverityStyle(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-gray-600 align-middle">{alert.time}</td>
                    <td className="border px-4 py-2 align-middle">
                      <span className="text-xs font-semibold text-gray-800">
                        {alert.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center align-middle">
                      <button
                        onClick={() => contactEmergencyServices(alert)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold shadow-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Contact Emergency Services"
                      >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414A9 9 0 015.636 18.364l-1.414-1.414M15 7h6m0 0v6" /></svg>
                        Contact
                      </button>
                    </td>
                    <td className="border px-4 py-2 text-center align-middle">
                      <button
                        onClick={() => notifyNextOfKin(alert)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        title="Notify Next of Kin"
                      >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m2-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                        Notify
                      </button>
                    </td>
                    <td className="border px-4 py-2 text-center align-middle">
                      <button
                        onClick={() => documentEmergencyDetails(alert)}
                        className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 font-semibold shadow-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        title="Document Emergency Details"
                      >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                        Document
                      </button>
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
}

export default AlertsManagement;
