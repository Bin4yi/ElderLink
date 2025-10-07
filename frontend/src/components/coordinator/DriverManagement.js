import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, Edit2, Trash2, CheckCircle, XCircle, Truck } from 'lucide-react';
import driverService from '../../services/driver';
import DriverModal from './DriverModal';
import toast from 'react-hot-toast';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
    activeDispatches: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [filterAssignment, setFilterAssignment] = useState('all'); // all, assigned, unassigned
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, [filterStatus, filterAssignment]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      
      if (filterAssignment !== 'all') {
        filters.hasAmbulance = filterAssignment === 'assigned';
      }

      console.log('🔍 Fetching drivers with filters:', filters);
      const response = await driverService.getAllDrivers(filters);
      console.log('✅ Drivers response:', response);
      setDrivers(response.data || []);
      console.log('📋 Drivers set to state:', response.data || []);
    } catch (error) {
      console.error('❌ Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching driver stats...');
      const response = await driverService.getDriverStats();
      console.log('✅ Stats response:', response);
      setStats(response.data || {
        total: 0,
        assigned: 0,
        unassigned: 0,
        activeDispatches: 0,
      });
    } catch (error) {
      console.error('❌ Error fetching driver stats:', error);
    }
  };

  const handleAddDriver = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleDeleteDriver = async (driver) => {
    if (!window.confirm(`Are you sure you want to delete driver ${driver.firstName} ${driver.lastName}?`)) {
      return;
    }

    try {
      await driverService.deleteDriver(driver.id);
      toast.success('Driver deleted successfully');
      fetchDrivers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error(error.message || 'Failed to delete driver');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleModalSuccess = () => {
    fetchDrivers();
    fetchStats();
    handleModalClose();
  };

  const filteredDrivers = drivers.filter((driver) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      driver.firstName?.toLowerCase().includes(searchLower) ||
      driver.lastName?.toLowerCase().includes(searchLower) ||
      driver.email?.toLowerCase().includes(searchLower) ||
      driver.phone?.includes(searchTerm);

    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-1">Manage ambulance drivers and assignments</p>
        </div>
        <button
          onClick={handleAddDriver}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
        >
          <UserPlus size={20} />
          Add Driver
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Drivers</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Assigned</p>
              <p className="text-3xl font-bold mt-2">{stats.assigned}</p>
            </div>
            <Truck size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Unassigned</p>
              <p className="text-3xl font-bold mt-2">{stats.unassigned}</p>
            </div>
            <UserPlus size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Rides</p>
              <p className="text-3xl font-bold mt-2">{stats.activeDispatches}</p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Assignment Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterAssignment}
              onChange={(e) => setFilterAssignment(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Assignments</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading drivers...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No drivers found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned Ambulance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users size={20} className="text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{driver.email}</div>
                      <div className="text-sm text-gray-500">{driver.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {driver.assignedAmbulance ? (
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-primary-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {driver.assignedAmbulance.vehicleNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {driver.assignedAmbulance.type}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          driver.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {driver.isActive ? (
                          <>
                            <CheckCircle size={14} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Driver"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Driver"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Driver Modal */}
      {isModalOpen && (
        <DriverModal
          driver={selectedDriver}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default DriverManagement;
