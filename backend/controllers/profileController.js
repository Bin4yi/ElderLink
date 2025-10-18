// backend/controllers/profileController.js
const { User, StaffAssignment, Prescription, Delivery } = require('../models');
const { Op } = require('sequelize');

/**
 * Get staff profile information
 */
exports.getStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user with staff role
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'firstName', 
        'lastName', 
        'email', 
        'phone', 
        'specialization',
        'licenseNumber',
        'profileImage',
        'photo',
        'isActive',
        'role',
        'createdAt'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user is staff
    if (user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff role required.'
      });
    }

    // Count active elder assignments
    const connectedEldersCount = await StaffAssignment.count({
      where: {
        staffId: userId,
        isActive: true
      }
    });

    // Format profile data
    const profile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      specialization: user.specialization || '',
      licenseNumber: user.licenseNumber || '',
      profileImage: user.profileImage || user.photo || '',
      isActive: user.isActive,
      role: user.role,
      joinedDate: user.createdAt,
      connectedElders: connectedEldersCount
    };

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update staff profile information
 */
exports.updateStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      firstName, 
      lastName, 
      phone, 
      specialization,
      licenseNumber
    } = req.body;

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user is staff
    if (user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff role required.'
      });
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (specialization !== undefined) user.specialization = specialization;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;

    // Save changes
    await user.save();

    // Count active elder assignments for updated profile
    const connectedEldersCount = await StaffAssignment.count({
      where: {
        staffId: userId,
        isActive: true
      }
    });

    // Return updated profile
    const updatedProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      profileImage: user.profileImage || user.photo,
      isActive: user.isActive,
      role: user.role,
      joinedDate: user.createdAt,
      connectedElders: connectedEldersCount
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Get pharmacist profile information
 */
exports.getPharmacistProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user with pharmacist role
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'firstName', 
        'lastName', 
        'email', 
        'phone', 
        'specialization',
        'licenseNumber',
        'profileImage',
        'photo',
        'isActive',
        'role',
        'createdAt'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user is pharmacist
    if (user.role !== 'pharmacist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pharmacist role required.'
      });
    }

    // Get current month start date
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // Count prescriptions filled this month
    const prescriptionsFilledThisMonth = await Prescription.count({
      where: {
        filledBy: userId,
        filledDate: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Count total prescriptions filled
    const totalPrescriptionsFilled = await Prescription.count({
      where: {
        filledBy: userId,
        status: {
          [Op.in]: ['filled', 'partially_filled']
        }
      }
    });

    // Count deliveries this month
    const deliveriesThisMonth = await Delivery.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Format profile data
    const profile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      specialization: user.specialization || 'Clinical Pharmacy',
      licenseNumber: user.licenseNumber || '',
      profileImage: user.profileImage || user.photo || '',
      isActive: user.isActive,
      role: user.role,
      department: 'Pharmacy Department',
      location: 'Main Hospital',
      joinDate: user.createdAt,
      stats: {
        prescriptionsThisMonth: prescriptionsFilledThisMonth,
        totalPrescriptions: totalPrescriptionsFilled,
        deliveriesThisMonth: deliveriesThisMonth
      }
    };

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching pharmacist profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update pharmacist profile information
 */
exports.updatePharmacistProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      firstName, 
      lastName, 
      phone, 
      specialization,
      licenseNumber
    } = req.body;

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user is pharmacist
    if (user.role !== 'pharmacist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pharmacist role required.'
      });
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (specialization !== undefined) user.specialization = specialization;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;

    // Save changes
    await user.save();

    // Get stats
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const prescriptionsFilledThisMonth = await Prescription.count({
      where: {
        filledBy: userId,
        filledDate: {
          [Op.gte]: startOfMonth
        }
      }
    });

    const totalPrescriptionsFilled = await Prescription.count({
      where: {
        filledBy: userId,
        status: {
          [Op.in]: ['filled', 'partially_filled']
        }
      }
    });

    const deliveriesThisMonth = await Delivery.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Return updated profile
    const updatedProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      profileImage: user.profileImage || user.photo,
      isActive: user.isActive,
      role: user.role,
      department: 'Pharmacy Department',
      location: 'Main Hospital',
      joinDate: user.createdAt,
      stats: {
        prescriptionsThisMonth: prescriptionsFilledThisMonth,
        totalPrescriptions: totalPrescriptionsFilled,
        deliveriesThisMonth: deliveriesThisMonth
      }
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error updating pharmacist profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};
