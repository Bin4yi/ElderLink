import { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';

const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, elder: 'Margaret Thompson', message: 'Blood pressure reading high (180/95)', severity: 'high', time: '30 min ago', status: 'New', emergencyContacted: false, nextOfKinNotified: false },
    { id: 2, elder: 'Margaret Thompson', message: 'Fall detected by sensor', severity: 'high', time: '1 hour ago', status: 'New', emergencyContacted: false, nextOfKinNotified: false }
  ]);

  const handleStatusChange = (alertId, newStatus) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      )
    );
  };

  const executeResponseProtocol = (alert) => {
    alertUser(`Response protocol executed for ${alert.elder}`);
    handleStatusChange(alert.id, 'Responded');
  };

  const contactEmergencyServices = (alert) => {
    alertUser(`Emergency services contacted for ${alert.elder}`);
    setAlerts(prevAlerts =>
      prevAlerts.map(a => {
        if (a.id === alert.id) {
          const updatedAlert = { ...a, emergencyContacted: true };
          // Update main status based on both actions
          if (updatedAlert.nextOfKinNotified) {
            updatedAlert.status = 'Emergency Contacted & Next of Kin Notified';
          } else {
            updatedAlert.status = 'Emergency Contacted';
          }
          return updatedAlert;
        }
        return a;
      })
    );
  };

  const notifyNextOfKin = (alert) => {
    alertUser(`Next of kin notified for ${alert.elder}`);
    setAlerts(prevAlerts =>
      prevAlerts.map(a => {
        if (a.id === alert.id) {
          const updatedAlert = { ...a, nextOfKinNotified: true };
          // Update main status based on both actions
          if (updatedAlert.emergencyContacted) {
            updatedAlert.status = 'Emergency Contacted & Next of Kin Notified';
          } else {
            updatedAlert.status = 'Next of Kin Notified';
          }
          return updatedAlert;
        }
        return a;
      })
    );
  };

  const alertUser = (msg) => {
    window.alert(msg);
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
   
      default:
        return '';
    }
  };

  return (
    <RoleLayout title="Alert Management">
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Recent Health Alerts</h2>
            <p className="text-gray-500 mt-2">
              Review and respond to urgent health alerts.
            </p>
          </div>
        <div>
          {alerts.length === 0 ? (
            <p className="text-gray-500">No recent alerts.</p>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="flex justify-between items-center p-6 border rounded-md bg-white shadow-sm">
                  <div className="flex-1">
                    <div className="text-xl font-bold">{alert.elder}</div>
                    <div className="text-base text-gray-700 mt-2">{alert.message}</div>
                    <div className="flex flex-col gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSeverityStyle(alert.severity)} self-start`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">{alert.time}</span>
                      <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded self-start">
                        Status: {alert.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 ml-8">
                    <button
                      onClick={() => contactEmergencyServices(alert)}
                      className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 border-2 border-green-800 flex items-center justify-center text-sm"
                      title="Contact Emergency Services"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414A9 9 0 015.636 18.364l-1.414-1.414M15 7h6m0 0v6" /></svg>
                     {alert.emergencyContacted ? 'Contacted' : 'Contact Emergency'}
                    </button>
                    <button
                      onClick={() => notifyNextOfKin(alert)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center"
                      title="Notify Next of Kin"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m2-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                      {alert.nextOfKinNotified ? 'Notified' : 'Notify Next of Kin'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </RoleLayout>
  );
}

export default AlertsManagement;
