// src/components/pharmacist/delivery/DeliverySchedule.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import {
  Truck,
  CheckCircle,
  Printer,
  Trash2,
  Bell,
  SendHorizonal
} from 'lucide-react';

const DeliverySchedule = () => {
  const [search, setSearch] = useState('');

  const [deliveries, setDeliveries] = useState([
    {
      id: 'DLV-1001',
      patient: 'Alice Lee',
      time: '12:00 PM',
      expectedDate: '2025-07-10',
      address: '123 Main Street, Colombo',
      createdAt: '2025-07-09 09:00 AM',
      status: 'Pending',
    },
    {
      id: 'DLV-1002',
      patient: 'Michael Chan',
      time: '3:30 PM',
      expectedDate: '2025-07-10',
      address: '45 Lake Road, Kandy',
      createdAt: '2025-07-09 10:15 AM',
      status: 'Pending',
    },
    {
      id: 'DLV-1003',
      patient: 'Jane Smith',
      time: '2:00 PM',
      expectedDate: '2025-07-09',
      address: '77 Flower Lane, Galle',
      createdAt: '2025-07-08 04:00 PM',
      status: 'Delivered',
    },
    {
      id: 'DLV-1004',
      patient: 'John Doe',
      time: '4:00 PM',
      expectedDate: '2025-07-10',
      address: '88 Ocean Drive, Negombo',
      createdAt: '2025-07-09 08:00 AM',
      status: 'In Transit',
    },
  ]);

  const confirmAction = (message, action) => {
    if (window.confirm(message)) action();
  };

  const filtered = deliveries.filter((d) =>
    d.patient.toLowerCase().includes(search.toLowerCase())
  );

  const startDelivery = (id) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'In Transit' } : d))
    );
  };

  const markAsDelivered = (id) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Delivered' } : d))
    );
  };

  const handleDelete = (id) => {
    confirmAction('Are you sure you want to remove this delivery record?', () => {
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    });
  };

  const handlePrint = (d) => {
    const receiptContent = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Delivery Receipt</h2>
        <p><strong>Delivery ID:</strong> ${d.id}</p>
        <p><strong>Patient:</strong> ${d.patient}</p>
        <p><strong>Delivery Time:</strong> ${d.time}</p>
        <p><strong>Expected Date:</strong> ${d.expectedDate}</p>
        <p><strong>Address:</strong> ${d.address}</p>
        <p><strong>Status:</strong> ${d.status}</p>
        <p><strong>Created At:</strong> ${d.createdAt}</p>
        <hr/>
        <p>Thank you for choosing our service.</p>
      </div>
    `;
    const newWindow = window.open('', '', 'width=600,height=400');
    newWindow.document.write('<html><head><title>Receipt</title></head><body>');
    newWindow.document.write(receiptContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
  };

  const statuses = ['Pending', 'In Transit', 'Delivered'];

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    'In Transit': 'bg-blue-100 text-blue-800',
    Delivered: 'bg-green-100 text-green-800',
  };

  const actionsByStatus = {
    Pending: (d) => [
      { label: 'Notify', icon: Bell, onClick: () => alert(`Notified ${d.patient}`), color: 'bg-blue-600' },
      { label: 'Dispatch', icon: SendHorizonal, onClick: () => startDelivery(d.id), color: 'bg-purple-600' },
      { label: 'Print', icon: Printer, onClick: () => handlePrint(d), color: 'bg-indigo-600' },
    ],
    'In Transit': (d) => [
      { label: 'Confirm Delivery', icon: CheckCircle, onClick: () => markAsDelivered(d.id), color: 'bg-emerald-600' },
    ],
    Delivered: (d) => [
      { label: 'Remove', icon: Trash2, onClick: () => handleDelete(d.id), color: 'bg-red-600' },
    ],
  };

  return (
    <RoleLayout title="Delivery Schedule">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="text-indigo-600" size={28} />
              Delivery Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage daily deliveries efficiently with real-time status updates.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search by patient name"
            className="w-full md:w-72 px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {statuses.map((status) => {
          const section = filtered.filter((d) => d.status === status);
          return (
            <section key={status} className="bg-white rounded-xl shadow-md p-6 space-y-5">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-semibold text-slate-800">{status} Deliveries</h2>
                <span className="text-sm text-slate-500">
                  {section.length} {section.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {section.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No records found.</p>
              ) : (
                <div className="space-y-4">
                  {section.map((d) => (
                    <div key={d.id} className="flex justify-between items-start bg-slate-50 hover:bg-slate-100 transition rounded-md p-4">
                      <div className="space-y-1 text-sm text-slate-700">
                        <p><strong>ID:</strong> {d.id}</p>
                        <p><strong>Patient:</strong> {d.patient}</p>
                        <p><strong>Time:</strong> {d.time} on {d.expectedDate}</p>
                        <p><strong>Address:</strong> {d.address}</p>
                        <p><strong>Created:</strong> {d.createdAt}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${statusColors[d.status]}`}>
                          {d.status}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap justify-end">
                        {actionsByStatus[status](d).map((action, idx) => (
                          <button
                            key={idx}
                            onClick={action.onClick}
                            className={`flex items-center gap-1 ${action.color} hover:opacity-90 text-white text-xs px-3 py-1.5 rounded-md`}
                          >
                            <action.icon size={14} />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </RoleLayout>
  );
};

export default DeliverySchedule;