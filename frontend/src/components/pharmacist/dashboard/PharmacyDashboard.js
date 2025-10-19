// src/components/pharmacist/dashboard/PharmacyDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Pill, 
  Truck, 
  Package, 
  FileText, 
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Activity,
  Box,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    prescriptions: {
      total: 0,
      pending: 0,
      filled: 0,
      partiallyFilled: 0,
      cancelled: 0,
      expired: 0
    },
    deliveries: {
      total: 0,
      pending: 0,
      preparing: 0,
      ready: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0
    },
    inventory: {
      totalItems: 0,
      lowStock: 0,
      outOfStock: 0
    }
  });
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch prescription stats
      try {
        const prescriptionStatsResponse = await axios.get(`${API_BASE_URL}/prescriptions/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Prescription Stats Response:', prescriptionStatsResponse.data);

        if (prescriptionStatsResponse.data.success) {
          const summary = prescriptionStatsResponse.data.data?.summary || {};
          
          console.log('📊 Summary data:', summary);
          
          // Map the actual API response fields to our state structure
          // API returns: totalPrescriptions, pendingPrescriptions, filledPrescriptions, partiallyFilledPrescriptions
          setStats(prev => ({
            ...prev,
            prescriptions: {
              total: summary.totalPrescriptions || 0,
              pending: summary.pendingPrescriptions || 0,
              filled: summary.filledPrescriptions || 0,
              partiallyFilled: summary.partiallyFilledPrescriptions || 0,
              cancelled: 0, // Not provided by API
              expired: 0    // Not provided by API
            }
          }));
          
          console.log('✅ Stats updated successfully');
        }
      } catch (error) {
        console.error('❌ Failed to load prescription stats:', error);
        // Keep default values
      }

      // Fetch recent prescriptions
      try {
        const prescriptionsResponse = await axios.get(`${API_BASE_URL}/prescriptions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 5 }
        });

        if (prescriptionsResponse.data.success) {
          setRecentPrescriptions(prescriptionsResponse.data.data.prescriptions || []);
        }
      } catch (error) {
        console.error('Failed to load recent prescriptions:', error);
      }

      // Fetch delivery stats (optional - may not exist)
      try {
        const deliveryStatsResponse = await axios.get(`${API_BASE_URL}/deliveries/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Delivery Stats Response:', deliveryStatsResponse.data);

        if (deliveryStatsResponse.data.success) {
          const stats = deliveryStatsResponse.data.stats || {};
          
          console.log('📊 Delivery stats:', stats);
          
          // Map the actual API response fields
          // API returns: totalDeliveries, pendingDeliveries, inTransitDeliveries, deliveredToday
          setStats(prev => ({
            ...prev,
            deliveries: {
              total: stats.totalDeliveries || 0,
              pending: stats.pendingDeliveries || 0,
              preparing: 0, // Not provided by API
              ready: 0,     // Not provided by API
              inTransit: stats.inTransitDeliveries || 0,
              delivered: stats.deliveredToday || 0,
              cancelled: 0  // Not provided by API
            }
          }));
          
          console.log('✅ Delivery stats updated successfully');
        }
      } catch (error) {
        console.log('❌ Delivery stats not available:', error.message);
        // Set default values
        setStats(prev => ({
          ...prev,
          deliveries: {
            total: 0,
            pending: 0,
            preparing: 0,
            ready: 0,
            inTransit: 0,
            delivered: 0,
            cancelled: 0
          }
        }));
      }

      // Fetch upcoming deliveries (optional - may not exist)
      // Valid statuses: pending, preparing, ready, in_transit, delivered, cancelled
      try {
        const deliveriesResponse = await axios.get(`${API_BASE_URL}/deliveries`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'pending,preparing,ready', limit: 5 }
        });

        if (deliveriesResponse.data.success) {
          setUpcomingDeliveries(deliveriesResponse.data.data || []);
        }
      } catch (error) {
        console.log('Deliveries list not available:', error.message);
        setUpcomingDeliveries([]);
      }

      // Fetch inventory stats (optional - may not exist)
      try {
        const inventoryStatsResponse = await axios.get(`${API_BASE_URL}/inventory/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Inventory Stats Response:', inventoryStatsResponse.data);

        if (inventoryStatsResponse.data.success) {
          const summary = inventoryStatsResponse.data.data?.summary || {};
          
          console.log('📊 Inventory summary:', summary);
          
          // Map the actual API response fields
          // API returns: totalItems, lowStockItems, expiredItems, outOfStockItems, totalValue
          setStats(prev => ({
            ...prev,
            inventory: {
              totalItems: summary.totalItems || 0,
              lowStock: summary.lowStockItems || 0,
              outOfStock: summary.outOfStockItems || 0
            }
          }));
          
          console.log('✅ Inventory stats updated successfully');
        }
      } catch (error) {
        console.log('❌ Inventory stats not available:', error.message);
        // Set default values
        setStats(prev => ({
          ...prev,
          inventory: {
            totalItems: 0,
            lowStock: 0,
            outOfStock: 0
          }
        }));
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status) => {
    switch (status) {
      // Prescription statuses
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'filled': return 'text-green-600 bg-green-100';
      case 'partially_filled': return 'text-blue-600 bg-blue-100';
      
      // Delivery statuses (valid: pending, preparing, ready, in_transit, delivered, cancelled)
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <Loading text="Loading pharmacy dashboard..." />;
  }

  return (
    <RoleLayout title="Pharmacy Dashboard">
      <div className="space-y-6">
        {/* Welcome Section - Modern Gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-8 text-white overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {getTimeGreeting()}, {user?.firstName}!
                </h1>
                <p className="text-white/90 text-lg">
                  Here's what's happening with your pharmacy today
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <Calendar className="w-12 h-12 text-white mb-2" />
                  <p className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  <p className="text-xs text-white/80">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Prescriptions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                +{stats.prescriptions?.pending || 0} Pending
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Prescriptions</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.prescriptions?.total || 0}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-medium">
                {stats.prescriptions?.filled || 0} Filled
              </span>
              <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                {stats.prescriptions?.partiallyFilled || 0} Partial
              </span>
            </div>
          </div>

          {/* Deliveries */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {((stats.deliveries?.pending || 0) + (stats.deliveries?.preparing || 0))} Pending
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Deliveries</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.deliveries?.total || 0}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs font-medium">
                {stats.deliveries?.ready || 0} Ready
              </span>
              <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                {stats.deliveries?.inTransit || 0} In Transit
              </span>
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-medium">
                {stats.deliveries?.delivered || 0} Done
              </span>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Stocked
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Inventory Items</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.inventory?.totalItems || 0}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs font-medium">
                {stats.inventory?.lowStock || 0} Low
              </span>
              <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-medium">
                {stats.inventory?.outOfStock || 0} Out
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              {(stats.inventory?.lowStock || 0) > 0 && (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <h3 className="text-white/90 text-sm font-medium mb-1">Needs Attention</h3>
            <p className="text-3xl font-bold">
              {(stats.prescriptions?.pending || 0) + (stats.inventory?.lowStock || 0)}
            </p>
            <div className="mt-4">
              <p className="text-xs text-white/80">
                {stats.prescriptions?.pending || 0} pending prescriptions
              </p>
              <p className="text-xs text-white/80">
                {stats.inventory?.lowStock || 0} low stock items
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Prescriptions - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Recent Prescriptions</h2>
                      <p className="text-sm text-gray-600">Latest prescription orders</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/pharmacist/prescriptions')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {recentPrescriptions.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent prescriptions</p>
                  </div>
                ) : (
                  recentPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/pharmacist/prescriptions/${prescription.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {prescription.elder?.firstName} {prescription.elder?.lastName}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                              {prescription.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Medication:</span> {prescription.medication}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(prescription.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Pill className="w-3 h-3" />
                              {prescription.dosage}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Upcoming Deliveries - 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/pharmacist/prescriptions')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">Prescriptions</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/pharmacist/inventory')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">Inventory</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/pharmacist/deliveries')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">Deliveries</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Upcoming Deliveries */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Today's Deliveries
              </h2>
              <div className="space-y-3">
                {upcomingDeliveries.length === 0 ? (
                  <div className="py-8 text-center">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No deliveries scheduled</p>
                  </div>
                ) : (
                  upcomingDeliveries.slice(0, 5).map((delivery) => (
                    <div
                      key={delivery.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/pharmacist/deliveries/${delivery.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {delivery.elder?.firstName} {delivery.elder?.lastName}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{delivery.medication}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(delivery.deliveryDate)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {(stats.inventory?.lowStock || 0) > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Low Stock Alert
                </h3>
                <p className="text-gray-700 mb-3">
                  {stats.inventory?.lowStock || 0} items are running low on stock. Please review and reorder soon.
                </p>
                <button
                  onClick={() => navigate('/pharmacist/inventory?filter=low-stock')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium inline-flex items-center gap-2"
                >
                  Review Inventory
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default PharmacyDashboard;