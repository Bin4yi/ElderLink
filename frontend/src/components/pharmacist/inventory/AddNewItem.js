import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryContext } from '../../../context/InventoryContext';
import toast from 'react-hot-toast';

const AddNewItem = () => {
  const navigate = useNavigate();
  const { fetchItems } = useContext(InventoryContext);

  const [form, setForm] = useState({
    name: '',
    quantity: '',
    expirationDate: '',
    usage: '',
    prescriptionRequired: false,
    location: '',
    notes: '',
    price: ''
  });

  const [daysLeft, setDaysLeft] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'expirationDate') {
      const today = new Date();
      const expiry = new Date(value);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays);
    }

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert numeric fields correctly
    const newItem = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    try {
      const res = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      const data = await res.json();
      console.log('✅ Item added:', data);

      await fetchItems();

      toast.success('✅ Medicine added successfully!');
      navigate('/pharmacist/inventory');
    } catch (error) {
      console.error('❌ Error adding item:', error);
      toast.error('Error adding item: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700 text-center">➕ Add New Medicine</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g., Paracetamol"
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Quantity</label>
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          placeholder="e.g., 100"
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
        <input
          name="expirationDate"
          type="date"
          value={form.expirationDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {form.expirationDate && (
          <p className={`text-sm mt-1 ${daysLeft <= 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            {daysLeft <= 0
              ? '⚠️ Expired or expiring today!'
              : `📅 ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining until expiration.`}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Usage Instructions</label>
        <input
          name="usage"
          value={form.usage}
          onChange={handleChange}
          placeholder="e.g., 1 tablet every 6 hours"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          name="prescriptionRequired"
          checked={form.prescriptionRequired}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="text-sm text-gray-700">Prescription Required?</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location in Store</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g., Shelf A2"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Price per Unit (Rs)</label>
        <input
          type="number"
          name="price"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150"
      >
        ➕ Add Medicine
      </button>
    </form>
  );
};

export default AddNewItem;
