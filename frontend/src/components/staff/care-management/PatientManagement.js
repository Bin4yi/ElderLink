
// export default CareManagement;
import React, { useState, useEffect } from 'react'; 
import RoleLayout from '../../common/RoleLayout'; 
import { Users, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'; 
 
const PatientManagement = () => { 
  const [ambulanceSchedules, setAmbulanceSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data (in real app, this would come from API)
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setAmbulanceSchedules([
        { id: 1, patient: 'John Doe', pickupTime: '2024-06-10 09:00', destination: 'City Hospital', status: 'Scheduled' },
        { id: 2, patient: 'Jane Smith', pickupTime: '2024-06-10 11:30', destination: 'Community Clinic', status: 'Completed' },
        { id: 3, patient: 'Bob Johnson', pickupTime: '2024-06-11 08:15', destination: 'Downtown Medical Center', status: 'Cancelled' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter schedules based on search
  const filteredSchedules = ambulanceSchedules.filter(schedule =>
    schedule.patient.toLowerCase().includes(searchTerm.toLowerCase())
    || schedule.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <RoleLayout title="Dispatch Ambulance">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading ambulance schedules...</div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout title="Dispatch Ambulance">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-500" />
              Ambulance Dispatch Schedule
            </h2>
            
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
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
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{schedule.patient}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{schedule.pickupTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{schedule.destination}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.status === 'Scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : schedule.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.status}
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
            <h3 className="font-semibold text-blue-800">Total Schedules</h3>
            <p className="text-2xl font-bold text-blue-600">{ambulanceSchedules.length}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {ambulanceSchedules.filter(s => s.status === 'Completed').length}
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold text-red-800">Cancelled</h3>
            <p className="text-2xl font-bold text-red-600">
              {ambulanceSchedules.filter(s => s.status === 'Cancelled').length}
            </p>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};
 
export default PatientManagement; 