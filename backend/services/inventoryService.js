// backend/services/inventoryService.js
const Medicine = require('../models/Inventory');
const UsageLog = require('../models/UsageLog');
const { Op } = require('sequelize');
const moment = require('moment');

class InventoryService {
  // Get all medicines with search and pagination
  async getAllMedicines(filters = {}) {
    const { search, page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = filters;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }
    
    const medicines = await Medicine.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return {
      medicines: medicines.rows,
      totalCount: medicines.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(medicines.count / limit)
    };
  }

  // Get medicine by ID
  async getMedicineById(id) {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    return medicine;
  }

  // Create new medicine
  async createMedicine(medicineData) {
    const medicine = await Medicine.create({
      ...medicineData,
      lastUpdated: new Date()
    });
    return medicine;
  }

  // Update medicine
  async updateMedicine(id, medicineData) {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    
    await medicine.update({
      ...medicineData,
      lastUpdated: new Date()
    });
    
    return medicine;
  }

  // Delete medicine
  async deleteMedicine(id) {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    
    await medicine.destroy();
    return { message: 'Medicine deleted successfully' };
  }

  // Get low stock medicines
  async getLowStockMedicines(threshold = 10) {
    const medicines = await Medicine.findAll({
      where: {
        quantity: {
          [Op.lt]: threshold
        }
      },
      order: [['quantity', 'ASC']]
    });
    
    return medicines;
  }

  // Get expiring medicines
  async getExpiringMedicines(days = 30) {
    const expiryDate = moment().add(days, 'days').toDate();
    
    const medicines = await Medicine.findAll({
      where: {
        expirationDate: {
          [Op.lte]: expiryDate
        }
      },
      order: [['expirationDate', 'ASC']]
    });
    
    return medicines;
  }

  // Record medicine usage
  async recordUsage(medicineId, usageData) {
    const medicine = await Medicine.findByPk(medicineId);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    
    if (medicine.quantity < usageData.quantityUsed) {
      throw new Error('Insufficient quantity available');
    }
    
    // Create usage log
    const usageLog = await UsageLog.create({
      medicineId: medicineId,
      usageDate: new Date(),
      quantityUsed: usageData.quantityUsed,
      userId: usageData.userId,
      notes: usageData.notes,
      batchNumber: usageData.batchNumber
    });
    
    // Update medicine quantity
    await medicine.update({
      quantity: medicine.quantity - usageData.quantityUsed,
      lastUpdated: new Date()
    });
    
    return usageLog;
  }

  // Get usage history for a medicine
  async getUsageHistory(medicineId) {
    const usageHistory = await UsageLog.findAll({
      where: { medicineId: medicineId },
      order: [['usageDate', 'DESC']]
    });
    
    return usageHistory;
  }

  // Get analytics data
  async getAnalytics() {
    const totalMedicines = await Medicine.count();
    const lowStockCount = await Medicine.count({
      where: {
        quantity: {
          [Op.lt]: 10
        }
      }
    });
    
    const expiringCount = await Medicine.count({
      where: {
        expirationDate: {
          [Op.lte]: moment().add(30, 'days').toDate()
        }
      }
    });
    
    // Weekly usage trends - PostgreSQL compatible
    const weeklyUsage = await sequelize.query(`
      SELECT DATE(usage_date) as date, SUM(quantity_used) as totalUsed
      FROM usage_logs 
      WHERE usage_date >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(usage_date)
      ORDER BY date ASC
    `, { type: sequelize.QueryTypes.SELECT });
    
    // Top used medicines - PostgreSQL compatible
    const topUsedMedicines = await sequelize.query(`
      SELECT ul.medicine_id, m.name, SUM(ul.quantity_used) as totalUsed
      FROM usage_logs ul
      JOIN medicines m ON ul.medicine_id = m.id
      GROUP BY ul.medicine_id, m.name
      ORDER BY totalUsed DESC
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    return {
      totalMedicines,
      lowStockCount,
      expiringCount,
      weeklyUsage,
      topUsedMedicines
    };
  }
}

module.exports = new InventoryService();
