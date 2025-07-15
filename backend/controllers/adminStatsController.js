// backend/controllers/adminStatsController.js
const { User, Elder, Subscription } = require('../models');
const { Op } = require('sequelize');

/**
 * Get admin dashboard statistics
 */
const getAdminStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard statistics...');

    // Get total users count
    const totalUsers = await User.count();
    console.log('Total users found:', totalUsers);

    // Get active users count
    const activeUsers = await User.count({
      where: { isActive: true }
    });

    // Get inactive users count
    const inactiveUsers = await User.count({
      where: { isActive: false }
    });

    // Get users by role
    const usersByRole = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
      group: ['role'],
      raw: true
    });

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    // Get pending approvals (inactive professional users)
    const pendingApprovals = await User.count({
      where: {
        isActive: false,
        role: {
          [Op.in]: ['doctor', 'mental_health_consultant', 'pharmacist', 'staff']
        }
      }
    });

    // Default values for tables that might not exist yet
    let totalElders = 0;
    let activeElders = 0;
    let totalSubscriptions = 0;
    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;
    let totalRevenue = 0;

    // Try to get Elder statistics
    try {
      totalElders = await Elder.count();
      // For now, assume all elders are active
      activeElders = totalElders;
    } catch (elderError) {
      console.log('Elder table not found, using default values');
    }

    // Try to get Subscription statistics
    try {
      totalSubscriptions = await Subscription.count();
      activeSubscriptions = await Subscription.count({
        where: {
          status: 'active'
        }
      });
      expiredSubscriptions = await Subscription.count({
        where: {
          status: 'expired'
        }
      });

      // Calculate total revenue from active subscriptions
      const revenueData = await Subscription.sum('amount', {
        where: {
          status: 'active'
        }
      });
      totalRevenue = revenueData || 0;
    } catch (subscriptionError) {
      console.log('Subscription table not found, using default values');
    }

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole,
        recentRegistrations
      },
      elders: {
        total: totalElders,
        active: activeElders
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        expired: expiredSubscriptions
      },
      revenue: {
        total: totalRevenue
      },
      system: {
        pendingApprovals,
        systemAlerts: 3 // Hardcoded for now
      }
    };

    console.log('✅ Admin statistics compiled:', stats);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching admin statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message
    });
  }
};

/**
 * Get system activity feed
 */
const getSystemActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent user registrations
    const recentUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: limit,
    });

    const activities = recentUsers.map(user => ({
      id: `user-${user.id}`,
      type: 'user_registration',
      message: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
      time: user.createdAt,
      icon: 'user'
    }));

    res.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('❌ Error fetching system activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system activity',
      error: error.message
    });
  }
};

module.exports = {
  getAdminStats,
  getSystemActivity
};