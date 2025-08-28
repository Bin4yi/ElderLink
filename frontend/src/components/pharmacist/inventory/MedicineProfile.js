// src/components/pharmacist/inventory/MedicineProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Package, DollarSign, Calendar, MapPin, AlertTriangle,
  Edit2, Trash2, Plus, TrendingUp, Activity, Clock, User
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5005/api';

const MedicineProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: '',
    type: 'add',
    notes: ''
  });

  useEffect(() => {
    fetchMedicineDetails();
  }, [id]);

  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setItem(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching medicine details:', error);
      toast.error('Failed to fetch medicine details');
      navigate('/pharmacist/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!stockAdjustment.quantity || parseInt(stockAdjustment.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newQuantity = stockAdjustment.type === 'add' 
        ? item.quantity + parseInt(stockAdjustment.quantity)
        : Math.max(0, item.quantity - parseInt(stockAdjustment.quantity));

      await axios.put(`${API_BASE_URL}/inventory/${id}`, {
        quantity: newQuantity,
        adjustmentNotes: stockAdjustment.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Stock adjusted successfully');
      setShowStockModal(false);
      setStockAdjustment({ quantity: '', type: 'add', notes: '' });
      fetchMedicineDetails();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to adjust stock');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Medicine deleted successfully');
      navigate('/pharmacist/inventory');
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error('Failed to delete medicine');
    }
  };

  const getStockStatus = () => {
    if (item.quantity === 0) return { text: 'Out of Stock', color: 'red' };
    if (item.quantity <= item.minStockLevel) return { text: 'Low Stock', color: 'orange' };
    return { text: 'In Stock', color: 'green' };
  };

  const getExpirationStatus = () => {
    const daysUntilExpiry = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { text: 'Expired', color: 'red' };
    if (daysUntilExpiry <= 30) return { text: 'Expiring Soon', color: 'orange' };
    return { text: 'Valid', color: 'green' };
  };

  if (loading) {
    return (
      <RoleLayout title="Medicine Details">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </RoleLayout>
    );
  }

  if (!item) {
    return (
      <RoleLayout title="Medicine Details">
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Medicine not found</h3>
          <p className="text-gray-500">The requested medicine could not be found.</p>
        </div>
      </RoleLayout>
    );
  }

  const stockStatus = getStockStatus();
  const expirationStatus = getExpirationStatus();

  return (
    <RoleLayout title="Medicine Details">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pharmacist/inventory')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowStockModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Adjust Stock
            </button>
            <button
              onClick={() => navigate(`/pharmacist/inventory/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{item.name}</h1>
                <p className="text-blue-100">
                  {item.genericName && `${item.genericName} • `}
                  {item.strength && `${item.strength} • `}
                  {item.brand && item.brand}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  stockStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                  stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stockStatus.text}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stock Information */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{item.quantity}</div>
                      <div className="text-sm text-gray-600">{item.unit} available</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${item.sellingPrice}</div>
                      <div className="text-sm text-gray-600">Selling price</div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-4 rounded-lg ${
                    expirationStatus.color === 'green' ? 'bg-green-50' :
                    expirationStatus.color === 'orange' ? 'bg-orange-50' : 'bg-red-50'
                  }`}>
                    <Calendar className={`h-8 w-8 ${
                      expirationStatus.color === 'green' ? 'text-green-600' :
                      expirationStatus.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                    }`} />
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(item.expirationDate).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${
                        expirationStatus.color === 'green' ? 'text-green-600' :
                        expirationStatus.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {expirationStatus.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{item.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manufacturer:</span>
                        <span className="font-medium">{item.manufacturer || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch Number:</span>
                        <span className="font-medium">{item.batchNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{item.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prescription Required:</span>
                        <span className={`font-medium ${item.prescriptionRequired ? 'text-red-600' : 'text-green-600'}`}>
                          {item.prescriptionRequired ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Stock</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Price:</span>
                        <span className="font-medium">${item.costPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit Margin:</span>
                        <span className="font-medium text-green-600">
                          ${(item.sellingPrice - item.costPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Stock Level:</span>
                        <span className="font-medium">{item.minStockLevel} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Sold:</span>
                        <span className="font-medium">{item.totalSold} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-medium">${(item.quantity * item.sellingPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                {(item.description || item.dosageInstructions || item.sideEffects) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
                    <div className="space-y-4">
                      {item.description && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      )}
                      {item.dosageInstructions && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Dosage Instructions</h4>
                          <p className="text-gray-600 text-sm">{item.dosageInstructions}</p>
                        </div>
                      )}
                      {item.sideEffects && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Side Effects</h4>
                          <p className="text-gray-600 text-sm">{item.sideEffects}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {item.transactions && item.transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {item.transactions.map((transaction, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'stock_in' ? 'bg-green-100' :
                        transaction.type === 'stock_out' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <Activity className={`h-4 w-4 ${
                          transaction.type === 'stock_in' ? 'text-green-600' :
                          transaction.type === 'stock_out' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.reason}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.performer?.firstName} {transaction.performer?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'stock_in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'stock_in' ? '+' : '-'}{transaction.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {transaction.notes && (
                    <p className="mt-2 text-sm text-gray-600 ml-11">{transaction.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {showStockModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                  Adjust Stock
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjustment Type
                    </label>
                    <select
                      value={stockAdjustment.type}
                      onChange={(e) => setStockAdjustment({...stockAdjustment, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="add">Add Stock</option>
                      <option value="remove">Remove Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stockAdjustment.quantity}
                      onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={stockAdjustment.notes}
                      onChange={(e) => setStockAdjustment({...stockAdjustment, notes: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Reason for adjustment..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStockAdjustment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Adjust Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};


export default MedicineProfile;