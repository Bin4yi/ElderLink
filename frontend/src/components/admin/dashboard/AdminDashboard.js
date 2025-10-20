// src/components/admin/dashboard/AdminDashboard.js
import React, { useState, useEffect } from "react";
import RoleLayout from "../../common/RoleLayout";
import Loading from "../../common/Loading";
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
  Clock,
  RefreshCw,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
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
  CardContent,
  IconButton,
  Divider,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserManagement from "../UserManagement";
import api from "../../../services/api"; // Use the same API import as UserManagement

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
    recentRegistrations: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const tabs = [
    {
      label: "Overview",
      component: (
        <DashboardOverview
          stats={stats}
          navigate={navigate}
          recentActivities={recentActivities}
        />
      ),
    },
    { label: "User Management", component: <UserManagement /> },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log(
        "🔄 Loading admin dashboard data using same routes as UserManagement..."
      );

      // Use the same API routes as UserManagement.js
      const [usersResponse, statsResponse] = await Promise.all([
        api.get("/admin/users?limit=1"), // Just get pagination info
        api.get("/admin/users/stats"), // Same stats endpoint as UserManagement
      ]);

      console.log("✅ Raw Users response:", usersResponse);
      console.log("✅ Raw Stats response:", statsResponse);
      console.log("✅ Users response data:", usersResponse.data);
      console.log("✅ Stats response data:", statsResponse.data);

      // Extract data from the same structure as UserManagement
      const userData = usersResponse.data?.data || usersResponse.data;
      const statsData = statsResponse.data?.stats || statsResponse.data;

      console.log("📊 Extracted userData:", userData);
      console.log("📊 Extracted statsData:", statsData);
      console.log("📊 Pagination:", userData?.pagination);
      console.log("📊 Total from pagination:", userData?.pagination?.total);

      // Debug: Check different possible paths for total users
      const possibleTotals = {
        "userData.pagination.total": userData?.pagination?.total,
        "userData.total": userData?.total,
        "statsData.total": statsData?.total,
        "statsData.totalUsers": statsData?.totalUsers,
        "statsData.totalActive + totalInactive":
          (statsData?.totalActive || 0) + (statsData?.totalInactive || 0),
        "usersResponse.data.pagination.total":
          usersResponse.data?.pagination?.total,
        "usersResponse.data.data.pagination.total":
          usersResponse.data?.data?.pagination?.total,
      };

      console.log("🔍 Possible total values:", possibleTotals);

      // Try multiple ways to get the total users count
      let totalUsers = 0;

      // Method 1: From pagination
      if (userData?.pagination?.total) {
        totalUsers = userData.pagination.total;
        console.log("✅ Using pagination total:", totalUsers);
      }
      // Method 2: Direct from response
      else if (usersResponse.data?.pagination?.total) {
        totalUsers = usersResponse.data.pagination.total;
        console.log("✅ Using direct pagination total:", totalUsers);
      }
      // Method 3: From stats
      else if (statsData?.total) {
        totalUsers = statsData.total;
        console.log("✅ Using stats total:", totalUsers);
      }
      // Method 4: Sum of active + inactive
      else if (
        statsData?.totalActive !== undefined &&
        statsData?.totalInactive !== undefined
      ) {
        totalUsers =
          (statsData.totalActive || 0) + (statsData.totalInactive || 0);
        console.log("✅ Using sum of active + inactive:", totalUsers);
      }
      // Method 5: Count users array length if available
      else if (userData?.users && Array.isArray(userData.users)) {
        // This won't be accurate with pagination, but better than 0
        totalUsers = userData.users.length;
        console.log("⚠️ Using users array length (not accurate):", totalUsers);
      }

      // Use the same data structure as UserManagement
      const finalStats = {
        totalUsers: totalUsers,
        activeUsers: statsData?.totalActive || 0,
        inactiveUsers: statsData?.totalInactive || 0,
        totalElders:
          statsData?.byRole?.find((r) => r.role === "elder")?.count || 0,
        activeElders:
          statsData?.byRole?.find((r) => r.role === "elder")?.count || 0,
        totalSubscriptions: 0, // Not available in current stats
        activeSubscriptions: 0, // Not available in current stats
        expiredSubscriptions: 0, // Not available in current stats
        totalRevenue: 0, // Not available in current stats
        pendingApprovals: statsData?.totalInactive || 0,
        systemAlerts: 3, // Hardcoded for now
        usersByRole: statsData?.byRole || [],
        recentRegistrations: statsData?.recentRegistrations || 0,
      };

      console.log("✅ Final stats object:", finalStats);
      setStats(finalStats);

      // Get recent activities from recent users
      if (userData?.users && userData.users.length > 0) {
        setRecentActivities(
          userData.users.slice(0, 5).map((user, index) => ({
            id: `user-${user.id}`,
            type: "user_registration",
            message: `User: ${user.firstName} ${user.lastName} (${user.role})`,
            time: new Date(user.createdAt).toLocaleString(),
          }))
        );
      } else {
        setRecentActivities([
          {
            id: 1,
            type: "system",
            message: "System running normally",
            time: "Now",
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Failed to load dashboard data:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

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
        recentRegistrations: 0,
      });

      setRecentActivities([
        {
          id: 1,
          type: "error",
          message: `Failed to load system data: ${error.message}`,
          time: "Just now",
        },
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
    console.log("🔄 Refreshing dashboard data...");
    loadDashboardData();
  };

  if (loading) {
    return <Loading text="Loading admin dashboard..." />;
  }

  return (
    <RoleLayout title="Admin Dashboard">
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Modern Top Navigation */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'white', 
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box 
                sx={{ 
                  bgcolor: '#3b82f6', 
                  width: 40, 
                  height: 40, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                <Shield size={24} color="white" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  ElderLink Admin
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  System Management Portal
                </Typography>
              </Box>
            </Box>
            
            <Chip 
              label={`${user?.firstName || 'Admin'}`}
              sx={{ 
                mr: 2, 
                bgcolor: '#f1f5f9',
                fontWeight: 500
              }}
            />
            
            <IconButton 
              onClick={handleRefreshData} 
              sx={{ 
                mr: 1,
                bgcolor: '#f1f5f9',
                '&:hover': { bgcolor: '#e2e8f0' }
              }}
              size="small"
            >
              <RefreshCw size={18} />
            </IconButton>
            
            <Button 
              variant="outlined" 
              onClick={handleLogout}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                borderColor: '#e2e8f0',
                color: 'text.secondary',
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Elegant Tabs */}
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="xl">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  minHeight: 56,
                },
                '& .Mui-selected': {
                  color: '#3b82f6',
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
          </Container>
        </Box>

        {/* Tab Content */}
        <Container maxWidth="xl" sx={{ mt: 3, pb: 4 }}>
          {tabs[activeTab].component}
        </Container>
      </Box>
    </RoleLayout>
  );
};

// Enhanced dashboard overview component
const DashboardOverview = ({ stats, navigate, recentActivities }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      subtitle: 'Click to manage',
      icon: Users,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea',
      clickable: true,
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Active Users',
      value: (stats.activeUsers || 0).toLocaleString(),
      subtitle: `${stats.inactiveUsers || 0} inactive`,
      icon: UserCheck,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#10b981',
    },
    {
      title: 'Medical Staff',
      value: stats.usersByRole?.find((r) => r.role === 'doctor')?.count || 0,
      subtitle: 'Doctors & specialists',
      icon: Activity,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#3b82f6',
    },
    {
      title: 'Care Team',
      value: stats.usersByRole?.find((r) => r.role === 'staff')?.count || 0,
      subtitle: 'Support personnel',
      icon: Users,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#f59e0b',
    },
    {
      title: 'Registered Elders',
      value: (stats.totalElders || 0).toLocaleString(),
      subtitle: 'Under care',
      icon: Shield,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: '#8b5cf6',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingApprovals || 0,
      subtitle: 'Needs attention',
      icon: Clock,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ef4444',
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 1
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Real-time insights and system analytics
        </Typography>
      </Box>

      {/* Modern Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: card.clickable ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: '#e2e8f0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': card.clickable ? {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: card.color,
                  } : {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  },
                }}
                onClick={card.onClick}
              >
                {/* Gradient accent bar */}
                <Box
                  sx={{
                    height: 4,
                    background: card.gradient,
                  }}
                />
                
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 1,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#1e293b',
                          mb: 0.5,
                          fontSize: '2rem'
                        }}
                      >
                        {card.value}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {card.subtitle}
                        {card.clickable && <ChevronRight size={14} />}
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={28} color={card.color} strokeWidth={2} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Role Distribution - Elegant Cards */}
      {stats.usersByRole && stats.usersByRole.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              mb: 3,
              color: '#1e293b'
            }}
          >
            User Distribution by Role
          </Typography>
          <Grid container spacing={2}>
            {stats.usersByRole.map((roleData) => {
              const percentage = stats.totalUsers > 0 
                ? ((roleData.count / stats.totalUsers) * 100).toFixed(1)
                : 0;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={roleData.role}>
                  <Card 
                    sx={{ 
                      border: '1px solid',
                      borderColor: '#e2e8f0',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 1,
                          textTransform: 'capitalize'
                        }}
                      >
                        {roleData.role.replace('_', ' ')}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#1e293b',
                          mb: 1
                        }}
                      >
                        {roleData.count}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(percentage)} 
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#3b82f6',
                              borderRadius: 3,
                            }
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ color: 'text.secondary' }}
                      >
                        {percentage}% of total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Quick Actions and Recent Activity */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              border: '1px solid',
              borderColor: '#e2e8f0',
              borderRadius: 3,
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#1e293b'
                }}
              >
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Users size={18} />}
                    onClick={() => navigate('/admin/users')}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        bgcolor: '#eff6ff',
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Manage Users
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {(stats.totalUsers || 0).toLocaleString()} total users
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<BarChart3 size={18} />}
                    onClick={() => navigate('/admin/analytics')}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        bgcolor: '#faf5ff',
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        View Analytics
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Reports & insights
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<UserCheck size={18} />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: '#e2e8f0',
                      color: '#1e293b',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: '#10b981',
                        bgcolor: '#f0fdf4',
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Active Users
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {(stats.activeUsers || 0).toLocaleString()} currently active
                      </Typography>
                    </Box>
                  </Button>
                </Grid>

                {stats.pendingApprovals > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      startIcon={<Clock size={18} />}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: '#fef3c7',
                        bgcolor: '#fffbeb',
                        color: '#92400e',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          borderColor: '#fde68a',
                          bgcolor: '#fef3c7',
                        }
                      }}
                    >
                      <Box sx={{ textAlign: 'left', flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Pending Reviews
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#92400e' }}>
                          {stats.pendingApprovals} awaiting approval
                        </Typography>
                      </Box>
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              border: '1px solid',
              borderColor: '#e2e8f0',
              borderRadius: 3,
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#1e293b'
                  }}
                >
                  Recent Activity
                </Typography>
                <Activity size={18} color="#64748b" />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <Box
                      key={activity.id}
                      sx={{
                        mb: 2,
                        pb: 2,
                        borderBottom: index < recentActivities.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1e293b',
                          fontWeight: 500,
                          mb: 0.5
                        }}
                      >
                        {activity.message}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <Clock size={12} />
                        {activity.time}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Activity size={32} color="#cbd5e1" />
                    <Typography 
                      variant="body2" 
                      sx={{ color: 'text.secondary', mt: 1 }}
                    >
                      No recent activities
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer Info */}
      <Box 
        sx={{ 
          mt: 4, 
          p: 2, 
          bgcolor: '#f8fafc', 
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ color: 'text.secondary', textAlign: 'center' }}
        >
          📊 All statistics are real-time and synchronized with the system database
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
