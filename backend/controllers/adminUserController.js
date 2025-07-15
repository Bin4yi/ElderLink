// backend/controllers/adminUserController.js
const { User } = require('../models');
const { generateTempPassword } = require('../utils/passwordGenerator');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

/**
 * Get all non-family members with pagination and filtering
 */
const getAllNonFamilyUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      role: {
        [Op.ne]: 'family_member' // Exclude family members
      }
    };

    // Add role filter
    if (role && role !== 'all') {
      whereClause.role = role;
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { specialization: { [Op.iLike]: `%${search}%` } },
        { licenseNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add active status filter
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          hasNext,
          hasPrev,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get non-family users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

/**
 * Create a new non-family member user
 */
const createNonFamilyUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      licenseNumber,
      specialization
    } = req.body;

    console.log('🔄 Creating new user:', { email, role });

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, phone, and role are required'
      });
    }

    // Validate role
    const allowedRoles = ['doctor', 'staff', 'elder', 'pharmacist', 'mental_health_consultant'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: ' + allowedRoles.join(', ')
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role-specific requirements
    if (role === 'doctor' && !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'License number is required for doctors'
      });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    console.log('🔐 Generated temporary password for:', email);

    // Create user
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: tempPassword, // Will be hashed by the model hook
      phone: phone.trim(),
      role,
      isActive: true,
      licenseNumber: licenseNumber?.trim() || null,
      specialization: specialization?.trim() || null
    };

    const newUser = await User.create(userData);

    // Send welcome email with temporary password
    try {
      await emailService.sendWelcomeEmail({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }, tempPassword);

      console.log('✅ Welcome email sent to:', newUser.email);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the user creation, just log the error
    }

    // Return user data without password
    const userResponse = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      isActive: newUser.isActive,
      licenseNumber: newUser.licenseNumber,
      specialization: newUser.specialization,
      createdAt: newUser.createdAt
    };

    console.log('✅ User created successfully:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'User created successfully. Welcome email sent with temporary password.',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user information
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      licenseNumber,
      specialization,
      isActive
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing family members
    if (user.role === 'family_member') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify family member accounts through this endpoint'
      });
    }

    // Validate role-specific requirements
    if (user.role === 'doctor' && licenseNumber && !licenseNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'License number cannot be empty for doctors'
      });
    }

    // Update user
    const updatedUser = await user.update({
      firstName: firstName?.trim() || user.firstName,
      lastName: lastName?.trim() || user.lastName,
      phone: phone?.trim() || user.phone,
      licenseNumber: licenseNumber?.trim() || user.licenseNumber,
      specialization: specialization?.trim() || user.specialization,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    console.log('✅ User updated:', updatedUser.email);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        licenseNumber: updatedUser.licenseNumber,
        specialization: updatedUser.specialization,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

/**
 * Deactivate/Activate user account
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating family members
    if (user.role === 'family_member') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate family member accounts'
      });
    }

    await user.update({ isActive });

    console.log(`✅ User ${isActive ? 'activated' : 'deactivated'}:`, user.email);

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('❌ Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

/**
 * Reset user password and send new temporary password
 */
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent resetting family member passwords
    if (user.role === 'family_member') {
      return res.status(403).json({
        success: false,
        message: 'Cannot reset family member passwords through this endpoint'
      });
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();

    // Update user password
    await user.update({ password: tempPassword });

    // Send email with new password
    try {
      await emailService.sendWelcomeEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }, tempPassword);

      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Password was reset but failed to send email notification'
      });
    }

    console.log('✅ Password reset for user:', user.email);

    res.json({
      success: true,
      message: 'Password reset successfully. New temporary password sent via email.',
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

/**
 * Get user statistics for dashboard
 */
const getUserStats = async (req, res) => {
  try {
    const stats = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('role')), 'count']
      ],
      where: {
        role: { [Op.ne]: 'family_member' }
      },
      group: ['role'],
      raw: true
    });

    const totalActive = await User.count({
      where: {
        role: { [Op.ne]: 'family_member' },
        isActive: true
      }
    });

    const totalInactive = await User.count({
      where: {
        role: { [Op.ne]: 'family_member' },
        isActive: false
      }
    });

    res.json({
      success: true,
      stats: {
        byRole: stats,
        totalActive,
        totalInactive,
        total: totalActive + totalInactive
      }
    });

  } catch (error) {
    console.error('❌ Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

module.exports = {
  getAllNonFamilyUsers,
  createNonFamilyUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  getUserStats
};