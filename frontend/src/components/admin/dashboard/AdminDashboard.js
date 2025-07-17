// src/components/admin/dashboard/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import RoleLayout from '../../common/RoleLayout';
import Loading from '../../common/Loading';
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Shield,
  BarChart3,
  UserCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Container,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../UserManagement';
import api from '../../../services/api'; // Use the same API import as UserManagement

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalElders: 0,
    activeElders: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    systemAlerts: 0,
    usersByRole: [],
    recentRegistrations: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const tabs = [
    { label: 'Overview', component: <DashboardOverview stats={stats} navigate={navigate} recentActivities={recentActivities} /> },
    { label: 'User Management', component: <UserManagement /> },
    { label: 'System Settings', component: <SystemSettings /> },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading admin dashboard data using same routes as UserManagement...');
      
      // Use the same API routes as UserManagement.js
      const [usersResponse, statsResponse] = await Promise.all([
        api.get('/admin/users?limit=1'), // Just get pagination info
        api.get('/admin/users/stats')    // Same stats endpoint as UserManagement
      ]);

      console.log('✅ Raw Users response:', usersResponse);
      console.log('✅ Raw Stats response:', statsResponse);
      console.log('✅ Users response data:', usersResponse.data);
      console.log('✅ Stats response data:', statsResponse.data);

      // Extract data from the same structure as UserManagement
      const userData = usersResponse.data?.data || usersResponse.data;
      const statsData = statsResponse.data?.stats || statsResponse.data;

      console.log('📊 Extracted userData:', userData);
      console.log('📊 Extracted statsData:', statsData);
      console.log('📊 Pagination:', userData?.pagination);
      console.log('📊 Total from pagination:', userData?.pagination?.total);

      // Debug: Check different possible paths for total users
      const possibleTotals = {
        'userData.pagination.total': userData?.pagination?.total,
        'userData.total': userData?.total,
        'statsData.total': statsData?.total,
        'statsData.totalUsers': statsData?.totalUsers,
        'statsData.totalActive + totalInactive': (statsData?.totalActive || 0) + (statsData?.totalInactive || 0),
        'usersResponse.data.pagination.total': usersResponse.data?.pagination?.total,
        'usersResponse.data.data.pagination.total': usersResponse.data?.data?.pagination?.total
      };
      
      console.log('🔍 Possible total values:', possibleTotals);

      // Try multiple ways to get the total users count
      let totalUsers = 0;
      
      // Method 1: From pagination
      if (userData?.pagination?.total) {
        totalUsers = userData.pagination.total;
        console.log('✅ Using pagination total:', totalUsers);
      }
      // Method 2: Direct from response
      else if (usersResponse.data?.pagination?.total) {
        totalUsers = usersResponse.data.pagination.total;
        console.log('✅ Using direct pagination total:', totalUsers);
      }
      // Method 3: From stats
      else if (statsData?.total) {
        totalUsers = statsData.total;
        console.log('✅ Using stats total:', totalUsers);
      }
      // Method 4: Sum of active + inactive
      else if (statsData?.totalActive !== undefined && statsData?.totalInactive !== undefined) {
        totalUsers = (statsData.totalActive || 0) + (statsData.totalInactive || 0);
        console.log('✅ Using sum of active + inactive:', totalUsers);
      }
      // Method 5: Count users array length if available
      else if (userData?.users && Array.isArray(userData.users)) {
        // This won't be accurate with pagination, but better than 0
        totalUsers = userData.users.length;
        console.log('⚠️ Using users array length (not accurate):', totalUsers);
      }

      // Use the same data structure as UserManagement
      const finalStats = {
        totalUsers: totalUsers,
        activeUsers: statsData?.totalActive || 0,
        inactiveUsers: statsData?.totalInactive || 0,
        totalElders: statsData?.byRole?.find(r => r.role === 'elder')?.count || 0,
        activeElders: statsData?.byRole?.find(r => r.role === 'elder')?.count || 0,
        totalSubscriptions: 0, // Not available in current stats
        activeSubscriptions: 0, // Not available in current stats
        expiredSubscriptions: 0, // Not available in current stats
        totalRevenue: 0, // Not available in current stats
        pendingApprovals: statsData?.totalInactive || 0,
        systemAlerts: 3, // Hardcoded for now
        usersByRole: statsData?.byRole || [],
        recentRegistrations: statsData?.recentRegistrations || 0
      };

      console.log('✅ Final stats object:', finalStats);
      setStats(finalStats);

      // Get recent activities from recent users
      if (userData?.users && userData.users.length > 0) {
        setRecentActivities(
          userData.users.slice(0, 5).map((user, index) => ({
            id: `user-${user.id}`,
            type: 'user_registration',
            message: `User: ${user.firstName} ${user.lastName} (${user.role})`,
            time: new Date(user.createdAt).toLocaleString()
          }))
        );
      } else {
        setRecentActivities([
          { id: 1, type: 'system', message: 'System running normally', time: 'Now' }
        ]);
      }

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Fallback: Set zeros but show the dashboard
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalElders: 0,
        activeElders: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        systemAlerts: 0,
        usersByRole: [],
        recentRegistrations: 0
      });
      
      setRecentActivities([
        { id: 1, type: 'error', message: `Failed to load system data: ${error.message}`, time: 'Just now' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    logout();
  };

  const handleRefreshData = () => {
    console.log('🔄 Refreshing dashboard data...');
    loadDashboardData();
  };

  if (loading) {
    return <Loading text="Loading admin dashboard..." />;
  }

  return (
    <RoleLayout title="Admin Dashboard">
      <Box>
        {/* Top Navigation */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🏥 ElderLink Admin Portal
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.firstName}!
            </Typography>
            <Button color="inherit" onClick={handleRefreshData} sx={{ mr: 1 }}>
              Refresh
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="xl">
            <Tabs value={activeTab} onChange={handleTabChange}>
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
          </Container>
        </Box>

        {/* Tab Content */}
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {tabs[activeTab].component}
        </Container>
      </Box>
    </RoleLayout>
  );
};

// Enhanced dashboard overview component
const DashboardOverview = ({ stats, navigate, recentActivities }) => (
  <Box p={3}>
    <Typography variant="h4" gutterBottom>
      Admin Dashboard Overview
    </Typography>
    

    
    {/* Statistics Cards - Same as UserManagement stats */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4}>
        <Card 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
          onClick={() => navigate('/admin/users')}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{(stats.totalUsers || 0).toLocaleString()}</Typography>
                <Typography variant="caption">
                  Click to manage users
                </Typography>
              </Box>
              <Users size={40} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Active Users</Typography>
                <Typography variant="h4">{(stats.activeUsers || 0).toLocaleString()}</Typography>
                <Typography variant="caption">
                  {stats.inactiveUsers || 0} inactive
                </Typography>
              </Box>
              <UserCheck size={40} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Doctors</Typography>
                <Typography variant="h4">
                  {stats.usersByRole?.find(r => r.role === 'doctor')?.count || 0}
                </Typography>
                <Typography variant="caption">
                  Medical professionals
                </Typography>
              </Box>
              <Package size={40} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Care Staff</Typography>
                <Typography variant="h4">
                  {stats.usersByRole?.find(r => r.role === 'staff')?.count || 0}
                </Typography>
                <Typography variant="caption">
                  Support personnel
                </Typography>
              </Box>
              <Clock size={40} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Pending Approvals</Typography>
                <Typography variant="h4">{stats.pendingApprovals || 0}</Typography>
                <Typography variant="caption">
                  Inactive users
                </Typography>
              </Box>
              <AlertTriangle size={40} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Elders</Typography>
                <Typography variant="h4">{(stats.totalElders || 0).toLocaleString()}</Typography>
                <Typography variant="caption">
                  Registered elders
                </Typography>
              </Box>
              <Activity size={40} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Role Distribution - Same as UserManagement */}
    {stats.usersByRole && stats.usersByRole.length > 0 && (
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          User Distribution by Role
        </Typography>
        <Grid container spacing={2}>
          {stats.usersByRole.map((roleData) => (
            <Grid item xs={12} sm={6} md={3} key={roleData.role}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1).replace('_', ' ')}
                  </Typography>
                  <Typography variant="h4">
                    {roleData.count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )}

    {/* Quick Actions and Recent Activities */}
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Users />}
                onClick={() => navigate('/admin/users')}
                size="large"
              >
                Manage Users ({(stats.totalUsers || 0).toLocaleString()})
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<UserCheck />}
                size="large"
              >
                Active Users ({(stats.activeUsers || 0).toLocaleString()})
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<BarChart3 />}
                size="large"
              >
                View Analytics
              </Button>
            </Grid>
            {stats.pendingApprovals > 0 && (
              <Grid item>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<Clock />}
                  size="large"
                >
                  Review Approvals ({stats.pendingApprovals})
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.primary">
                      {activity.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent activities
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    <Box mt={4}>
      <Typography variant="body1" color="text.secondary">
        Dashboard data loaded from the same endpoints as User Management. All statistics are real-time.
      </Typography>
    </Box>
  </Box>
);

// System Settings component
const SystemSettings = () => (
  <Box p={3}>
    <Typography variant="h4" gutterBottom>
      System Settings
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Email Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure SMTP settings for system emails
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Configure Email
            </Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Database Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Backup and restore database settings
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Manage Database
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;