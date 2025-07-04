// src/utils/roleMenus.js
import { 
  Home, Users, Package, Activity, Settings, User, Heart,
  Stethoscope, Calendar, FileText, Pill, Truck, Shield,
  Monitor, AlertTriangle, UserCheck, ClipboardList, BarChart3
} from 'lucide-react';

export const getRoleMenuItems = (role) => {
  switch (role) {
    case 'family_member':
      return [
        { path: '/family/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/family/elders', icon: Heart, label: 'My Elders' },
        { path: '/family/subscriptions', icon: Package, label: 'Subscriptions' },
        { path: '/family/health-reports', icon: Activity, label: 'Health Reports' },
        { path: '/family/profile', icon: User, label: 'Profile' },
        { path: '/family/settings', icon: Settings, label: 'Settings' }
      ];

    case 'admin':
      return [
        { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/packages', icon: Package, label: 'Package Management' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin/settings', icon: Settings, label: 'System Settings' }
      ];

    case 'doctor':
      return [
        { path: '/doctor/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/doctor/patients', icon: Users, label: 'Patients' },
        { path: '/doctor/consultations', icon: Stethoscope, label: 'Consultations' },
        { path: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
        { path: '/doctor/records', icon: FileText, label: 'Medical Records' },
        { path: '/doctor/profile', icon: User, label: 'Profile' }
      ];

    case 'staff':
      return [
        { path: '/staff/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/staff/care-management', icon: Heart, label: 'Care Management' },
        { path: '/staff/monitoring', icon: Monitor, label: 'Health Monitoring' },
        { path: '/staff/alerts', icon: AlertTriangle, label: 'Alerts' },
        { path: '/staff/reports', icon: FileText, label: 'Reports' },
        { path: '/staff/profile', icon: User, label: 'Profile' }
      ];

    case 'pharmacist':
      return [
        { path: '/pharmacy/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/pharmacy/medications', icon: Pill, label: 'Medications' },
        { path: '/pharmacy/prescriptions', icon: FileText, label: 'Prescriptions' },
        { path: '/pharmacy/delivery', icon: Truck, label: 'Delivery' },
        { path: '/pharmacy/inventory', icon: Package, label: 'Inventory' },
        { path: '/pharmacy/profile', icon: User, label: 'Profile' }
      ];

    default:
      return [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/profile', icon: User, label: 'Profile' },
        { path: '/settings', icon: Settings, label: 'Settings' }
      ];
  }
};