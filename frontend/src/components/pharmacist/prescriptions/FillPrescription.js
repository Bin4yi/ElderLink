// src/components/pharmacist/prescriptions/FillPrescription.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Package, Search, CheckCircle, XCircle, AlertTriangle,
  DollarSign, Save, ArrowLeft, User, Calendar, FileText
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';

const FillPrescription = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [prescription, setPrescription] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrescription();
    fetchInventory();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const prescriptionData = response.data.data.prescription;
        setPrescription(prescriptionData);
        
        // Initialize items state with prescription items
        const initialItems = prescriptionData.items.map(item => ({
          ...item,
          selectedInventoryId: item.inventoryId || null,
          quantityToDispense: item.quantityDispensed || 0,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0,
          status: item.status || 'pending',
          searchTerm: ''
        }));
        
        setItems(initialItems);
      }
    } catch (error) {
      console.error('Error fetching prescription:', error);
      toast.error('Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'active', limit: 1000 }
      });

      if (response.data.success && response.data.data?.items) {
        setInventory(response.data.data.items);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    }
  };

  const searchInventory = (item) => {
    if (!item.searchTerm) return [];
    
    const search = item.searchTerm.toLowerCase();
    const prescribedMed = item.medicationName.toLowerCase();
    const prescribedGeneric = item.genericName?.toLowerCase() || '';
    
    return inventory.filter(inv => {
      const invName = inv.name.toLowerCase();
      const invGeneric = inv.genericName?.toLowerCase() || '';
      
      // Match by search term or auto-match similar names
      const matchesSearch = invName.includes(search) || invGeneric.includes(search);
      const matchesPrescription = invName.includes(prescribedMed) || 
                                  invGeneric.includes(prescribedGeneric) ||
                                  prescribedMed.includes(invName) ||
                                  prescribedGeneric.includes(invGeneric);
      
      return matchesSearch || matchesPrescription;
    }).slice(0, 10); // Limit to 10 results
  };

  const selectInventoryItem = (index, inventoryItem) => {
    const updated = [...items];
    updated[index].selectedInventoryId = inventoryItem.id;
    updated[index].unitPrice = parseFloat(inventoryItem.sellingPrice || inventoryItem.costPrice || 0);
    updated[index].quantityToDispense = Math.min(
      updated[index].quantityPrescribed,
      inventoryItem.quantity
    );
    updated[index].totalPrice = updated[index].unitPrice * updated[index].quantityToDispense;
    updated[index].status = inventoryItem.quantity >= updated[index].quantityPrescribed ? 'filled' : 'partially_filled';
    updated[index].availableStock = inventoryItem.quantity;
    updated[index].selectedInventoryName = inventoryItem.name;
    updated[index].searchTerm = '';
    setItems(updated);
    toast.success('Medication matched');
  };

  const markAsOutOfStock = (index) => {
    const updated = [...items];
    updated[index].status = 'out_of_stock';
    updated[index].quantityToDispense = 0;
    updated[index].totalPrice = 0;
    setItems(updated);
    toast.info('Marked as out of stock');
  };

  const updateItemField = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    
    // Recalculate total if quantity or price changes
    if (field === 'quantityToDispense' || field === 'unitPrice') {
      const qty = parseFloat(updated[index].quantityToDispense) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].totalPrice = (qty * price).toFixed(2);
      
      // Update status based on quantity
      if (qty === 0) {
        updated[index].status = 'out_of_stock';
      } else if (qty < updated[index].quantityPrescribed) {
        updated[index].status = 'partially_filled';
      } else {
        updated[index].status = 'filled';
      }
    }
    
    setItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleSubmit = async () => {
    // Validation - check if all items have status and required fields
    const hasIncompleteItems = items.some(item => {
      // If status is pending or filled/partially_filled, need quantity and price
      if (item.status === 'pending') {
        return true; // Must select a status
      }
      if ((item.status === 'filled' || item.status === 'partially_filled')) {
        return !item.quantityToDispense || !item.unitPrice;
      }
      return false; // out_of_stock is okay
    });
    
    if (hasIncompleteItems) {
      toast.error('Please fill in quantity and price for all medications, or mark them as out of stock');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const totals = calculateTotals();
      
      const fillData = {
        items: items.map(item => ({
          id: item.id,
          inventoryId: item.selectedInventoryId || null, // Inventory ID is optional
          quantityDispensed: parseFloat(item.quantityToDispense) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: parseFloat(item.totalPrice) || 0,
          status: item.status,
          notes: item.notes || ''
        })),
        totalAmount: parseFloat(totals.total)
      };

      const response = await axios.post(
        `${API_BASE_URL}/prescriptions/${id}/fill`,
        fillData,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        toast.success('Prescription filled successfully!');
        navigate('/pharmacist/prescriptions');
      }
    } catch (error) {
      console.error('Error filling prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to fill prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'filled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600">
          <CheckCircle className="h-3 w-3" /> Filled
        </span>;
      case 'partially_filled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-600">
          <AlertTriangle className="h-3 w-3" /> Partially Filled
        </span>;
      case 'out_of_stock':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
          <XCircle className="h-3 w-3" /> Out of Stock
        </span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
          Pending
        </span>;
    }
  };

  if (loading) {
    return (
      <RoleLayout title="Fill Prescription">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </RoleLayout>
    );
  }

  if (!prescription) {
    return (
      <RoleLayout title="Fill Prescription">
        <div className="text-center py-12">
          <p className="text-gray-600">Prescription not found</p>
          <button
            onClick={() => navigate('/pharmacist/prescriptions')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Prescriptions
          </button>
        </div>
      </RoleLayout>
    );
  }

  const totals = calculateTotals();

  return (
    <RoleLayout title="Fill Prescription">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/pharmacist/prescriptions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Prescriptions
          </button>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">#{prescription.prescriptionNumber}</h2>
            <p className="text-sm text-gray-600">Issued: {new Date(prescription.issuedDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Prescription Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Patient</p>
                <p className="text-lg font-semibold text-gray-900">
                  {prescription.elder?.firstName} {prescription.elder?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Prescribed By</p>
                <p className="text-lg font-semibold text-gray-900">
                  Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valid Until</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(prescription.validUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {prescription.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Prescription Notes</p>
                  <p className="text-gray-900">{prescription.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Medications to Fill ({items.length})
            </h3>
            
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Options:</p>
                  <p className="text-blue-700">
                    <strong>Search Inventory</strong> to track stock, <strong>Manual Entry</strong> for items not in inventory, or <strong>Out of Stock</strong> if unavailable
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {items.map((item, index) => {
              const searchResults = searchInventory(item);
              
              return (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{item.medicationName}</h4>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {item.genericName && (
                          <div>
                            <span className="font-medium text-gray-600">Generic:</span> {item.genericName}
                          </div>
                        )}
                        {item.strength && (
                          <div>
                            <span className="font-medium text-gray-600">Strength:</span> {item.strength}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-600">Dosage:</span> {item.dosage}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Prescribed Qty:</span> {item.quantityPrescribed}
                        </div>
                        {item.frequency && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-600">Frequency:</span> {item.frequency}
                          </div>
                        )}
                        {item.duration && (
                          <div>
                            <span className="font-medium text-gray-600">Duration:</span> {item.duration}
                          </div>
                        )}
                        {item.instructions && (
                          <div className="col-span-2 md:col-span-4">
                            <span className="font-medium text-gray-600">Instructions:</span> {item.instructions}
                          </div>
                        )}
                        <div className="col-span-2 md:col-span-4">
                          <span className={`font-medium ${item.substitutionAllowed ? 'text-green-600' : 'text-red-600'}`}>
                            Substitution: {item.substitutionAllowed ? 'Allowed' : 'Not Allowed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Search */}
                  {item.status === 'pending' && !item.selectedInventoryId && (
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder={`Search inventory for ${item.medicationName}...`}
                          value={item.searchTerm}
                          onChange={(e) => updateItemField(index, 'searchTerm', e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        />
                      </div>
                      
                      {searchResults.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                          {searchResults.map(invItem => (
                            <div
                              key={invItem.id}
                              onClick={() => selectInventoryItem(index, invItem)}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-900">{invItem.name}</div>
                                  {invItem.genericName && (
                                    <div className="text-sm text-gray-600">Generic: {invItem.genericName}</div>
                                  )}
                                  <div className="text-sm text-gray-600">
                                    Stock: {invItem.quantity} {invItem.unit} | {invItem.category}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">
                                    LKR {parseFloat(invItem.sellingPrice || invItem.costPrice).toFixed(2)}
                                  </div>
                                  <button className="text-sm text-blue-600 hover:text-blue-700">
                                    Select
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...items];
                            updated[index].selectedInventoryId = 'manual'; // Mark as manual entry
                            updated[index].quantityToDispense = updated[index].quantityPrescribed;
                            updated[index].unitPrice = 0;
                            updated[index].totalPrice = 0;
                            updated[index].status = 'filled';
                            setItems(updated);
                            toast.info('Enter price and quantity manually');
                          }}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          Manual Entry (Not in Inventory)
                        </button>
                        <button
                          type="button"
                          onClick={() => markAsOutOfStock(index)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                        >
                          Mark as Out of Stock
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected Inventory Item or Manual Entry */}
                  {item.selectedInventoryId && (
                    <div className={`${item.selectedInventoryId === 'manual' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          {item.selectedInventoryId === 'manual' ? (
                            <>
                              <p className="font-medium text-purple-900">Manual Entry</p>
                              <p className="text-sm text-purple-700">Not tracked in inventory</p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-blue-900">Matched Inventory Item</p>
                              <p className="text-sm text-blue-700">{item.selectedInventoryName}</p>
                              {item.availableStock && (
                                <p className="text-sm text-blue-600">Available: {item.availableStock}</p>
                              )}
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const updated = [...items];
                            updated[index].selectedInventoryId = null;
                            updated[index].status = 'pending';
                            updated[index].quantityToDispense = 0;
                            updated[index].unitPrice = 0;
                            updated[index].totalPrice = 0;
                            setItems(updated);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Change
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity to Dispense *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.availableStock || item.quantityPrescribed}
                            value={item.quantityToDispense}
                            onChange={(e) => updateItemField(index, 'quantityToDispense', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price (LKR) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItemField(index, 'unitPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Price (LKR)
                          </label>
                          <input
                            type="text"
                            value={item.totalPrice}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Out of Stock */}
                  {item.status === 'out_of_stock' && !item.selectedInventoryId && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <p className="font-medium text-red-900">Medication not available in stock</p>
                        </div>
                        <button
                          onClick={() => {
                            const updated = [...items];
                            updated[index].status = 'pending';
                            setItems(updated);
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Undo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Bill Summary
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>LKR {totals.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (10%):</span>
              <span>LKR {totals.tax}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span>LKR {totals.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/pharmacist/prescriptions')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Complete & Send Bill
              </>
            )}
          </button>
        </div>
      </div>
    </RoleLayout>
  );
};

export default FillPrescription;
