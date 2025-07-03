// src/components/staff/alerts/HealthMonitoring.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { Users, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const HealthMonitoring = () => {
  // State to store alerts data
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data (in real app, this would come from API)
  useEffect(() => {
    setTimeout(() => {
      setAlerts([
        { id: 1, patient: 'John Doe', type: 'Fall Detected', status: 'Pending', time: '2024-06-01 10:15' },
        { id: 2, patient: 'Jane Smith', type: 'High Blood Pressure', status: 'Resolved', time: '2024-06-01 09:30' },
        { id: 3, patient: 'Bob Johnson', type: 'Missed Medication', status: 'Pending', time: '2024-06-01 08:45' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter alerts based on search
  const filteredAlerts = alerts.filter(alert =>
    alert.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <RoleLayout title="Emergency Alerts">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading alerts...</div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title={
      <span className="text-3xl font-bold">Emergency Alerts</span>
    }>
      
      <div className="space-y-6">
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
                    <div className="text-gray-900">{alert.type}</div>
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
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Alerts</h3>
            <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Pending Alerts</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {alerts.filter(a => a.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800">Resolved Alerts</h3>
            <p className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.status === 'Resolved').length}
            </p>
          </div>
        </div>

        {/* Notify Members Option */}
        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold mb-4">Notify Familymembers</h2>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Notify Member
          </button>
        </div>
       
      </div>
    </RoleLayout>
  );
};


export default HealthMonitoring;