import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { Users, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const AlertsManagement = () => {
  // State to store alerts data
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [actionType, setActionType] = useState(null); // 'transport' or 'treat'

  // Sample data (in real app, this would come from API)
  useEffect(() => {
    setTimeout(() => {
      setAlerts([
        {
          id: 1,
          patient: 'John Doe',
          age: 78,
          gender: 'Male',
          condition: 'Fall Detected',
          status: 'Pending',
          time: '2024-06-01 10:15',
          details: 'Patient found on floor, conscious, minor bruises.'
        },
        {
          id: 2,
          patient: 'Jane Smith',
          age: 82,
          gender: 'Female',
          condition: 'High Blood Pressure',
          status: 'Resolved',
          time: '2024-06-01 09:30',
          details: 'BP 180/110, medication administered.'
        },
        {
          id: 3,
          patient: 'Bob Johnson',
          age: 75,
          gender: 'Male',
          condition: 'Missed Medication',
          status: 'Pending',
          time: '2024-06-01 08:45',
          details: 'Missed morning dose, nurse notified.'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter alerts based on search
  const filteredAlerts = alerts.filter(alert =>
    alert.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle action selection
  const handleAction = (alert, type) => {
    setSelectedAlert(alert);
    setActionType(type);
  };

  // Close patient details modal
  const closeModal = () => {
    setSelectedAlert(null);
    setActionType(null);
  };

  if (loading) {
    return (
      <RoleLayout title="Access Patients">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading alerts...</div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Access Patients">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-500" />
              Transport to Hospital or Treat at Scene
            </h2>
           
          </div>

        
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{alert.patient}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{alert.condition}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{alert.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.status === 'Resolved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleAction(alert, 'transport')}
                    >
                      Transport to Hospital
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => handleAction(alert, 'treat')}
                    >
                      Treat at Scene
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Patient Details Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={closeModal}
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4">
                {actionType === 'transport' ? 'Transport to Hospital' : 'Treat at Scene'}
              </h3>
              <div className="mb-4">
                <div className="font-semibold">Patient Details</div>
                <div className="text-gray-700">
                  <div><span className="font-medium">Name:</span> {selectedAlert.patient}</div>
                  <div><span className="font-medium">Age:</span> {selectedAlert.age}</div>
                  <div><span className="font-medium">Gender:</span> {selectedAlert.gender}</div>
                  <div><span className="font-medium">Condition:</span> {selectedAlert.condition}</div>
                  <div><span className="font-medium">Time:</span> {selectedAlert.time}</div>
                  <div><span className="font-medium">Details:</span> {selectedAlert.details}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded text-white ${
                    actionType === 'transport'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={closeModal}
                >
                  {actionType === 'transport' ? 'Confirm Transport' : 'Confirm Treatment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
      
      </div>
    </RoleLayout>
  );
};

export default AlertsManagement;