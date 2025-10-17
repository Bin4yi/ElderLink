const fs = require('fs');
const path = require('path');

const content = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Truck, Package, Clock, CheckCircle, MapPin, Search, FileText, Eye,
  User, Phone, RefreshCw, Mail, ArrowRight, Calendar
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';

const DeliverySchedule = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    deliveredToday: 0
  });
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    fetchDeliveries();
    fetchStats();
  }, [selectedStatus, selectedDate]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedDate) params.date = selectedDate;

      const response = await axios.get(\`\${API_BASE_URL}/deliveries\`, {
        headers: { Authorization: \`Bearer \${token}\` },
        params
      });

      if (response.data.success) {
        setDeliveries(response.data.deliveries);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(\`\${API_BASE_URL}/deliveries/stats\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      setUpdating(deliveryId);
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        \`\${API_BASE_URL}/deliveries/\${deliveryId}/status\`,
        { status: newStatus },
        { headers: { Authorization: \`Bearer \${token}\` }}
      );

      if (response.data.success) {
        const statusText = newStatus.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        toast.success(\`Delivery status updated to \${statusText}!\`);
        
        if (newStatus === 'delivered') {
          toast.success('Email notification sent to family member!', {
            duration: 4000,
            icon: '📧'
          });
        }
        
        fetchDeliveries();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error(error.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setUpdating(null);
    }
  };

  const getNextStatus = (currentStatus) => {
    const workflow = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'in_transit',
      'in_transit': 'delivered'
    };
    return workflow[currentStatus];
  };

  const getStatusText = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filtered = deliveries.filter((d) => {
    const patientName = \`\${d.elder?.firstName || ''} \${d.elder?.lastName || ''}\`.toLowerCase();
    const matchesSearch = patientName.includes(search.toLowerCase()) || 
                         d.deliveryNumber?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-700 bg-yellow-100',
      'preparing': 'text-blue-700 bg-blue-100',
      'ready': 'text-purple-700 bg-purple-100',
      'in_transit': 'text-indigo-700 bg-indigo-100',
      'delivered': 'text-green-700 bg-green-100',
      'cancelled': 'text-red-700 bg-red-100'
    };
    return colors[status] || 'text-gray-700 bg-gray-100';
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={\`p-3 rounded-full bg-\${color}-100 mr-4\`}>
          <Icon className={\`h-6 w-6 text-\${color}-600\`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <RoleLayout title="Delivery Management">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Package} title="Total Deliveries" value={stats.totalDeliveries} color="blue" />
          <StatCard icon={Clock} title="Pending" value={stats.pendingDeliveries} color="yellow" />
          <StatCard icon={Truck} title="In Transit" value={stats.inTransitDeliveries} color="indigo" />
          <StatCard icon={CheckCircle} title="Delivered Today" value={stats.deliveredToday} color="green" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by patient or delivery number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => { setSearch(''); setSelectedStatus('all'); setSelectedDate(''); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={() => { fetchDeliveries(); fetchStats(); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading deliveries...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium mb-2">No deliveries found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((delivery) => (
                <div key={delivery.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{delivery.deliveryNumber}</h3>
                        <span className={\`px-3 py-1 text-xs font-semibold rounded-full \${getStatusColor(delivery.status)}\`}>
                          {getStatusText(delivery.status)}
                        </span>
                        {delivery.status === 'delivered' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            <Mail className="h-3 w-3" />
                            Email Sent
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{delivery.elder?.firstName} {delivery.elder?.lastName}</p>
                            <p className="text-xs text-gray-500">Patient</p>
                          </div>
                        </div>
                        {delivery.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{delivery.contactPhone}</p>
                              <p className="text-xs text-gray-500">Contact</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{new Date(delivery.scheduledDate).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">Scheduled</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <p className="text-sm text-gray-600">{delivery.deliveryAddress}</p>
                      </div>
                      {delivery.prescription && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {delivery.prescription.prescriptionNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {delivery.prescription.items?.length || 0} items
                          </span>
                          {delivery.estimatedValue && (
                            <span className="font-medium">LKR {parseFloat(delivery.estimatedValue).toFixed(2)}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => navigate(\`/pharmacist/deliveries/\${delivery.id}\`)}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, getNextStatus(delivery.status))}
                          disabled={updating === delivery.id}
                          className="flex items-center gap-1 px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 disabled:opacity-50"
                        >
                          {updating === delivery.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4" />
                              {getStatusText(getNextStatus(delivery.status))}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default DeliverySchedule;
`;

const filePath = path.join(__dirname, '../../frontend/src/components/pharmacist/delivery/DeliverySchedule.js');
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ DeliverySchedule.js created successfully!');
console.log('File size:', fs.statSync(filePath).size, 'bytes');
