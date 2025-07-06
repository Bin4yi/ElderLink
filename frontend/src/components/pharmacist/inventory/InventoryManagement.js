import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import { InventoryContext } from '../../../context/InventoryContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const reorderThreshold = 10;

const InventoryManagement = () => {
  const navigate = useNavigate();
  const { items, setItems } = useContext(InventoryContext);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Analytics Calculations

  // 1. Weekly trends: sum usageCount of items used in last 7 days
  // assuming each item has a usageLog = [{ date: '2025-07-01', count: 3 }, ...]
  // For demonstration, we’ll simulate usageLog if it doesn’t exist

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // Flatten usage counts in last 7 days
  const weeklyUsageCount = items.reduce((total, item) => {
    if (!item.usageLog) return total;
    const countInWeek = item.usageLog.reduce((sum, usage) => {
      const usageDate = new Date(usage.date);
      if (usageDate >= sevenDaysAgo && usageDate <= today) {
        return sum + usage.count;
      }
      return sum;
    }, 0);
    return total + countInWeek;
  }, 0);

  // 2. Top used meds: top 5 by total usage count
  // total usage count = sum of usageLog counts or fallback to item.usageCount
  const medsWithUsage = items.map(item => {
    let totalUsage = 0;
    if (item.usageLog) {
      totalUsage = item.usageLog.reduce((sum, usage) => sum + usage.count, 0);
    } else if (item.usageCount) {
      totalUsage = item.usageCount;
    }
    return { name: item.name, usage: totalUsage };
  });

  const topUsedMeds = medsWithUsage
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 5);

  // 3. Monthly stats: total quantity used in current month
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyUsageCount = items.reduce((total, item) => {
    if (!item.usageLog) return total;
    const countInMonth = item.usageLog.reduce((sum, usage) => {
      const usageDate = new Date(usage.date);
      if (
        usageDate.getMonth() === currentMonth &&
        usageDate.getFullYear() === currentYear
      ) {
        return sum + usage.count;
      }
      return sum;
    }, 0);
    return total + countInMonth;
  }, 0);

  // Render Analytics Section
  const renderAnalytics = () => (
    <div className="mt-12 bg-gray-50 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Trends */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">Weekly Usage Trends</h3>
          <p className="text-3xl font-bold text-blue-600">{weeklyUsageCount}</p>
          <p className="text-gray-600 text-sm">Total items used in last 7 days</p>
        </div>

        {/* Top Used Medicines */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">Top Used Medicines</h3>
          <ol className="list-decimal list-inside text-gray-700">
            {topUsedMeds.length === 0 ? (
              <p className="italic text-gray-400">No usage data available</p>
            ) : (
              topUsedMeds.map((med, idx) => (
                <li key={idx} className="mb-1">
                  {med.name} — <span className="font-semibold">{med.usage}</span> uses
                </li>
              ))
            )}
          </ol>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">Monthly Usage Stats</h3>
          <p className="text-3xl font-bold text-green-600">{monthlyUsageCount}</p>
          <p className="text-gray-600 text-sm">Total items used this month</p>
        </div>
      </div>
    </div>
  );

  const availableItems = items.filter(item => item.quantity > 0);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  const filteredAvailableItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOutOfStockItems = outOfStockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Inventory Report', 14, 22);

    const tableColumn = [
      'Name',
      'Quantity',
      'Expires',
      'Usage',
      'Prescribed',
      'Reorder Status',
      'Location'
    ];

    const tableRows = items.map(item => [
      item.name,
      item.quantity,
      item.expirationDate,
      item.usage || '-',
      item.prescriptionRequired ? 'Yes' : 'No',
      item.quantity < reorderThreshold ? 'Reorder Needed' : 'OK',
      item.location
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30
    });

    doc.save(`inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const renderTable = (title, data, color) => (
    <div className="mt-10">
      <h3 className={`text-xl font-bold mb-4 text-${color}-700`}>{title}</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 italic">No matching items found or not currently available.</p>
      ) : (
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
                  <tr key={item.id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/pharmacist/inventory/${item.id}`)}>
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
      )}
    </div>
  );

  return (
    <RoleLayout title="Inventory Management">
      <div className="bg-white p-6 rounded-lg shadow space-y-10">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>

        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="🔍 Search medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded w-1/2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <div>
            <button
              onClick={() => navigate('/pharmacist/inventory/add')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ➕ Add New Item
            </button>
            <button
              onClick={generateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ml-2"
            >
              📄 Generate Report
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 italic">No items added yet.</p>
        ) : (
          <>
            {renderTable('Available Inventory', filteredAvailableItems, 'green')}
            {renderTable('Out of Stock Inventory', filteredOutOfStockItems, 'red')}
            {renderAnalytics()}
          </>
        )}
      </div>
    </RoleLayout>
  );
};

export default InventoryManagement;
