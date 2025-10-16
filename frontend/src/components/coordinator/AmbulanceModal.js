import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ambulanceService } from '../../services/ambulance';

const AmbulanceModal = ({ ambulance, onClose }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    licensePlate: '',
    type: 'basic_life_support',
    status: 'available',
    driverId: '',
    hospital: '',
    capacity: 2,
    equipment: [],
    currentLocation: {
      latitude: null,
      longitude: null,
      address: '',
    },
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEquipment, setNewEquipment] = useState('');

  useEffect(() => {
    loadDrivers();
    if (ambulance) {
      setFormData({
        vehicleNumber: ambulance.vehicleNumber || '',
        licensePlate: ambulance.licensePlate || '',
        type: ambulance.type || 'basic_life_support',
        status: ambulance.status || 'available',
        driverId: ambulance.driverId || '',
        hospital: ambulance.hospital || '',
        capacity: ambulance.capacity || 2,
        equipment: ambulance.equipment || [],
        currentLocation: {
          latitude: ambulance.currentLocation?.latitude || null,
          longitude: ambulance.currentLocation?.longitude || null,
          address: ambulance.currentLocation?.address || '',
        },
      });
    }
  }, [ambulance]);

  const loadDrivers = async () => {
    try {
      console.log('📋 Loading drivers...');
      const response = await ambulanceService.getAvailableDrivers();
      console.log('✅ Drivers loaded:', response);
      setDrivers(response.data || []);
      if (!response.data || response.data.length === 0) {
        console.warn('⚠️ No drivers available');
      }
    } catch (error) {
      console.error('❌ Error loading drivers:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load drivers: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        currentLocation: {
          ...prev.currentLocation,
          [field]: field === 'address' ? value : parseFloat(value) || null,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()],
      }));
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up location data
      const cleanedData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        currentLocation: formData.currentLocation.address || formData.currentLocation.latitude
          ? formData.currentLocation
          : null,
      };

      if (ambulance) {
        await ambulanceService.updateAmbulance(ambulance.id, cleanedData);
        toast.success('Ambulance updated successfully');
      } else {
        await ambulanceService.createAmbulance(cleanedData);
        toast.success('Ambulance created successfully');
      }
      onClose(true); // true = refresh list
    } catch (error) {
      console.error('Error saving ambulance:', error);
      toast.error(error.response?.data?.message || 'Failed to save ambulance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {ambulance ? 'Edit Ambulance' : 'Add New Ambulance'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number *
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                placeholder="e.g., AMB-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate *
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                required
                placeholder="e.g., ABC-1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="basic_life_support">Basic Life Support (BLS)</option>
                <option value="advanced_life_support">Advanced Life Support (ALS)</option>
                <option value="critical_care">Critical Care Transport</option>
                <option value="air_ambulance">Air Ambulance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="available">Available</option>
                <option value="en_route">En Route</option>
                <option value="busy">Busy</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Driver
              </label>
              {drivers.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No drivers available. Please create driver accounts first.</p>
              ) : (
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName} - {driver.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital/Base Station
              </label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="e.g., City General Hospital"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="Add equipment item"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
              />
              <button
                type="button"
                onClick={handleAddEquipment}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Location (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                name="location.latitude"
                value={formData.currentLocation.latitude || ''}
                onChange={handleChange}
                placeholder="Latitude"
                step="any"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                name="location.longitude"
                value={formData.currentLocation.longitude || ''}
                onChange={handleChange}
                placeholder="Longitude"
                step="any"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                name="location.address"
                value={formData.currentLocation.address}
                onChange={handleChange}
                placeholder="Address"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (ambulance ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbulanceModal;
