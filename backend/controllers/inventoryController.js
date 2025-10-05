// backend/controllers/inventoryController.js
const { Inventory, InventoryTransaction, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const PDFDocument = require('pdfkit');

// Get all inventory items for a pharmacy
const getInventoryItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status = 'active', sortBy = 'name', order = 'ASC' } = req.query;
    let pharmacyId = req.user.id;

    // If admin is viewing, they can specify pharmacyId
    if (req.user.role === 'admin' && req.query.pharmacyId) {
      pharmacyId = req.query.pharmacyId;
    }

    console.log('📦 Getting inventory items for pharmacy:', pharmacyId);

    // Build where clause
    const whereClause = {
      pharmacyId,
      status: status === 'all' ? { [Op.ne]: null } : status
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Get items with pagination
    const items = await Inventory.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    console.log(`📋 Found ${items.count} inventory items`);

    res.json({
      success: true,
      data: {
        items: items.rows,
        totalItems: items.count,
        totalPages: Math.ceil(items.count / limit),
        currentPage: parseInt(page)
      },
      message: 'Inventory items retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting inventory items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory items',
      error: error.message
    });
  }
};

// Get single inventory item
const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    let pharmacyId = req.user.id;

    // If admin is viewing, they don't need pharmacy restriction
    const whereClause = req.user.role === 'admin' 
      ? { id } 
      : { id, pharmacyId };

    console.log('📦 Getting inventory item:', id);

    const item = await Inventory.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: InventoryTransaction,
          as: 'transactions',
          include: [{
            model: User,
            as: 'performer',
            attributes: ['id', 'firstName', 'lastName']
          }],
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    console.log('📋 Found inventory item:', item.name);

    res.json({
      success: true,
      data: item,
      message: 'Inventory item retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory item',
      error: error.message
    });
  }
};

// Create new inventory item
const createInventoryItem = async (req, res) => {
  try {
    const pharmacyId = req.user.id;
    const itemData = {
      ...req.body,
      pharmacyId,
      createdBy: req.user.id
    };

    console.log('📦 Creating new inventory item:', itemData.name);

    const item = await Inventory.create(itemData);

    // Create initial stock transaction
    if (itemData.quantity > 0) {
      await InventoryTransaction.create({
        inventoryId: item.id,
        type: 'stock_in',
        quantity: itemData.quantity,
        reason: 'Initial stock',
        performedBy: req.user.id,
        unitCost: itemData.costPrice,
        totalAmount: itemData.costPrice * itemData.quantity
      });
    }

    console.log('✅ Inventory item created:', item.id);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Inventory item created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
};

// Update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user.id;
    const updateData = req.body;

    console.log('📦 Updating inventory item:', id);

    const whereClause = req.user.role === 'admin' 
      ? { id } 
      : { id, pharmacyId };

    const item = await Inventory.findOne({ where: whereClause });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Track quantity changes
    const oldQuantity = item.quantity;
    
    await item.update(updateData);

    // Create transaction if quantity changed
    if (updateData.quantity !== undefined && updateData.quantity !== oldQuantity) {
      const quantityDiff = updateData.quantity - oldQuantity;
      await InventoryTransaction.create({
        inventoryId: item.id,
        type: quantityDiff > 0 ? 'stock_in' : 'stock_out',
        quantity: Math.abs(quantityDiff),
        reason: quantityDiff > 0 ? 'Stock adjustment (increase)' : 'Stock adjustment (decrease)',
        performedBy: req.user.id,
        notes: updateData.adjustmentNotes || 'Manual adjustment'
      });
    }

    console.log('✅ Inventory item updated:', item.name);

    res.json({
      success: true,
      data: item,
      message: 'Inventory item updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
};

// Delete inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user.id;

    console.log('📦 Deleting inventory item:', id);

    const whereClause = req.user.role === 'admin' 
      ? { id } 
      : { id, pharmacyId };

    const item = await Inventory.findOne({ where: whereClause });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Soft delete by updating status
    await item.update({ status: 'discontinued' });

    console.log('✅ Inventory item deleted:', item.name);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message
    });
  }
};

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    const pharmacyId = req.user.id; // Get pharmacyId directly from user id
    
    console.log('📊 Fetching stats for pharmacyId:', pharmacyId);

    // Get all active medicines with essential attributes only
    const medicines = await Inventory.findAll({
      where: {
        pharmacyId,
        status: 'active' // Only count active items
      },
      attributes: [
        'id', 
        'quantity', 
        'minStockLevel', 
        'costPrice', 
        'expirationDate'
      ]
    });

    // Calculate statistics
    const totalItems = medicines.length;
    
    const lowStockItems = medicines.filter(
      m => m.quantity > 0 && m.quantity <= m.minStockLevel
    ).length;
    
    const expiredItems = medicines.filter(
      m => m.expirationDate && new Date(m.expirationDate) < new Date()
    ).length;
    
    const outOfStockItems = medicines.filter(
      m => m.quantity === 0
    ).length;

    // Calculate total value with proper parsing of costPrice
    const totalValue = medicines.reduce(
      (sum, m) => sum + (m.quantity * parseFloat(m.costPrice || 0)),
      0
    );

    // Get category distribution
    const categoryStats = await Inventory.findAll({
      where: { 
        pharmacyId,
        status: 'active'
      },
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
      ],
      group: ['category'],
      raw: true
    });

    console.log('📈 Stats calculated:', {
      totalItems,
      lowStockItems,
      expiredItems,
      outOfStockItems,
      totalValue: totalValue.toFixed(2)
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          lowStockItems,
          expiredItems,
          outOfStockItems,
          totalValue: parseFloat(totalValue).toFixed(2)
        },
        categoryStats
      },
      message: 'Inventory statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory statistics',
      error: error.message
    });
  }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
  try {
    const pharmacyId = req.user.id;

    console.log('📦 Getting low stock items for pharmacy:', pharmacyId);

    const lowStockItems = await Inventory.findAll({
      where: {
        pharmacyId,
        status: 'active',
        [Op.and]: [
          { quantity: { [Op.gt]: 0 } },
          { quantity: { [Op.lte]: sequelize.col('minStockLevel') } }
        ]
      },
      order: [['quantity', 'ASC']]
    });

    console.log(`📋 Found ${lowStockItems.length} low stock items`);

    res.json({
      success: true,
      data: lowStockItems,
      message: 'Low stock items retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock items',
      error: error.message
    });
  }
};

// Get expiring items
const getExpiringItems = async (req, res) => {
  try {
    const pharmacyId = req.user.id;
    const { days = 30 } = req.query;

    console.log('📦 Getting expiring items for pharmacy:', pharmacyId);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringItems = await Inventory.findAll({
      where: {
        pharmacyId,
        status: 'active',
        quantity: { [Op.gt]: 0 },
        expirationDate: {
          [Op.between]: [new Date(), futureDate]
        }
      },
      order: [['expirationDate', 'ASC']]
    });

    console.log(`📋 Found ${expiringItems.length} expiring items`);

    res.json({
      success: true,
      data: expiringItems,
      message: 'Expiring items retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting expiring items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expiring items',
      error: error.message
    });
  }
};

// Generate inventory report PDF
const generateInventoryReport = async (req, res) => {
  try {
    const pharmacyId = req.user.id;
    const { type = 'full', category, status = 'active' } = req.query;

    console.log('📄 Generating inventory report:', type);

    // Build where clause
    const whereClause = { pharmacyId, status };
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const items = await Inventory.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    // Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-report-${type}-${new Date().toISOString().split('T')[0]}.pdf"`);

    // Create PDF document
    const doc = new PDFDocument();
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Inventory Report', { align: 'center' });
    doc.fontSize(14).text(`Report Type: ${type.toUpperCase()}`, { align: 'center' });
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Add summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Items: ${items.length}`);
    doc.text(`Total Value: $${items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0).toFixed(2)}`);
    doc.moveDown();

    // Add items table
    if (items.length > 0) {
      doc.fontSize(16).text('Items', { underline: true });
      doc.fontSize(10);

      items.forEach((item, index) => {
        const isExpiringSoon = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
        
        doc.text(`${index + 1}. ${item.name} ${item.strength ? `(${item.strength})` : ''}`);
        doc.text(`   Category: ${item.category} | Quantity: ${item.quantity} ${item.unit}`);
        doc.text(`   Price: $${item.sellingPrice} | Expires: ${item.expirationDate} ${isExpiringSoon ? '⚠️' : ''}`);
        doc.text(`   Location: ${item.location} | Stock Level: ${item.quantity <= item.minStockLevel ? 'LOW' : 'OK'}`);
        doc.moveDown(0.5);
      });
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('❌ Inventory report generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
};

module.exports = {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
  getLowStockItems,
  getExpiringItems,
  generateInventoryReport
};