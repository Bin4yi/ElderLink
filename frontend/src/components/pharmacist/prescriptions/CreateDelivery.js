// src/components/pharmacist/prescriptions/CreateDelivery.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Truck, User, Calendar, MapPin, Phone, FileText, Package, Save, X, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';

const CreateDelivery = () => {
  const navigate = useNavigate();
  const { prescriptionId } = useParams();
  
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    contactPhone: '',
    scheduledDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchPrescriptionDetails();
  }, [prescriptionId]);

  const fetchPrescriptionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/prescriptions/${prescriptionId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        const prescriptionData = response.data.data.prescription;
        setPrescription(prescriptionData);
        
        // Pre-fill form with prescription data
        setFormData({
          deliveryAddress: prescriptionData.deliveryAddress || prescriptionData.elder?.address || '',
          contactPhone: prescriptionData.elder?.contactNumber || '',
          scheduledDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error fetching prescription:', error);
      toast.error('Failed to load prescription details');
      navigate('/pharmacist/prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.deliveryAddress.trim()) {
      toast.error('Please provide delivery address');
      return;
    }

    if (!formData.scheduledDate) {
      toast.error('Please select scheduled delivery date');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const deliveryData = {
        prescriptionId,
        elderId: prescription.elderId,
        deliveryAddress: formData.deliveryAddress,
        contactPhone: formData.contactPhone,
        scheduledDate: formData.scheduledDate,
        notes: formData.notes
      };

      const response = await axios.post(
        `${API_BASE_URL}/deliveries/create`,
        deliveryData,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        toast.success('Delivery created successfully!');
        navigate('/pharmacist/deliveries');
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to create delivery');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <RoleLayout title="Create Delivery">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </RoleLayout>
    );
  }

  if (!prescription) {
    return null;
  }

  return (
    <RoleLayout title="Create Delivery">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prescriptions
        </button>

        {/* Prescription Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Prescription #{prescription.prescriptionNumber}
              </h2>
              <p className="text-gray-600">
                Create delivery for this prescription
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-500">Patient</div>
              <div className="text-base text-gray-900">
                {prescription.elder?.firstName} {prescription.elder?.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Doctor</div>
              <div className="text-base text-gray-900">
                Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Total Items</div>
              <div className="text-base text-gray-900">
                {prescription.items?.length || 0} medications
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Total Amount</div>
              <div className="text-base text-gray-900 font-semibold">
                LKR {parseFloat(prescription.totalAmount || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Prescription Items */}
          {prescription.items && prescription.items.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Medications to Deliver
              </h3>
              <div className="space-y-2">
                {prescription.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{item.medicationName}</div>
                      <div className="text-sm text-gray-600">
                        {item.dosage} - {item.frequency} for {item.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">Qty: {item.quantity}</div>
                      <div className="text-sm text-gray-600">
                        LKR {parseFloat(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Delivery Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Delivery Address *
              </label>
              <textarea
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                placeholder="Enter complete delivery address..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="Enter contact number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Delivery Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions for delivery..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Delivery
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </RoleLayout>
  );
};

export default CreateDelivery;
