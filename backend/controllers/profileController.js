// backend/controllers/profileController.js
const { User, StaffAssignment } = require("../models");
const bcrypt = require("bcryptjs");

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
 * Change pharmacist password
 */
exports.changePharmacistPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
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

    // Verify user is pharmacist
    if (user.role !== 'pharmacist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pharmacist role required.'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password (will be hashed by the beforeUpdate hook in User model)
    user.password = newPassword;
    user.lastPasswordChange = new Date();

    await user.save();

    console.log('✅ Password changed successfully for pharmacist:', user.email);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing pharmacist password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};
