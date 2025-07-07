import { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';

const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, elder: 'Margaret Thompson', message: 'Blood pressure reading high', severity: 'high', time: '30 min ago', status: 'New' },
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
    handleStatusChange(alert.id, 'Emergency Contacted');
  };

  const notifyNextOfKin = (alert) => {
    alertUser(`Next of kin notified for ${alert.elder}`);
    handleStatusChange(alert.id, 'Next of Kin Notified');
  };

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
      <div className="bg-gradient-to-br from-white via-blue-50 to-gray-100 p-16 md:p-24 rounded-3xl shadow-2xl space-y-16 border border-gray-200 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Recent Health Alerts </h2>
          <p className="text-gray-700 mt-3 text-base max-w-2xl mx-auto">
            Review and respond to urgent health alerts.
          </p>
        </div>
        <div>
          {alerts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 italic text-lg">No recent alerts.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {alerts.map(alert => (
                // Removed the small white container div here:
                <div key={alert.id} className="w-full max-w-xl flex flex-col gap-4 border border-gray-100 p-0 shadow-none bg-transparent">
                  <div className="flex flex-col gap-3">
                    <div className="text-3xl font-extrabold text-gray-800">{alert.elder}</div>
                    <div className="text-base text-gray-700">{alert.message}</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold shadow ${getSeverityStyle(alert.severity)}`}>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</span>
                    <span className="text-base font-semibold text-gray-600">{alert.time}</span>
                  </div>
                  <span className="text-base font-bold text-gray-800 bg-gray-100 px-5 py-2 rounded self-start">Status: {alert.status}</span>
                  <div className="flex gap-6 mt-2">
                    <button
                      onClick={() => contactEmergencyServices(alert)}
                      className={`bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 border-2 border-green-800 flex items-center justify-center ${alert.severity === 'high' ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}`}
                      title="Contact Emergency Services"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414A9 9 0 015.636 18.364l-1.414-1.414M15 7h6m0 0v6" /></svg>
                      Contact Emergency
                    </button>
                    <button
                      onClick={() => notifyNextOfKin(alert)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center"
                      title="Notify Next of Kin"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m2-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                      Notify Next of Kin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
}

export default AlertsManagement;
