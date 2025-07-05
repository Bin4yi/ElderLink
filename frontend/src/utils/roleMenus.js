// src/utils/roleMenus.js
import { 
  Home, Users, Package, Activity, Settings, User, Heart,
  Stethoscope, Calendar, FileText, Pill, Truck, Shield,
  Monitor, AlertTriangle, UserCheck, ClipboardList, BarChart3,
  Brain // NEW: Icon for mental health
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
{ path: '/staff/care', icon: Heart, label: 'Dispatch' },
{ path: '/staff/monitoring', icon: Monitor, label: 'Access Patients' },
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

    // NEW: Mental Health Consultant Menu
    case 'mental_health_consultant':
      return [
        { path: '/mental-health/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/mental-health/clients', icon: Users, label: 'Clients' },
        { path: '/mental-health/assessments', icon: Brain, label: 'Mental Health Assessments' },
        { path: '/mental-health/therapy-sessions', icon: Calendar, label: 'Therapy Sessions' },
        { path: '/mental-health/treatment-plans', icon: FileText, label: 'Treatment Plans' },
        { path: '/mental-health/progress-reports', icon: BarChart3, label: 'Progress Reports' },
        { path: '/mental-health/resources', icon: Heart, label: 'Mental Health Resources' },
        { path: '/mental-health/profile', icon: User, label: 'Profile' }
      ];

    case 'elder':
      return [
        { path: '/elder/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/elder/health', icon: Heart, label: 'My Health' },
        { path: '/elder/appointments', icon: Calendar, label: 'Appointments' },
        { path: '/elder/medications', icon: Pill, label: 'Medications' },
        { path: '/elder/mental-wellness', icon: Brain, label: 'Mental Wellness' }, // NEW!
        { path: '/elder/emergency', icon: AlertTriangle, label: 'Emergency' },
        { path: '/elder/profile', icon: User, label: 'Profile' }
      ];

    default:
      return [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/profile', icon: User, label: 'Profile' }
      ];
  }
};