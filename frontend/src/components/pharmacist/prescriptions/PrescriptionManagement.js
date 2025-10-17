// src/components/pharmacist/prescriptions/PrescriptionManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FileText, Clock, CheckCircle, User, Calendar,
  Search, Eye, Package, DollarSign, Truck
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';

const PrescriptionManagement = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus, selectedPriority]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: 20,
          status: selectedStatus,
          priority: selectedPriority,
          search: searchTerm
        }
      });

      if (response.data.success) {
        setPrescriptions(response.data.data.prescriptions);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/prescriptions/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPrescriptions();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'filled': return 'text-green-600 bg-green-100';
      case 'partially_filled': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <RoleLayout title="Prescription Management">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FileText}
            title="Total Prescriptions"
            value={stats.totalPrescriptions || 0}
            color="blue"
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingPrescriptions || 0}
            color="yellow"
          />
          <StatCard
            icon={CheckCircle}
            title="Filled (7 days)"
            value={stats.filledPrescriptions || 0}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue (7 days)"
            value={`$${stats.revenue || 0}`}
            color="purple"
          />
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by prescription number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                </div>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="filled">Filled</option>
                <option value="partially_filled">Partially Filled</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-24 w-24 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">No prescriptions found</p>
              <p>No prescriptions match your current filters</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{prescription.prescriptionNumber}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                            {prescription.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(prescription.priority)}`}>
                            {prescription.priority}
                          </span>
                          {prescription.deliveryRequired && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-600">
                              <Truck className="h-3 w-3" />
                              Delivery
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {prescription.elder?.firstName} {prescription.elder?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">Patient</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {prescription.doctor?.doctorProfile?.specialization || 'Doctor'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(prescription.issuedDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">Issued Date</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {prescription.items?.length || 0} items
                              </span>
                            </div>
                            {prescription.totalAmount > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  ${prescription.totalAmount}
                                </span>
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              Valid until: {new Date(prescription.validUntil).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {prescription.items && prescription.items.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {prescription.items.slice(0, 3).map((item, index) => (
                                <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {item.medicationName}
                                </span>
                              ))}
                              {prescription.items.length > 3 && (
                                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  +{prescription.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/pharmacist/prescriptions/${prescription.id}`)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        
                        {(prescription.status === 'pending' || prescription.status === 'partially_filled') && (
                          <button
                            onClick={() => navigate(`/pharmacist/prescriptions/${prescription.id}/fill`)}
                            className="flex items-center gap-1 px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
                          >
                            <Package className="h-4 w-4" />
                            Fill
                          </button>
                        )}
                        
                        {(prescription.status === 'filled' || prescription.status === 'partially_filled') && (
                          <button
                            onClick={() => navigate(`/pharmacist/prescriptions/${prescription.id}/create-delivery`)}
                            className="flex items-center gap-1 px-3 py-1 text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition-colors"
                          >
                            <Truck className="h-4 w-4" />
                            Create Delivery
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default PrescriptionManagement;