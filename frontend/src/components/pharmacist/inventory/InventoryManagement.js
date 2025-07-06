// InventoryManagement.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import { InventoryContext } from '../../../context/InventoryContext';

const reorderThreshold = 10;

const InventoryManagement = () => {
  const navigate = useNavigate();
  const { items, setItems } = useContext(InventoryContext);

  // Alert for low stock
  useEffect(() => {
    const updatedItems = items.map(item => {
      if (item.quantity < reorderThreshold && !item.reorderTriggered) {
        alert(`⚠️ Reorder needed for ${item.name}`);
        return { ...item, reorderTriggered: true };
      }
      return item;
    });
    setItems(updatedItems);
  }, [items, setItems]);

  const availableItems = items.filter(item => item.quantity > 0);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  const renderTable = (title, data, color) => (
    <div className="mt-10">
      <h3 className={`text-xl font-bold mb-4 text-${color}-700`}>{title}</h3>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Expires</th>
            <th className="border px-4 py-2">Usage</th>
            <th className="border px-4 py-2">Prescribed</th>
            <th className="border px-4 py-2">Reorder Status</th>
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {[...data]
            .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
            .map((item) => {
              const isExpiringSoon =
                (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2 text-center">{item.quantity}</td>
                  <td className={`border px-4 py-2 ${isExpiringSoon ? 'text-red-600 font-semibold' : ''}`}>
                    {item.expirationDate}
                  </td>
                  <td className="border px-4 py-2">{item.usage}</td>
                  <td className="border px-4 py-2 text-center">
                    {item.prescriptionRequired ? 'Yes' : 'No'}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {item.quantity < reorderThreshold ? (
                      <span className="text-red-600 font-semibold">Reorder Needed</span>
                    ) : (
                      <span className="text-green-600">OK</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">{item.location}</td>
                  <td className="border px-4 py-2">{item.lastUpdated || '—'}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );

  return (
    <RoleLayout title="Inventory Management">
      <div className="bg-white p-6 rounded-lg shadow space-y-10">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>

        <button
          onClick={() => navigate('/pharmacist/inventory/add')}
          className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Add New Item
        </button>

        {items.length === 0 ? (
          <p className="text-gray-500 italic">No items added yet.</p>
        ) : (
          <>
            {renderTable('Available Inventory', availableItems, 'green')}
            {renderTable('Out of Stock Inventory', outOfStockItems, 'red')}
          </>
        )}
      </div>
    </RoleLayout>
  );
};

export default InventoryManagement;
