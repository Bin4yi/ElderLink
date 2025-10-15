import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ambulanceService } from '../../services/ambulance';
import AmbulanceModal from './AmbulanceModal';

const AmbulanceManagement = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    enRoute: 0,
    busy: 0,
    maintenance: 0,
  });

  useEffect(() => {
    loadAmbulances();
  }, []);

  const loadAmbulances = async () => {
    try {
      setLoading(true);
      const response = await ambulanceService.getAllAmbulances();
      setAmbulances(response.data || []);
      calculateStats(response.data || []);
    } catch (error) {
      console.error('Error loading ambulances:', error);
      toast.error('Failed to load ambulances');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ambulanceList) => {
    const stats = {
      total: ambulanceList.length,
      available: ambulanceList.filter(a => a.status === 'available').length,
      enRoute: ambulanceList.filter(a => a.status === 'en_route').length,
      busy: ambulanceList.filter(a => a.status === 'busy').length,
      maintenance: ambulanceList.filter(a => a.status === 'maintenance').length,
    };
    setStats(stats);
  };

  const handleAddAmbulance = () => {
    setSelectedAmbulance(null);
    setShowModal(true);
  };

  const handleEditAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setShowModal(true);
  };

  const handleDeleteAmbulance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ambulance?')) {
      return;
    }

    try {
      await ambulanceService.deleteAmbulance(id);
      toast.success('Ambulance deleted successfully');
      loadAmbulances();
    } catch (error) {
      console.error('Error deleting ambulance:', error);
      toast.error('Failed to delete ambulance');
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setSelectedAmbulance(null);
    if (shouldRefresh) {
      loadAmbulances();
    }
  };

  const filteredAmbulances = ambulances.filter((ambulance) => {
    const matchesSearch = 
      ambulance.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.driver?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.driver?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ambulance.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      en_route: 'bg-blue-100 text-blue-800',
      busy: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
    };

    const labels = {
      available: 'Available',
      en_route: 'En Route',
      busy: 'Busy',
      maintenance: 'Maintenance',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      basic: 'bg-gray-100 text-gray-800',
      als: 'bg-purple-100 text-purple-800',
      bls: 'bg-blue-100 text-blue-800',
      critical_care: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type?.replace('_', ' ').toUpperCase() || 'N/A'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ambulances</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              🚑
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600">{stats.available}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Route</p>
              <p className="text-3xl font-bold text-blue-600">{stats.enRoute}</p>
            </div>
            <MapPin className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Busy</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.busy}</p>
            </div>
            <XCircle className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by vehicle number or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="en_route">En Route</option>
                <option value="busy">Busy</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddAmbulance}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Ambulance
            </button>
          </div>
        </div>
      </div>

      {/* Ambulance List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAmbulances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No ambulances found matching your criteria'
                      : 'No ambulances available. Click "Add Ambulance" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredAmbulances.map((ambulance) => (
                  <tr key={ambulance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          🚑
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ambulance.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ambulance.hospital || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(ambulance.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ambulance.driver ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ambulance.driver.firstName} {ambulance.driver.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {ambulance.driver.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No driver assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ambulance.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ambulance.currentLocation?.address || 'Unknown'}
                      </div>
                      {ambulance.currentLocation?.latitude && (
                        <div className="text-xs text-gray-500">
                          {ambulance.currentLocation.latitude.toFixed(4)}, {ambulance.currentLocation.longitude.toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ambulance.equipment?.length > 0 
                          ? ambulance.equipment.slice(0, 2).join(', ') + (ambulance.equipment.length > 2 ? '...' : '')
                          : 'Standard'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditAmbulance(ambulance)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAmbulance(ambulance.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ambulance Modal */}
      {showModal && (
        <AmbulanceModal
          ambulance={selectedAmbulance}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AmbulanceManagement;
