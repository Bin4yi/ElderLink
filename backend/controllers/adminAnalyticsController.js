// backend/controllers/adminAnalyticsController.js
const { User, Subscription, Elder } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Get user statistics - active and inactive users by role
 */
const getUserStatistics = async (req, res) => {
  try {
    // Total users count
    const totalUsers = await User.count();

    // Active users count
    const activeUsers = await User.count({
      where: { isActive: true },
    });

    // Inactive users count
    const inactiveUsers = await User.count({
      where: { isActive: false },
    });

    // Users by role (active only)
    const usersByRole = await User.findAll({
      attributes: [
        "role",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { isActive: true },
      group: ["role"],
      raw: true,
    });

    // Users by role (inactive)
    const inactiveUsersByRole = await User.findAll({
      attributes: [
        "role",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { isActive: false },
      group: ["role"],
      raw: true,
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    // Detailed user list with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: users, count: totalCount } = await User.findAndCountAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
        "isActive",
        "createdAt",
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          recentRegistrations,
        },
        byRole: {
          active: usersByRole,
          inactive: inactiveUsersByRole,
        },
        users: {
          data: users,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      error: error.message,
    });
  }
};

/**
 * Get subscription statistics by plan
 */
const getSubscriptionStatistics = async (req, res) => {
  try {
    // Total subscriptions
    const totalSubscriptions = await Subscription.count();

    // Active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: { status: "active" },
    });

    // Subscriptions by plan
    const subscriptionsByPlan = await Subscription.findAll({
      attributes: [
        "plan",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { status: "active" },
      group: ["plan"],
      raw: true,
    });

    // Subscriptions by status
    const subscriptionsByStatus = await Subscription.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Subscriptions by duration
    const subscriptionsByDuration = await Subscription.findAll({
      attributes: [
        "duration",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { status: "active" },
      group: ["duration"],
      raw: true,
    });

    // Detailed subscription list with user info
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: subscriptions, count: totalCount } =
      await Subscription.findAndCountAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

    res.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions,
          activeSubscriptions,
          canceledSubscriptions: await Subscription.count({
            where: { status: "canceled" },
          }),
          expiredSubscriptions: await Subscription.count({
            where: { status: "expired" },
          }),
        },
        byPlan: subscriptionsByPlan,
        byStatus: subscriptionsByStatus,
        byDuration: subscriptionsByDuration,
        subscriptions: {
          data: subscriptions,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching subscription statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription statistics",
      error: error.message,
    });
  }
};

/**
 * Get revenue statistics
 */
const getRevenueStatistics = async (req, res) => {
  try {
    // Total revenue from all subscriptions
    const totalRevenue = await Subscription.sum("amount");

    // Revenue from active subscriptions only
    const activeRevenue = await Subscription.sum("amount", {
      where: { status: "active" },
    });

    // Revenue by plan
    const revenueByPlan = await Subscription.findAll({
      attributes: [
        "plan",
        [sequelize.fn("SUM", sequelize.col("amount")), "revenue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "subscriptions"],
      ],
      where: { status: "active" },
      group: ["plan"],
      raw: true,
    });

    // Monthly revenue (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Subscription.findAll({
      attributes: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("startDate")),
          "month",
        ],
        [sequelize.fn("SUM", sequelize.col("amount")), "revenue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "subscriptions"],
      ],
      where: {
        startDate: {
          [Op.gte]: twelveMonthsAgo,
        },
      },
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("startDate"))],
      order: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("startDate")),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Average revenue per subscription
    const avgRevenuePerSub = totalRevenue / (await Subscription.count()) || 0;

    // Projected annual revenue (based on active subscriptions)
    const projectedAnnualRevenue = await Subscription.findAll({
      attributes: [
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(`CASE 
            WHEN duration = '1_month' THEN amount * 12
            WHEN duration = '6_months' THEN amount * 2
            WHEN duration = '1_year' THEN amount
            ELSE amount
          END`)
          ),
          "projected",
        ],
      ],
      where: { status: "active" },
      raw: true,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
          activeRevenue: parseFloat(activeRevenue || 0).toFixed(2),
          averagePerSubscription: parseFloat(avgRevenuePerSub).toFixed(2),
          projectedAnnualRevenue: parseFloat(
            projectedAnnualRevenue[0]?.projected || 0
          ).toFixed(2),
        },
        byPlan: revenueByPlan.map((item) => ({
          plan: item.plan,
          revenue: parseFloat(item.revenue).toFixed(2),
          subscriptions: parseInt(item.subscriptions),
        })),
        monthly: monthlyRevenue.map((item) => ({
          month: item.month,
          revenue: parseFloat(item.revenue).toFixed(2),
          subscriptions: parseInt(item.subscriptions),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching revenue statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue statistics",
      error: error.message,
    });
  }
};

/**
 * Get dashboard overview - Combined stats for admin dashboard
 */
const getDashboardOverview = async (req, res) => {
  try {
    // Quick stats
    const stats = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      Subscription.count({ where: { status: "active" } }),
      Subscription.sum("amount", { where: { status: "active" } }),
      Elder.count(),
    ]);

    const [
      totalUsers,
      activeUsers,
      activeSubscriptions,
      totalRevenue,
      totalElders,
    ] = stats;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = {
      newUsers: await User.count({
        where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      }),
      newSubscriptions: await Subscription.count({
        where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      }),
      expiringSoon: await Subscription.count({
        where: {
          status: "active",
          endDate: {
            [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
        },
      }),
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalElders,
          activeSubscriptions,
          totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
      error: error.message,
    });
  }
};

module.exports = {
  getUserStatistics,
  getSubscriptionStatistics,
  getRevenueStatistics,
  getDashboardOverview,
};
