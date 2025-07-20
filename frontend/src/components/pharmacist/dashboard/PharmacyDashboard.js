import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import {
  FileText, Users, Truck, Clock, AlertTriangle, CheckCircle, Activity, Info
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const PharmacyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard/pharmacyDashboard'); // 🔁 use your renamed route
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading pharmacy dashboard..." />;

  return (
    <RoleLayout title="Pharmacy Dashboard">
      <div className="space-y-8">

        {/* Greeting */}
        <div className="bg-gradient-to-r from-green-700 to-blue-600 rounded-xl p-6 text-white shadow-md">
          <h1 className="text-3xl font-semibold">
            Good morning, {user?.firstName} 👋
          </h1>
          <p className="text-white/90 mt-1">
            You have <strong>{stats.awaitingConfirmation}</strong> prescriptions awaiting confirmation and <strong>{stats.lowStockItems}</strong> low-stock items.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[
            { title: 'Active Prescriptions', icon: FileText, color: 'blue', value: stats.activePrescriptions },
            { title: 'Awaiting Confirmation', icon: Clock, color: 'orange', value: stats.awaitingConfirmation },
            { title: 'Low Stock Items', icon: AlertTriangle, color: 'red', value: stats.lowStockItems },
            { title: 'Total Medicines', icon: Activity, color: 'green', value: stats.totalMedicines },
            { title: 'Patients Served', icon: Users, color: 'purple', value: stats.totalPatients },
            { title: 'Deliveries Today', icon: Truck, color: 'teal', value: stats.deliveriesToday }
          ].map((item, i) => (
            <StatCard key={i} {...item} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <DashboardAction
            title="New Prescriptions"
            subtitle="Review & Verify"
            icon={<FileText className="w-6 h-6 text-blue-500" />}
            link="/pharmacist/prescriptions"
          />
          <DashboardAction
            title="Inventory"
            subtitle="Check and Update Stock"
            icon={<Activity className="w-6 h-6 text-green-600" />}
            link="/pharmacist/inventory"
          />
          <DashboardAction
            title="Deliveries"
            subtitle="View Schedule"
            icon={<Truck className="w-6 h-6 text-teal-500" />}
            link="/pharmacist/deliveries"
          />
          <DashboardAction
            title="Low Stock Alerts"
            subtitle="Take Action"
            icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
            link="/pharmacist/inventory?filter=low-stock"
          />
        </div>

        {/* Tip / Daily Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md flex items-start gap-3">
          <Info className="text-yellow-500 mt-1" />
          <div>
            <p className="font-medium">💡 Pharmacy Tip:</p>
            <p className="text-sm text-yellow-800">
              Double-check prescriptions flagged as <strong>low stock</strong> to prevent fulfillment delays.
            </p>
          </div>
        </div>

        {/* Recently Checked Prescriptions (Optional if you track them) */}
        {/* <div>
          <h3 className="text-lg font-semibold mb-3">Recently Checked Prescriptions</h3>
          <ul className="space-y-2">
            <li className="bg-white p-3 rounded shadow text-sm flex justify-between">
              Alice Johnson – <span className="text-green-600">✔ Verified</span>
            </li>
            <li className="bg-white p-3 rounded shadow text-sm flex justify-between">
              Mark Wilson – <span className="text-red-500">✖ Stock Issue</span>
            </li>
          </ul>
        </div> */}
      </div>
    </RoleLayout>
  );
};

// Stat Card Component
const StatCard = ({ title, icon: Icon, color, value }) => (
  <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
    <div className="flex items-center mb-2">
      <Icon className={`w-7 h-7 text-${color}-500`} />
      <span className="ml-3 text-sm text-gray-600">{title}</span>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value ?? 0}</p>
  </div>
);

// Quick Action Card Component
const DashboardAction = ({ title, subtitle, icon, link }) => (
  <a href={link}>
    <div className="bg-white p-5 rounded-lg shadow hover:shadow-xl transition group">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition">
          {icon}
        </div>
      </div>
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  </a>
);

export default PharmacyDashboard;
