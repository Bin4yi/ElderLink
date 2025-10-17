// backend/controllers/deliveryController.js
const {
  Delivery,
  Prescription,
  PrescriptionItem,
  Elder,
  User,
  Inventory,
} = require("../models");
const { Op } = require("sequelize");
const emailService = require("../services/emailService");

/**
 * Create delivery for a prescription (Pharmacist)
 */
exports.createDelivery = async (req, res) => {
  try {
    const pharmacistId = req.user.id;
    const { prescriptionId, deliveryAddress, contactPhone, scheduledDate, notes } = req.body;

    // Fetch prescription with items
    const prescription = await Prescription.findByPk(prescriptionId, {
      include: [
        { model: Elder, as: "elder" },
        { model: PrescriptionItem, as: "items" },
      ],
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.status !== "filled" && prescription.status !== "partially_filled") {
      return res.status(400).json({
        success: false,
        message: "Prescription must be filled before creating delivery",
      });
    }

    // Check if delivery already exists
    const existingDelivery = await Delivery.findOne({ where: { prescriptionId } });
    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: "Delivery already exists for this prescription",
      });
    }

    // Generate delivery number
    const deliveryNumber = `DLV${Date.now()}`;

    // Create delivery
    const delivery = await Delivery.create({
      deliveryNumber,
      prescriptionId,
      elderId: prescription.elderId,
      pharmacistId,
      status: "pending",
      deliveryAddress: deliveryAddress || prescription.deliveryAddress || prescription.elder.address,
      contactPhone: contactPhone || prescription.elder.phone,
      scheduledDate: scheduledDate || new Date(),
      estimatedValue: prescription.totalAmount,
      notes,
    });

    // Update prescription status
    await prescription.update({ status: "ready_for_delivery" });

    // Fetch complete delivery
    const completeDelivery = await Delivery.findByPk(delivery.id, {
      include: [
        { model: Elder, as: "elder", attributes: ["id", "firstName", "lastName", "phone"] },
        { model: User, as: "pharmacist", attributes: ["id", "firstName", "lastName"] },
        {
          model: Prescription,
          as: "prescription",
          include: [{ model: PrescriptionItem, as: "items" }],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      delivery: completeDelivery,
    });
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create delivery",
      error: error.message,
    });
  }
};

/**
 * Get all deliveries for pharmacist
 */
exports.getDeliveries = async (req, res) => {
  try {
    const pharmacistId = req.user.id;
    const { status, date } = req.query;

    const whereClause = { pharmacistId };
    if (status && status !== "all") whereClause.status = status;
    if (date && date !== "all") {
      whereClause.scheduledDate = {
        [Op.gte]: new Date(date),
        [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const deliveries = await Delivery.findAll({
      where: whereClause,
      include: [
        { model: Elder, as: "elder", attributes: ["id", "firstName", "lastName", "phone", "address"] },
        {
          model: Prescription,
          as: "prescription",
          include: [
            {
              model: PrescriptionItem,
              as: "items",
              include: [{ model: Inventory, as: "inventory" }],
            },
          ],
        },
      ],
      order: [["scheduledDate", "ASC"]],
    });

    res.json({
      success: true,
      deliveries,
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deliveries",
      error: error.message,
    });
  }
};

/**
 * Update delivery status
 */
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: Elder,
          as: "elder",
          include: [{ model: User, as: "user", attributes: ["email", "firstName", "lastName"] }],
        },
        { model: Prescription, as: "prescription" },
      ],
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;
    
    // If delivered, set delivered date and update prescription
    if (status === "delivered") {
      updateData.deliveredDate = new Date();
      await delivery.prescription.update({
        status: "delivered",
        deliveryDate: new Date(),
      });

      // Send email to family member
      try {
        const familyEmail = delivery.elder.user?.email;
        if (familyEmail) {
          await emailService.sendEmail({
            to: familyEmail,
            subject: `Medication Delivered - ${delivery.elder.firstName} ${delivery.elder.lastName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Medication Delivery Confirmation</h2>
                <p>Dear ${delivery.elder.user.firstName},</p>
                <p>This is to inform you that the prescribed medications for <strong>${delivery.elder.firstName} ${delivery.elder.lastName}</strong> have been successfully delivered.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">Delivery Details:</h3>
                  <p><strong>Delivery Number:</strong> ${delivery.deliveryNumber}</p>
                  <p><strong>Delivered Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Delivery Address:</strong> ${delivery.deliveryAddress}</p>
                  <p><strong>Total Value:</strong> LKR ${delivery.estimatedValue}</p>
                </div>

                <p>Please ensure that the medications are stored properly and administered as per the prescription instructions.</p>
                
                <p style="margin-top: 30px;">
                  <strong>Best regards,</strong><br>
                  ElderLink Pharmacy Team
                </p>
              </div>
            `,
          });
          console.log(`✅ Delivery notification email sent to ${familyEmail}`);
        }
      } catch (emailError) {
        console.error("Error sending delivery email:", emailError);
        // Don't fail the request if email fails
      }
    }

    await delivery.update(updateData);

    // Fetch updated delivery
    const updatedDelivery = await Delivery.findByPk(id, {
      include: [
        { model: Elder, as: "elder", attributes: ["id", "firstName", "lastName"] },
        { model: Prescription, as: "prescription" },
      ],
    });

    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
      error: error.message,
    });
  }
};

/**
 * Get delivery statistics
 */
exports.getDeliveryStats = async (req, res) => {
  try {
    const pharmacistId = req.user.id;

    const totalDeliveries = await Delivery.count({ where: { pharmacistId } });
    const pendingDeliveries = await Delivery.count({
      where: { pharmacistId, status: "pending" },
    });
    const inTransitDeliveries = await Delivery.count({
      where: { pharmacistId, status: "in_transit" },
    });
    const deliveredToday = await Delivery.count({
      where: {
        pharmacistId,
        status: "delivered",
        deliveredDate: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    res.json({
      success: true,
      stats: {
        totalDeliveries,
        pendingDeliveries,
        inTransitDeliveries,
        deliveredToday,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery stats",
      error: error.message,
    });
  }
};
