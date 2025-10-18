// backend/controllers/pharmacistAnalyticsController.js
const {
  Prescription,
  PrescriptionItem,
  Delivery,
  Elder,
  User,
  Inventory,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Get date range based on filter
const getDateRange = (range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  return startDate;
};

// Get top contributing doctors
exports.getTopDoctors = async (req, res) => {
  try {
    const { range = "month" } = req.query;
    const startDate = getDateRange(range);

    const topDoctors = await Prescription.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
        status: {
          [Op.in]: ["filled", "partially_filled"],
        },
      },
      include: [
        {
          model: User,
          as: "doctor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: PrescriptionItem,
          as: "items",
          attributes: ["quantityDispensed", "unitPrice", "totalPrice"],
        },
      ],
      attributes: ["doctorId", "createdAt"],
    });

    // Group by doctor and calculate stats
    const doctorStats = {};

    topDoctors.forEach((prescription) => {
      const doctorId = prescription.doctorId;
      
      if (!doctorStats[doctorId]) {
        doctorStats[doctorId] = {
          id: doctorId,
          name: `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
          specialization: "General Practice", // We don't have specialization in User model
          prescriptions: 0,
          revenue: 0,
        };
      }

      doctorStats[doctorId].prescriptions += 1;
      
      // Calculate revenue from prescription items
      if (prescription.items) {
        prescription.items.forEach((item) => {
          const revenue = parseFloat(item.totalPrice || 0);
          doctorStats[doctorId].revenue += revenue;
        });
      }
    });

    // Convert to array and sort by prescriptions
    const topDoctorsArray = Object.values(doctorStats)
      .sort((a, b) => b.prescriptions - a.prescriptions)
      .slice(0, 10); // Top 10 doctors

    res.json({
      success: true,
      data: topDoctorsArray,
    });
  } catch (error) {
    console.error("Error fetching top doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top doctors",
      error: error.message,
    });
  }
};

// Get prescription statistics
exports.getPrescriptionStats = async (req, res) => {
  try {
    const { range = "month" } = req.query;
    const startDate = getDateRange(range);

    // Get prescription stats by month/week
    const prescriptions = await Prescription.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      include: [
        {
          model: PrescriptionItem,
          as: "items",
          attributes: ["medicationName", "quantityDispensed", "unitPrice", "totalPrice"],
        },
      ],
      attributes: ["id", "status", "createdAt"],
    });

    // Group by month
    const monthlyStats = {};
    const medicationDistribution = {};
    let totalRevenue = 0;

    prescriptions.forEach((prescription) => {
      const month = new Date(prescription.createdAt).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month,
          filled: 0,
          pending: 0,
          cancelled: 0,
          revenue: 0,
        };
      }

      // Count by status
      if (prescription.status === "filled" || prescription.status === "partially_filled") {
        monthlyStats[month].filled += 1;
      } else if (prescription.status === "pending") {
        monthlyStats[month].pending += 1;
      } else if (prescription.status === "cancelled") {
        monthlyStats[month].cancelled += 1;
      }

      // Calculate revenue and medication distribution
      if (prescription.items) {
        prescription.items.forEach((item) => {
          const revenue = parseFloat(item.totalPrice || 0);
          monthlyStats[month].revenue += revenue;
          totalRevenue += revenue;

          // Categorize medications (simplified categorization)
          const category = categorizeMedication(item.medicationName);
          if (!medicationDistribution[category]) {
            medicationDistribution[category] = 0;
          }
          medicationDistribution[category] += item.quantityDispensed || 0;
        });
      }
    });

    // Convert to arrays
    const stats = Object.values(monthlyStats);
    const revenue = stats.map((s) => ({ month: s.month, revenue: s.revenue }));
    const medications = Object.entries(medicationDistribution).map(
      ([name, value]) => ({ name, value })
    );

    res.json({
      success: true,
      data: {
        stats,
        revenue,
        medications,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching prescription stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescription statistics",
      error: error.message,
    });
  }
};

// Get delivery statistics
exports.getDeliveryStats = async (req, res) => {
  try {
    const { range = "month" } = req.query;
    const startDate = getDateRange(range);

    const deliveries = await Delivery.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      attributes: ["status"],
    });

    // Group by status
    const statusCounts = {
      delivered: 0,
      "in_transit": 0,
      pending: 0,
      cancelled: 0,
    };

    deliveries.forEach((delivery) => {
      if (statusCounts.hasOwnProperty(delivery.status)) {
        statusCounts[delivery.status] += 1;
      }
    });

    // Convert to array format
    const stats = [
      { status: "Delivered", count: statusCounts.delivered },
      { status: "In Transit", count: statusCounts.in_transit },
      { status: "Pending", count: statusCounts.pending },
      { status: "Cancelled", count: statusCounts.cancelled },
    ];

    res.json({
      success: true,
      data: {
        stats,
        total: deliveries.length,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery statistics",
      error: error.message,
    });
  }
};

// Helper function to categorize medications
const categorizeMedication = (medicationName) => {
  const name = medicationName.toLowerCase();

  // Cardiovascular
  if (
    name.includes("statin") ||
    name.includes("atenolol") ||
    name.includes("amlodipine") ||
    name.includes("losartan") ||
    name.includes("aspirin") ||
    name.includes("warfarin")
  ) {
    return "Cardiovascular";
  }

  // Diabetes
  if (
    name.includes("metformin") ||
    name.includes("insulin") ||
    name.includes("glipizide") ||
    name.includes("glyburide")
  ) {
    return "Diabetes";
  }

  // Pain Relief
  if (
    name.includes("paracetamol") ||
    name.includes("ibuprofen") ||
    name.includes("diclofenac") ||
    name.includes("tramadol") ||
    name.includes("morphine")
  ) {
    return "Pain Relief";
  }

  // Antibiotics
  if (
    name.includes("amoxicillin") ||
    name.includes("ciprofloxacin") ||
    name.includes("azithromycin") ||
    name.includes("cephalexin")
  ) {
    return "Antibiotics";
  }

  // Mental Health
  if (
    name.includes("sertraline") ||
    name.includes("fluoxetine") ||
    name.includes("escitalopram") ||
    name.includes("alprazolam") ||
    name.includes("lorazepam")
  ) {
    return "Mental Health";
  }

  return "Others";
};

module.exports = exports;
