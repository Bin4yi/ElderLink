const { Prescription, PrescriptionItem, User, Elder, Doctor, Inventory, InventoryTransaction, Subscription, Delivery } = require('../models');
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
        },
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'deliveryNumber', 'status', 'scheduledDate', 'deliveredDate'],
          required: false
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
            attributes: ['specialization', 'licenseNumber']
          }],
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'address']
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
    const { items, totalAmount } = req.body;
    const pharmacyId = req.user.id;

    console.log('💊 Filling prescription:', id);

    const prescription = await Prescription.findOne({
      where: { id, pharmacyId },
      include: [
        {
          model: PrescriptionItem,
          as: 'items'
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName'],
          include: [{
            model: Subscription,
            as: 'subscription',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }]
          }]
        }
      ],
      transaction
    });

    if (!prescription) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Prescription not found or not assigned to your pharmacy'
      });
    }

    if (prescription.status !== 'pending' && prescription.status !== 'partially_filled') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Prescription cannot be filled'
      });
    }

    let allItemsFilled = true;
    let anyItemFilled = false;

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

      // Update prescription item with pharmacy data
      // Handle manual entry (inventoryId will be 'manual' or null)
      const inventoryIdToSave = (itemUpdate.inventoryId && itemUpdate.inventoryId !== 'manual') 
        ? itemUpdate.inventoryId 
        : null;

      await prescriptionItem.update({
        inventoryId: inventoryIdToSave,
        quantityDispensed: itemUpdate.quantityDispensed,
        unitPrice: itemUpdate.unitPrice,
        totalPrice: itemUpdate.totalPrice,
        status: itemUpdate.status,
        notes: itemUpdate.notes || prescriptionItem.notes
      }, { transaction });

      // Update inventory if item was matched (not manual entry)
      if (inventoryIdToSave && itemUpdate.quantityDispensed > 0) {
        const inventoryItem = await Inventory.findOne({
          where: {
            id: itemUpdate.inventoryId,
            pharmacyId
          },
          transaction
        });

        if (inventoryItem) {
          // Update inventory quantity
          await inventoryItem.update({
            quantity: inventoryItem.quantity - itemUpdate.quantityDispensed,
            totalSold: inventoryItem.totalSold + itemUpdate.quantityDispensed
          }, { transaction });

          // Create inventory transaction
          await InventoryTransaction.create({
            inventoryId: inventoryItem.id,
            type: 'stock_out',
            quantity: itemUpdate.quantityDispensed,
            reason: 'Prescription fill',
            performedBy: req.user.id,
            referenceNumber: prescription.prescriptionNumber,
            unitCost: itemUpdate.unitPrice,
            totalAmount: itemUpdate.totalPrice
          }, { transaction });

          anyItemFilled = true;
        }
      }

      if (itemUpdate.status !== 'filled') {
        allItemsFilled = false;
      }
    }

    // Update prescription status
    const newStatus = allItemsFilled ? 'filled' : anyItemFilled ? 'partially_filled' : 'pending';
    
    await prescription.update({
      status: newStatus,
      filledDate: allItemsFilled ? new Date() : prescription.filledDate,
      filledBy: req.user.id,
      totalAmount: totalAmount || 0
    }, { transaction });

    await transaction.commit();

    console.log('✅ Prescription filled successfully:', prescription.prescriptionNumber);

    // Send email notification to family member
    if (prescription.elder?.subscription?.user) {
      try {
        const familyMember = prescription.elder.subscription.user;
        const emailService = require('../services/emailService');
        
        // Prepare bill items
        const billItems = prescription.items.map(item => ({
          name: item.medicationName,
          quantity: item.quantityDispensed,
          unitPrice: item.unitPrice,
          total: item.totalPrice,
          status: item.status
        }));

        await emailService.sendPrescriptionBillEmail({
          to: familyMember.email,
          familyMemberName: `${familyMember.firstName} ${familyMember.lastName}`,
          elderName: `${prescription.elder.firstName} ${prescription.elder.lastName}`,
          prescriptionNumber: prescription.prescriptionNumber,
          doctorName: `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
          items: billItems,
          totalAmount: prescription.totalAmount,
          status: newStatus
        });

        console.log('📧 Bill email sent to family member:', familyMember.email);
      } catch (emailError) {
        console.error('❌ Error sending bill email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      data: {
        prescriptionId: prescription.id,
        status: newStatus,
        totalAmount: prescription.totalAmount
      },
      message: `Prescription ${newStatus === 'filled' ? 'filled' : 'partially filled'} successfully. Bill sent to family member.`
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

/**
 * DOCTOR FUNCTIONS
 * Doctor creates a prescription for an elder - NEW WORKFLOW
 * Doctor enters medication details manually and selects pharmacy
 * Pharmacy will fill the prescription later (match inventory, calculate bill)
 */
const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { elderId, pharmacyId, items, notes, deliveryRequired, deliveryAddress, priority } = req.body;

    // Validation
    if (!elderId) {
      return res.status(400).json({
        success: false,
        message: "Elder ID is required",
      });
    }

    if (!pharmacyId) {
      return res.status(400).json({
        success: false,
        message: "Pharmacy selection is required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medication is required",
      });
    }

    // Verify elder exists
    const elder = await Elder.findByPk(elderId);
    if (!elder) {
      return res.status(404).json({
        success: false,
        message: "Elder not found",
      });
    }

    // Verify pharmacy exists and is active
    const pharmacy = await User.findOne({
      where: { 
        id: pharmacyId, 
        role: 'pharmacist',
        isActive: true 
      }
    });
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Selected pharmacy not found or inactive",
      });
    }

    // Generate prescription number
    const prescriptionNumber = `RX${Date.now()}`;

    // Create prescription (totalAmount will be calculated by pharmacy)
    const prescription = await Prescription.create({
      prescriptionNumber,
      doctorId,
      elderId,
      pharmacyId,
      status: "pending",
      issuedDate: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
      totalAmount: 0, // Will be filled by pharmacy
      notes,
      deliveryRequired: deliveryRequired !== false,
      deliveryAddress: deliveryAddress || null,
      priority: priority || "normal",
    });

    // Create prescription items (doctor enters medication details manually)
    // inventoryId, prices, and quantities dispensed will be filled by pharmacy
    for (const item of items) {
      await PrescriptionItem.create({
        prescriptionId: prescription.id,
        inventoryId: null, // Pharmacy will match this later
        medicationName: item.medicationName || item.name,
        genericName: item.genericName || null,
        strength: item.strength || null,
        dosage: item.dosage || "",
        frequency: item.frequency || "",
        duration: item.duration || "",
        quantityPrescribed: item.quantityPrescribed || item.quantity,
        quantityDispensed: 0, // Pharmacy will fill this
        instructions: item.instructions || "",
        substitutionAllowed: item.substitutionAllowed !== false,
        unitPrice: 0, // Pharmacy will set this
        totalPrice: 0, // Pharmacy will calculate this
        status: "pending",
      });
    }

    // Fetch complete prescription with relationships
    const completePrescription = await Prescription.findByPk(prescription.id, {
      include: [
        { 
          model: Elder, 
          as: "elder", 
          attributes: ["id", "firstName", "lastName", "dateOfBirth"] 
        },
        { 
          model: User, 
          as: "doctor", 
          attributes: ["id", "firstName", "lastName", "email"] 
        },
        { 
          model: User, 
          as: "pharmacy", 
          attributes: ["id", "firstName", "lastName", "email", "phone"] 
        },
        {
          model: PrescriptionItem,
          as: "items",
        },
      ],
    });

    console.log('✅ Prescription created successfully:', prescriptionNumber);

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: completePrescription,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};

/**
 * Get all prescriptions created by a doctor
 */
const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { status, elderId } = req.query;

    const whereClause = { doctorId };
    if (status) whereClause.status = status;
    if (elderId) whereClause.elderId = elderId;

    const prescriptions = await Prescription.findAll({
      where: whereClause,
      include: [
        { model: Elder, as: "elder", attributes: ["id", "firstName", "lastName"] },
        {
          model: PrescriptionItem,
          as: "items",
          include: [{ model: Inventory, as: "inventory" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};

module.exports = {
  getPrescriptions,
  getPrescription,
  fillPrescription,
  getPrescriptionStats,
  cancelPrescription,
  // Doctor functions
  createPrescription,
  getDoctorPrescriptions,
};