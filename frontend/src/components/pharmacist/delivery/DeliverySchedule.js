// src/components/pharmacist/delivery/DeliverySchedule.js
import React, { useState } from 'react';
import RoleLayout from '../../common/RoleLayout';
import {
  Truck, Package, Clock, CheckCircle, AlertTriangle, MapPin,
  Search, Filter, Plus, FileText, Download, Eye, Edit2, 
  Trash2, Calendar, DollarSign, Bell, SendHorizonal, Printer,
  User, Phone, Navigation
} from 'lucide-react';

const DeliverySchedule = () => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

  const [deliveries, setDeliveries] = useState([
    {
      id: 'DLV-1001',
      patient: 'Alice Lee',
      phone: '+94 77 123 4567',
      time: '12:00 PM',
      expectedDate: '2025-07-10',
      address: '123 Main Street, Colombo 07',
      createdAt: '2025-07-09 09:00 AM',
      status: 'Pending',
      priority: 'High',
      items: ['Panadol 500mg x10', 'Vitamin D3 x30'],
      estimatedValue: 450.00,
      driver: null
    },
    {
      id: 'DLV-1002',
      patient: 'Michael Chan',
      phone: '+94 71 456 7890',
      time: '3:30 PM',
      expectedDate: '2025-07-10',
      address: '45 Lake Road, Kandy',
      createdAt: '2025-07-09 10:15 AM',
      status: 'Pending',
      priority: 'Medium',
      items: ['Aspirin 75mg x90', 'Metformin 500mg x60'],
      estimatedValue: 780.00,
      driver: null
    },
    {
      id: 'DLV-1003',
      patient: 'Jane Smith',
      phone: '+94 76 789 0123',
      time: '2:00 PM',
      expectedDate: '2025-07-09',
      address: '77 Flower Lane, Galle',
      createdAt: '2025-07-08 04:00 PM',
      status: 'Delivered',
      priority: 'Low',
      items: ['Omega-3 x60', 'Calcium tablets x30'],
      estimatedValue: 320.00,
      driver: 'Kamal Perera'
    },
    {
      id: 'DLV-1004',
      patient: 'John Doe',
      phone: '+94 75 234 5678',
      time: '4:00 PM',
      expectedDate: '2025-07-10',
      address: '88 Ocean Drive, Negombo',
      createdAt: '2025-07-09 08:00 AM',
      status: 'In Transit',
      priority: 'High',
      items: ['Insulin 100IU x5', 'Test strips x100'],
      estimatedValue: 1250.00,
      driver: 'Sunil Silva'
    },
  ]);

  // Calculate statistics
  const stats = {
    totalDeliveries: deliveries.length,
    pendingDeliveries: deliveries.filter(d => d.status === 'Pending').length,
    inTransitDeliveries: deliveries.filter(d => d.status === 'In Transit').length,
    deliveredToday: deliveries.filter(d => d.status === 'Delivered' && d.expectedDate === '2025-07-09').length,
    totalValue: deliveries.reduce((sum, d) => sum + d.estimatedValue, 0).toFixed(2)
  };

  const confirmAction = (message, action) => {
    if (window.confirm(message)) action();
  };

  const filtered = deliveries.filter((d) => {
    const matchesSearch = d.patient.toLowerCase().includes(search.toLowerCase()) || 
                         d.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
    const matchesDate = selectedDate === 'all' || d.expectedDate === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const startDelivery = (id) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'In Transit', driver: 'Assigned Driver' } : d))
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
      <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 5px;">ElderLink Pharmacy</h1>
          <h2 style="color: #6366f1; margin: 0;">Delivery Receipt</h2>
        </div>
        
        <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Delivery Information</h3>
          <p><strong>Delivery ID:</strong> ${d.id}</p>
          <p><strong>Patient:</strong> ${d.patient}</p>
          <p><strong>Phone:</strong> ${d.phone}</p>
          <p><strong>Delivery Time:</strong> ${d.time}</p>
          <p><strong>Expected Date:</strong> ${d.expectedDate}</p>
          <p><strong>Address:</strong> ${d.address}</p>
          <p><strong>Status:</strong> ${d.status}</p>
          <p><strong>Priority:</strong> ${d.priority}</p>
          <p><strong>Driver:</strong> ${d.driver || 'Not Assigned'}</p>
        </div>
        
        <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Items</h3>
          <ul>
            ${d.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <p style="margin-top: 15px;"><strong>Estimated Value: LKR ${d.estimatedValue.toFixed(2)}</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Thank you for choosing ElderLink Pharmacy</p>
          <p style="color: #9ca3af; font-size: 12px;">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    const newWindow = window.open('', '', 'width=800,height=600');
    newWindow.document.write('<html><head><title>Delivery Receipt</title></head><body>');
    newWindow.document.write(receiptContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-orange-600 bg-orange-100';
      case 'In Transit': return 'text-blue-600 bg-blue-100';
      case 'Delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <RoleLayout title="Delivery Schedule">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Package}
            title="Total Deliveries"
            value={stats.totalDeliveries}
            color="blue"
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingDeliveries}
            color="orange"
          />
          <StatCard
            icon={Truck}
            title="In Transit"
            value={stats.inTransitDeliveries}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            title="Delivered Today"
            value={stats.deliveredToday}
            color="green"
          />
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by patient name or delivery ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                </div>
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>

              <input
                type="date"
                value={selectedDate === 'all' ? '' : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value || 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="h-4 w-4" />
                Schedule Delivery
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <FileText className="h-4 w-4" />
                Daily Report
              </button>
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Truck className="h-24 w-24 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">No deliveries found</p>
              <p>Schedule some deliveries to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {delivery.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.items.length} item{delivery.items.length > 1 ? 's' : ''}
                          </div>
                          {delivery.driver && (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {delivery.driver}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {delivery.patient}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {delivery.phone}
                          </div>
                          <div className="text-xs text-gray-400 flex items-start gap-1 mt-1">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{delivery.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {delivery.expectedDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.time}
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {delivery.createdAt.split(' ')[0]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                            {delivery.status}
                          </span>
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(delivery.priority)}`}>
                              {delivery.priority} Priority
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          LKR {delivery.estimatedValue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {delivery.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => alert(`Notified ${delivery.patient}`)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Notify Patient"
                              >
                                <Bell className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => startDelivery(delivery.id)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Start Delivery"
                              >
                                <SendHorizonal className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {delivery.status === 'In Transit' && (
                            <button
                              onClick={() => markAsDelivered(delivery.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Delivered"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handlePrint(delivery)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Print Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => alert(`Viewing details for ${delivery.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {delivery.status === 'Delivered' && (
                            <button
                              onClick={() => handleDelete(delivery.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default DeliverySchedule;