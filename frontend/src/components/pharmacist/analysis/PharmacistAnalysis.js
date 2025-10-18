import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  Award,
  Calendar,
  DollarSign,
  Pill
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import PharmacyLayout from '../PharmacyLayout';

const API_BASE_URL = 'http://localhost:5000/api';

const PharmacistAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    topDoctors: [],
    prescriptionStats: [],
    deliveryStats: [],
    monthlyRevenue: [],
    medicationDistribution: []
  });
  const [dateRange, setDateRange] = useState('month'); // week, month, year

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch analytics data
      const [doctorsRes, prescriptionsRes, deliveriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/pharmacist/top-doctors?range=${dateRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/analytics/pharmacist/prescriptions?range=${dateRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/analytics/pharmacist/deliveries?range=${dateRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAnalyticsData({
        topDoctors: doctorsRes.data.data || [],
        prescriptionStats: prescriptionsRes.data.data?.stats || [],
        deliveryStats: deliveriesRes.data.data?.stats || [],
        monthlyRevenue: prescriptionsRes.data.data?.revenue || [],
        medicationDistribution: prescriptionsRes.data.data?.medications || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      // Set empty data on error
      setAnalyticsData({
        topDoctors: [],
        prescriptionStats: [],
        deliveryStats: [],
        monthlyRevenue: [],
        medicationDistribution: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PharmacyLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </PharmacyLayout>
    );
  }

  const hasData = analyticsData.topDoctors.length > 0 || 
                  analyticsData.prescriptionStats.length > 0 || 
                  analyticsData.deliveryStats.length > 0;

  return (
    <PharmacyLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Pharmacy Analytics
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            Comprehensive insights and performance metrics
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setDateRange('week')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              dateRange === 'week'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md transform scale-105'
                : 'text-gray-700 hover:bg-white hover:shadow-sm'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              dateRange === 'month'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md transform scale-105'
                : 'text-gray-700 hover:bg-white hover:shadow-sm'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              dateRange === 'year'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md transform scale-105'
                : 'text-gray-700 hover:bg-white hover:shadow-sm'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Prescriptions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analyticsData.prescriptionStats.reduce((sum, stat) => sum + stat.filled, 0)}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Filled successfully
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center shadow-inner">
              <Pill className="w-7 h-7 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${analyticsData.monthlyRevenue.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                From all prescriptions
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
              <DollarSign className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Deliveries Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analyticsData.deliveryStats.find(s => s.status === 'Delivered')?.count || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Package className="w-3 h-3" />
                Successfully delivered
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shadow-inner">
              <Package className="w-7 h-7 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Doctors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analyticsData.topDoctors.length}
              </p>
              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Contributing doctors
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-inner">
              <Users className="w-7 h-7 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Contributing Doctors */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Top Contributing Doctors</h2>
        </div>
        
        {analyticsData.topDoctors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No doctor data available</p>
            <p className="text-gray-400 text-sm mt-2">Start filling prescriptions to see top contributors</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Doctor Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Specialization</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Prescriptions</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topDoctors.map((doctor, index) => (
                  <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-colors duration-150">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Award className="w-6 h-6 text-yellow-500" />}
                        {index === 1 && <Award className="w-6 h-6 text-gray-400" />}
                        {index === 2 && <Award className="w-6 h-6 text-orange-600" />}
                        <span className="font-bold text-lg text-gray-900">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-sm">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">{doctor.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 font-medium">{doctor.specialization}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-red-500" />
                        <span className="font-bold text-gray-900">{doctor.prescriptions}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-green-600">${doctor.revenue.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-semibold shadow-sm">
                        <TrendingUp className="w-4 h-4" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescription Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-red-500" />
            </div>
            Prescription Trends
          </h2>
          {analyticsData.prescriptionStats.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No prescription data</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.prescriptionStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="filled" fill="#10b981" name="Filled" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Delivery Status Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            Delivery Status Distribution
          </h2>
          {analyticsData.deliveryStats.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No delivery data</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.deliveryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.deliveryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            Monthly Revenue Trend
          </h2>
          {analyticsData.monthlyRevenue.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No revenue data</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Revenue ($)"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Medication Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-purple-500" />
            </div>
            Medication Category Distribution
          </h2>
          {analyticsData.medicationDistribution.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No medication data</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.medicationDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      </div>
    </div>
    </PharmacyLayout>
  );
};

export default PharmacistAnalysis;
