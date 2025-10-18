// src/utils/roleMenus.js
import { 
  Home, Users, Package, Activity, Settings, User, Heart,
  Stethoscope, Calendar, FileText, Pill, Truck,
  Monitor, AlertTriangle, ClipboardList, BarChart3,
  Brain, // Icon for mental health
  Navigation // Icon for ambulance tracking
} from 'lucide-react';

export const getRoleMenuItems = (role) => {
  switch (role) {
    case 'family_member':
      return [
        { path: '/family/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/family/subscriptions', icon: Package, label: 'Subscriptions' },
        { path: '/family/appointments', icon: Calendar, label: 'Appointments' },
        { path: '/family/sessions', icon: Calendar, label: 'Monthly Sessions' },
        { path: '/family/health-reports', icon: Activity, label: 'Health Reports' },
        { path: '/family/profile', icon: User, label: 'Profile' },
      ];

    case 'admin':
      return [
        { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/packages', icon: Package, label: 'Package Management' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin/settings', icon: Settings, label: 'System Settings' }
      ];

    case 'coordinator':
      return [
        { path: '/coordinator/dashboard?tab=overview', icon: Home, label: 'Overview' },
        { path: '/coordinator/dashboard?tab=queue', icon: AlertTriangle, label: 'Emergency Queue' },
        { path: '/coordinator/dashboard?tab=ambulances', icon: Truck, label: 'Manage Ambulances' },
        { path: '/coordinator/dashboard?tab=drivers', icon: Users, label: 'Manage Drivers' },
        { path: '/coordinator/dashboard?tab=fleet', icon: Navigation, label: 'Fleet Tracker' },
        { path: '/coordinator/dashboard?tab=analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/profile', icon: User, label: 'Profile' }
      ];

    case 'doctor':
      return [
        { path: '/doctor/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/doctor/patients', icon: Users, label: 'Patients' },
        { path: '/doctor/consultations', icon: Stethoscope, label: 'Consultations' },
        { path: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
        { path: '/doctor/prescriptions', icon: Pill, label: 'Prescriptions [TEST]' }, // TEMPORARY - For testing prescription system
        { path: '/doctor/records', icon: FileText, label: 'Medical Records' },
        { path: '/doctor/profile', icon: User, label: 'Profile' }
      ];

  case 'staff':
      return [
        { path: '/staff/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/staff/care', icon: Heart, label: 'Care Management' },
        { path: '/staff/treatment-tasks', icon: ClipboardList, label: 'Treatment Tasks' },
        { path: '/staff/mental-assessments', icon: Brain, label: 'Mental Health Assessments' },
        { path: '/staff/monitoring', icon: Monitor, label: 'Health Monitoring' },
        { path: '/staff/alerts', icon: AlertTriangle, label: 'Alerts' },
        { path: '/staff/reports', icon: FileText, label: 'Reports' },
        { path: '/staff/profile', icon: User, label: 'Profile' }
      ];

    case 'pharmacist':
      return [
        { path: '/pharmacist/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/pharmacist/analysis', icon: BarChart3, label: 'Analysis' },
        { path: '/pharmacist/prescriptions', icon: FileText, label: 'Prescriptions' },
        { path: '/pharmacist/delivery', icon: Truck, label: 'Delivery' },
        { path: '/pharmacist/inventory', icon: Package, label: 'Inventory' },
        { path: '/pharmacist/profile', icon: User, label: 'Profile' }
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
        { path: '/elder/health-reports', icon: Heart, label: 'My Health' },
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