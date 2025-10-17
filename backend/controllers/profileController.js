// backend/controllers/profileController.js
const { User, StaffAssignment } = require('../models');

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
