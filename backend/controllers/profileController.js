// backend/controllers/profileController.js
const { User, StaffAssignment ,Prescription, Delivery } = require("../models");
const bcrypt = require("bcryptjs");
// const { User, StaffAssignment, Prescription, Delivery } = require('../models');
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
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "specialization",
        "licenseNumber",
        "profileImage",
        "photo",
        "isActive",
        "role",
        "createdAt",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify user is staff
    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Staff role required.",
      });
    }

    // Count active elder assignments
    const connectedEldersCount = await StaffAssignment.count({
      where: {
        staffId: userId,
        isActive: true,
      },
    });

    // Format profile data
    const profile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      specialization: user.specialization || "",
      licenseNumber: user.licenseNumber || "",
      profileImage: user.profileImage || user.photo || "",
      isActive: user.isActive,
      role: user.role,
      joinedDate: user.createdAt,
      connectedElders: connectedEldersCount,
    };

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching staff profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

/**
 * Update staff profile information
 */
exports.updateStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, specialization, licenseNumber } =
      req.body;

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify user is staff
    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Staff role required.",
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
        isActive: true,
      },
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
      connectedElders: connectedEldersCount,
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating staff profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/**
 * Change staff password
 */
exports.changeStaffPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify user is staff
    if (user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Staff role required.",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password (will be hashed by the beforeUpdate hook in User model)
    user.password = newPassword;
    user.lastPasswordChange = new Date();

    await user.save();

    console.log("✅ Password changed successfully for staff:", user.email);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing staff password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
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
        'experience',
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

    // Format profile data
    const profile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      specialization: user.specialization || 'Clinical Pharmacy',
      licenseNumber: user.licenseNumber || '',
      experience: user.experience || 0,
      profileImage: user.profileImage || user.photo || '',
      isActive: user.isActive,
      role: user.role,
      joinedDate: user.createdAt
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
      licenseNumber,
      experience
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
    if (experience !== undefined) user.experience = experience;

    // Save changes
    await user.save();

    // Return updated profile
    const updatedProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      experience: user.experience,
      profileImage: user.profileImage || user.photo,
      isActive: user.isActive,
      role: user.role,
      joinedDate: user.createdAt
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

/**
 * Get family member profile information
 */
exports.getFamilyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user with family_member role
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'firstName', 
        'lastName', 
        'email', 
        'phone', 
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

    // Verify user is family member
    if (user.role !== 'family_member') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Family member role required.'
      });
    }

    // Get connected elders from subscriptions
    const { Subscription, Elder } = require('../models');
    const subscriptions = await Subscription.findAll({
      where: {
        userId: userId,
        status: 'active'
      },
      include: [{
        model: Elder,
        as: 'elder',
        attributes: ['id', 'firstName', 'lastName', 'isActive']
      }]
    });

    const connectedElders = subscriptions.map(sub => ({
      id: sub.elder?.id,
      name: sub.elder ? `${sub.elder.firstName} ${sub.elder.lastName}` : 'N/A',
      relationship: 'Elder', // Generic relationship since it's not stored in Elder table
      status: sub.elder?.isActive ? 'Active' : 'Inactive'
    }));

    // Format profile data
    const profile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      profileImage: user.profileImage || user.photo || '',
      isActive: user.isActive,
      role: user.role,
      joinedDate: user.createdAt,
      connectedElders: connectedElders
    };

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching family profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update family member profile information
 * Note: Email and name cannot be changed
 */
exports.updateFamilyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, profileImage } = req.body;

    // Reject if trying to update email or name
    if (req.body.email || req.body.firstName || req.body.lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email and name cannot be changed. Please contact support if you need to update these fields.'
      });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user is family member
    if (user.role !== 'family_member') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Family member role required.'
      });
    }

    // Update allowed fields
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Save changes
    await user.save();

    // Get connected elders
    const { Subscription, Elder } = require('../models');
    const subscriptions = await Subscription.findAll({
      where: {
        userId: userId,
        status: 'active'
      },
      include: [{
        model: Elder,
        as: 'elder',
        attributes: ['id', 'firstName', 'lastName', 'isActive']
      }]
    });

    const connectedElders = subscriptions.map(sub => ({
      id: sub.elder?.id,
      name: sub.elder ? `${sub.elder.firstName} ${sub.elder.lastName}` : 'N/A',
      relationship: 'Elder', // Generic relationship since it's not stored in Elder table
      status: sub.elder?.isActive ? 'Active' : 'Inactive'
    }));

    // Return updated profile
    const updatedProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || user.photo,
      isActive: user.isActive,
      role: user.role,
      joinedDate: user.createdAt,
      connectedElders: connectedElders
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error updating family profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Get user settings/preferences
 */
exports.getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create user settings
    const { UserSettings } = require('../models');
    let settings = await UserSettings.findOne({
      where: { userId }
    });

    // If no settings exist, create default
    if (!settings) {
      settings = await UserSettings.create({
        userId,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        emergencyAlerts: true,
        healthReminders: true,
        appointmentReminders: true,
        profileVisibility: 'family',
        shareHealthData: false,
        allowDataAnalytics: true,
        darkMode: false,
        language: 'english',
        timezone: 'EST',
        soundEnabled: true
      });
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

/**
 * Update user settings/preferences
 */
exports.updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      emergencyAlerts,
      healthReminders,
      appointmentReminders,
      profileVisibility,
      shareHealthData,
      allowDataAnalytics,
      darkMode,
      language,
      timezone,
      soundEnabled
    } = req.body;

    // Get or create user settings
    const { UserSettings } = require('../models');
    let settings = await UserSettings.findOne({
      where: { userId }
    });

    if (!settings) {
      settings = await UserSettings.create({ userId });
    }

    // Update fields
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) settings.smsNotifications = smsNotifications;
    if (pushNotifications !== undefined) settings.pushNotifications = pushNotifications;
    if (emergencyAlerts !== undefined) settings.emergencyAlerts = emergencyAlerts;
    if (healthReminders !== undefined) settings.healthReminders = healthReminders;
    if (appointmentReminders !== undefined) settings.appointmentReminders = appointmentReminders;
    if (profileVisibility !== undefined) settings.profileVisibility = profileVisibility;
    if (shareHealthData !== undefined) settings.shareHealthData = shareHealthData;
    if (allowDataAnalytics !== undefined) settings.allowDataAnalytics = allowDataAnalytics;
    if (darkMode !== undefined) settings.darkMode = darkMode;
    if (language !== undefined) settings.language = language;
    if (timezone !== undefined) settings.timezone = timezone;
    if (soundEnabled !== undefined) settings.soundEnabled = soundEnabled;

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};
