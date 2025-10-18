// src/components/doctor/prescriptions/PrescriptionList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Plus, FileText, Calendar, User, Package, Eye, Filter, Download
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedElder, setSelectedElder] = useState('');
  const [elders, setElders] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
    fetchElders();
  }, [filterStatus, selectedElder]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (selectedElder) params.elderId = selectedElder;

      const response = await axios.get(
        `${API_BASE_URL}/prescriptions/doctor/my-prescriptions`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      if (response.data.success) {
        setPrescriptions(response.data.prescriptions);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchElders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/elders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setElders(response.data.elders);
      }
    } catch (error) {
      console.error('Error fetching elders:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      filled: 'bg-green-100 text-green-800',
      partially_filled: 'bg-blue-100 text-blue-800',
      ready_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <RoleLayout title="My Prescriptions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
            <p className="text-gray-600">Manage and track your prescriptions</p>
          </div>
          <button
            onClick={() => navigate('/doctor/prescriptions/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Prescription
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Filter className="h-4 w-4 inline mr-1" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="filled">Filled</option>
                <option value="partially_filled">Partially Filled</option>
                <option value="ready_for_delivery">Ready for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Elder
              </label>
              <select
                value={selectedElder}
                onChange={(e) => setSelectedElder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Elders</option>
                {elders.map((elder) => (
                  <option key={elder.id} value={elder.id}>
                    {elder.firstName} {elder.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setSelectedElder('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus !== 'all' || selectedElder
                ? 'Try adjusting your filters'
                : 'Create your first prescription to get started'}
            </p>
            {filterStatus === 'all' && !selectedElder && (
              <button
                onClick={() => navigate('/doctor/prescriptions/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Prescription
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prescription.prescriptionNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                          {getStatusText(prescription.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {prescription.elder?.firstName} {prescription.elder?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(prescription.createdAt).toLocaleDateString()}
                        </span>
                        {prescription.validUntil && (
                          <span className="flex items-center gap-1">
                            Valid until: {new Date(prescription.validUntil).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>

                  {/* Prescription Items */}
                  {prescription.items && prescription.items.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Package className="h-4 w-4" />
                        Medications ({prescription.items.length})
                      </div>
                      <div className="space-y-2">
                        {prescription.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                            <div>
                              <span className="font-medium text-gray-900">{item.medicationName}</span>
                              <span className="text-gray-600 ml-2">
                                {item.dosage} - {item.frequency}
                              </span>
                            </div>
                            <span className="text-gray-600">Qty: {item.quantity}</span>
                          </div>
                        ))}
                        {prescription.items.length > 3 && (
                          <div className="text-sm text-blue-600 text-center">
                            +{prescription.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Info */}
                  {prescription.deliveryRequired && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">
                        Delivery Required
                      </div>
                      {prescription.deliveryAddress && (
                        <div className="text-sm text-blue-700 mt-1">
                          {prescription.deliveryAddress}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {prescription.notes && (
                    <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded p-3">
                      <span className="font-medium">Notes:</span> {prescription.notes}
                    </div>
                  )}

                  {/* Total Amount */}
                  {prescription.totalAmount && (
                    <div className="mt-4 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        Total: LKR {parseFloat(prescription.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default PrescriptionList;
