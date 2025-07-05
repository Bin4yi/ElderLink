import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import { Trash2, RotateCcw } from 'lucide-react';

const InventoryManagement = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Paracetamol', quantity: 120, status: 'Available', location: 'Warehouse A' },
    { id: 2, name: 'Amoxicillin', quantity: 60, status: 'Out of Stock', location: 'Warehouse B' },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    location: '',
  });

  const [threshold, setThreshold] = useState(10); // Automated reordering threshold

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (newItem.name && newItem.quantity && newItem.location) {
      setItems([
        ...items,
        {
          id: items.length + 1,
          name: newItem.name,
          quantity: parseInt(newItem.quantity),
          status: parseInt(newItem.quantity) > 0 ? 'Available' : 'Out of Stock',
          location: newItem.location,
        },
      ]);
      setNewItem({ name: '', quantity: '', location: '' });
    }
  };

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id, value) => {
    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: parseInt(value),
            status: parseInt(value) > 0 ? 'Available' : 'Out of Stock',
          }
        : item
    );
    setItems(updated);
  };

  const toggleStatus = (id) => {
    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            status: item.status === 'Available' ? 'Out of Stock' : 'Available',
          }
        : item
    );
    setItems(updated);
  };

  const generateReport = () => {
    console.log('Inventory Report:', items);
    alert('Inventory report generated. Check the console for details.');
  };

  const handleReorder = (id) => {
    const item = items.find((item) => item.id === id);
    if (item && item.quantity < threshold) {
      alert(`Reordering triggered for ${item.name}`);
    }
  };

  return (
    <RoleLayout title="Inventory Management">
      <div className="bg-white p-6 rounded-lg shadow space-y-10">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          {items.length === 0 ? (
            <p className="text-gray-500 italic">No inventory items available.</p>
          ) : (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                        className="border border-gray-300 px-2 py-1 rounded w-20"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{item.location}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 space-x-2">
                      <button
                        onClick={() => toggleStatus(item.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          item.status === 'Available'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {item.status === 'Available' ? 'Out of Stock' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleReorder(item.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add New Item */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Add New Inventory Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              value={newItem.name}
              onChange={handleChange}
              placeholder="Item Name"
              className="border px-4 py-2 rounded"
            />
            <input
              type="number"
              name="quantity"
              value={newItem.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border px-4 py-2 rounded"
            />
            <input
              type="text"
              name="location"
              value={newItem.location}
              onChange={handleChange}
              placeholder="Location"
              className="border px-4 py-2 rounded"
            />
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
          >
            Add Item
          </button>
        </div>

        {/* Generate Report */}
        <div className="pt-6 border-t">
          <button
            onClick={generateReport}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded"
          >
            Generate Inventory Report
          </button>
        </div>
      </div>
    </RoleLayout>
  );
};

export default InventoryManagement;
