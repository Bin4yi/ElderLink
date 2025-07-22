// backend/controllers/prescriptionController.js
const { Prescription, PrescriptionItem, User, Elder, Doctor, Inventory, InventoryTransaction } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all prescriptions for a pharmacy
const getPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, search } = req.query;
    let pharmacyId = req.user.id;

    // If admin is viewing, they can specify pharmacyId
    if (req.user.role === 'admin' && req.query.pharmacyId) {
      pharmacyId = req.query.pharmacyId;
    }

    console.log('📋 Getting prescriptions for pharmacy:', pharmacyId);

    // Build where clause
    const whereClause = { pharmacyId };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (priority && priority !== 'all') {
      whereClause.priority = priority;
    }

    if (search) {
      whereClause.prescriptionNumber = { [Op.iLike]: `%${search}%` };
    }

    const prescriptions = await Prescription.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          include: [{
            model: Doctor,
            as: 'doctorProfile',
            attributes: ['specialization', 'licenseNumber']
          }],
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth']
        },
        {
          model: User,
          as: 'pharmacist',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: PrescriptionItem,
          as: 'items',
          attributes: ['id', 'medicationName', 'quantityPrescribed', 'quantityDispensed', 'status']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    console.log(`📋 Found ${prescriptions.count} prescriptions`);

    res.json({
      success: true,
      data: {
        prescriptions: prescriptions.rows,
        totalPrescriptions: prescriptions.count,
        totalPages: Math.ceil(prescriptions.count / limit),
        currentPage: parseInt(page)
      },
      message: 'Prescriptions retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: error.message
    });
  }
};

// Get single prescription with details
const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    let pharmacyId = req.user.id;

    console.log('📋 Getting prescription:', id);

    const whereClause = req.user.role === 'admin' 
      ? { id } 
      : { id, pharmacyId };

    const prescription = await Prescription.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          include: [{
            model: Doctor,
            as: 'doctorProfile',
            attributes: ['specialization', 'licenseNumber', 'phoneNumber']
          }],
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber']
        },
        {
          model: User,
          as: 'pharmacist',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: PrescriptionItem,
          as: 'items',
          include: [{
            model: Inventory,
            as: 'inventory',
            attributes: ['id', 'name', 'strength', 'quantity', 'sellingPrice'],
            required: false
          }]
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    console.log('📋 Found prescription:', prescription.prescriptionNumber);

    res.json({
      success: true,
      data: prescription,
      message: 'Prescription retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescription',
      error: error.message
    });
  }
};

// Fill prescription (dispense medications)
const fillPrescription = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { items, notes, partialFill = false } = req.body;
    const pharmacyId = req.user.id;

    console.log('💊 Filling prescription:', id);

    const prescription = await Prescription.findOne({
      where: { id, pharmacyId },
      include: [{
        model: PrescriptionItem,
        as: 'items'
      }],
      transaction
    });

    if (!prescription) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    if (prescription.status !== 'pending' && prescription.status !== 'partially_filled') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Prescription cannot be filled'
      });
    }

    let totalAmount = 0;
    let allItemsFilled = true;

    // Process each item
    for (const itemUpdate of items) {
      const prescriptionItem = prescription.items.find(item => item.id === itemUpdate.id);
      
      if (!prescriptionItem) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Prescription item not found: ${itemUpdate.id}`
        });
      }

      const quantityToDispense = itemUpdate.quantityDispensed;

      if (quantityToDispense > 0) {
        // Find inventory item
        const inventoryItem = await Inventory.findOne({
          where: {
            id: itemUpdate.inventoryId,
            pharmacyId,
            quantity: { [Op.gte]: quantityToDispense }
          },
          transaction
        });

        if (!inventoryItem) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${prescriptionItem.medicationName}`
          });
        }

        // Update inventory quantity
        await inventoryItem.update({
          quantity: inventoryItem.quantity - quantityToDispense,
          totalSold: inventoryItem.totalSold + quantityToDispense
        }, { transaction });

        // Create inventory transaction
        await InventoryTransaction.create({
          inventoryId: inventoryItem.id,
          type: 'stock_out',
          quantity: quantityToDispense,
          reason: 'Prescription fill',
          performedBy: req.user.id,
          referenceNumber: prescription.prescriptionNumber,
          unitCost: inventoryItem.sellingPrice,
          totalAmount: inventoryItem.sellingPrice * quantityToDispense
        }, { transaction });

        // Update prescription item
        const newQuantityDispensed = prescriptionItem.quantityDispensed + quantityToDispense;
        const itemStatus = newQuantityDispensed >= prescriptionItem.quantityPrescribed ? 'filled' : 'partially_filled';

        await prescriptionItem.update({
          inventoryId: inventoryItem.id,
          quantityDispensed: newQuantityDispensed,
          unitPrice: inventoryItem.sellingPrice,
          totalPrice: inventoryItem.sellingPrice * newQuantityDispensed,
          status: itemStatus,
          notes: itemUpdate.notes
        }, { transaction });

        totalAmount += inventoryItem.sellingPrice * quantityToDispense;

        if (itemStatus !== 'filled') {
          allItemsFilled = false;
        }
      } else {
        allItemsFilled = false;
      }
    }

    // Update prescription status
    const newStatus = allItemsFilled && !partialFill ? 'filled' : 'partially_filled';
    
    await prescription.update({
      status: newStatus,
      filledDate: newStatus === 'filled' ? new Date() : prescription.filledDate,
      filledBy: req.user.id,
      totalAmount: prescription.totalAmount + totalAmount,
      notes: notes || prescription.notes
    }, { transaction });

    await transaction.commit();

    console.log('✅ Prescription filled successfully:', prescription.prescriptionNumber);

    res.json({
      success: true,
      data: {
        prescriptionId: prescription.id,
        status: newStatus,
        totalAmount: prescription.totalAmount + totalAmount
      },
      message: `Prescription ${newStatus === 'filled' ? 'filled' : 'partially filled'} successfully`
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error filling prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fill prescription',
      error: error.message
    });
  }
};

// Get prescription statistics
const getPrescriptionStats = async (req, res) => {
  try {
    const pharmacyId = req.user.id;
    const { period = '7' } = req.query;

    console.log('📊 Getting prescription statistics for pharmacy:', pharmacyId);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    // Get basic counts
    const [totalPrescriptions, pendingPrescriptions, filledPrescriptions, partiallyFilledPrescriptions] = await Promise.all([
      Prescription.count({ where: { pharmacyId } }),
      Prescription.count({ where: { pharmacyId, status: 'pending' } }),
      Prescription.count({ 
        where: { 
          pharmacyId, 
          status: 'filled',
          filledDate: { [Op.gte]: dateFrom }
        } 
      }),
      Prescription.count({ where: { pharmacyId, status: 'partially_filled' } })
    ]);

    // Get revenue from filled prescriptions
    const revenueResult = await Prescription.sum('totalAmount', {
      where: {
        pharmacyId,
        status: 'filled',
        filledDate: { [Op.gte]: dateFrom }
      }
    });

    const revenue = revenueResult || 0;

    // Get most prescribed medications
    const topMedications = await PrescriptionItem.findAll({
      attributes: [
        'medicationName',
        [sequelize.fn('COUNT', sequelize.col('medicationName')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantityDispensed')), 'totalDispensed']
      ],
      include: [{
        model: Prescription,
        as: 'prescription',
        where: { pharmacyId },
        attributes: []
      }],
      group: ['medicationName'],
      order: [[sequelize.fn('COUNT', sequelize.col('medicationName')), 'DESC']],
      limit: 5,
      raw: true
    });

    console.log('📊 Statistics calculated successfully');

    res.json({
      success: true,
      data: {
        summary: {
          totalPrescriptions,
          pendingPrescriptions,
          filledPrescriptions,
          partiallyFilledPrescriptions,
          revenue: parseFloat(revenue).toFixed(2)
        },
        topMedications,
        period: parseInt(period)
      },
      message: 'Prescription statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting prescription statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescription statistics',
      error: error.message
    });
  }
};

// Cancel prescription
const cancelPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const pharmacyId = req.user.id;

    console.log('❌ Cancelling prescription:', id);

    const prescription = await Prescription.findOne({
      where: { id, pharmacyId }
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    if (prescription.status === 'filled' || prescription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this prescription'
      });
    }

    await prescription.update({
      status: 'cancelled',
      notes: `${prescription.notes || ''} | Cancelled: ${reason}`
    });

    console.log('✅ Prescription cancelled:', prescription.prescriptionNumber);

    res.json({
      success: true,
      message: 'Prescription cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel prescription',
      error: error.message
    });
  }
};

module.exports = {
  getPrescriptions,
  getPrescription,
  fillPrescription,
  getPrescriptionStats,
  cancelPrescription
};