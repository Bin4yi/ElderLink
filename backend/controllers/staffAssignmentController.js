const { Elder, User, StaffAssignment } = require('../models');
const { Op } = require('sequelize');

// Get all available staff members
const getAvailableStaff = async (req, res) => {
  try {
    console.log('🔍 Getting available staff members');
    
    const staff = await User.findAll({
      where: {
        role: 'staff',
        isActive: true
      },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'phone', 
        'specialization', 'experience', 'profileImage'
        // ✅ No alias here
      ]
    });

    // Process staff data
    const staffWithWorkload = await Promise.all(
      staff.map(async (member) => {
        let currentWorkload = 0;
        
        // Try to get current workload
        try {
          if (StaffAssignment) {
            currentWorkload = await StaffAssignment.count({
              where: {
                staffId: member.id,
                isActive: true
              }
            });
          }
        } catch (error) {
          console.log('⚠️ Could not count assignments, using 0');
        }

        const staffData = member.toJSON();
        return {
          ...staffData,
          photo: staffData.profileImage, // ✅ Map after query
          currentWorkload: currentWorkload,
          isAvailable: currentWorkload < 10
        };
      })
    );

    res.json({
      success: true,
      data: {
        staff: staffWithWorkload,
        total: staffWithWorkload.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting available staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available staff',
      error: error.message
    });
  }
};

// Assign elder to staff member
const assignElderToStaff = async (req, res) => {
  try {
    const { elderId, staffId } = req.body;
    const familyMemberId = req.user.id;

    console.log('📝 Assigning elder to staff:', { elderId, staffId, familyMemberId });

    // Validate elder exists and belongs to family member
    const elder = await Elder.findOne({
      where: {
        id: elderId,
        '$subscription.userId$': familyMemberId
      },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'userId']
        }
      ]
    });

    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found or you do not have permission to assign this elder'
      });
    }

    // Validate staff member exists and is active
    const staff = await User.findOne({
      where: {
        id: staffId,
        role: 'staff',
        isActive: true
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found or is not active'
      });
    }

    // Check if elder is already assigned to this staff member
    const existingAssignment = await StaffAssignment.findOne({
      where: {
        elderId,
        staffId,
        status: 'active'
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Elder is already assigned to this staff member'
      });
    }

    // Check staff workload
    const currentWorkload = await StaffAssignment.count({
      where: {
        staffId,
        status: 'active'
      }
    });

    if (currentWorkload >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Staff member has reached maximum capacity (10 elders)'
      });
    }

    // Deactivate any existing assignment for this elder
    await StaffAssignment.update(
      { status: 'inactive', unassignedAt: new Date() },
      {
        where: {
          elderId,
          status: 'active'
        }
      }
    );

    // Create new assignment
    const assignment = await StaffAssignment.create({
      elderId,
      staffId,
      assignedBy: familyMemberId,
      status: 'active',
      assignedAt: new Date()
    });

    // Fetch the complete assignment with relations
    const newAssignment = await StaffAssignment.findByPk(assignment.id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email', 'specialization']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    console.log('✅ Elder assigned to staff successfully');

    res.status(201).json({
      success: true,
      message: 'Elder assigned to staff member successfully',
      data: {
        assignment: newAssignment
      }
    });

  } catch (error) {
    console.error('❌ Error assigning elder to staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign elder to staff',
      error: error.message
    });
  }
};

// Get elder's current staff assignment
const getElderStaffAssignment = async (req, res) => {
  try {
    const { elderId } = req.params;
    const familyMemberId = req.user.id;

    console.log('🔍 Getting elder staff assignment:', elderId);

    // Validate elder belongs to family member
    const elder = await Elder.findOne({
      where: {
        id: elderId,
        '$subscription.userId$': familyMemberId
      },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'userId']
        }
      ]
    });

    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found or access denied'
      });
    }

    // Get current assignment
    const assignment = await StaffAssignment.findOne({
      where: {
        elderId,
        status: 'active'
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'specialization', 'experience', 'photo']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        assignment: assignment || null,
        hasAssignment: !!assignment
      }
    });

  } catch (error) {
    console.error('❌ Error getting elder staff assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get elder staff assignment',
      error: error.message
    });
  }
};

// Unassign elder from staff
const unassignElderFromStaff = async (req, res) => {
  try {
    const { elderId } = req.params;
    const familyMemberId = req.user.id;

    console.log('📝 Unassigning elder from staff:', elderId);

    // Validate elder belongs to family member
    const elder = await Elder.findOne({
      where: {
        id: elderId,
        '$subscription.userId$': familyMemberId
      },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'userId']
        }
      ]
    });

    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found or access denied'
      });
    }

    // Find and deactivate assignment
    const assignment = await StaffAssignment.findOne({
      where: {
        elderId,
        status: 'active'
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'No active assignment found for this elder'
      });
    }

    await assignment.update({
      status: 'inactive',
      unassignedAt: new Date(),
      unassignedBy: familyMemberId
    });

    console.log('✅ Elder unassigned from staff successfully');

    res.json({
      success: true,
      message: 'Elder unassigned from staff successfully'
    });

  } catch (error) {
    console.error('❌ Error unassigning elder from staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign elder from staff',
      error: error.message
    });
  }
};

// Get family's staff assignments
const getFamilyStaffAssignments = async (req, res) => {
  try {
    const familyMemberId = req.user.id;

    console.log('🔍 Getting family staff assignments');

    const assignments = await StaffAssignment.findAll({
      where: {
        assignedBy: familyMemberId,
        status: 'active'
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'specialization', 'experience', 'photo']
        }
      ],
      order: [['assignedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        assignments,
        total: assignments.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting family staff assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family staff assignments',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableStaff,
  assignElderToStaff,
  getElderStaffAssignment,
  unassignElderFromStaff,
  getFamilyStaffAssignments
};