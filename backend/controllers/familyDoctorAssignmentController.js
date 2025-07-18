const { 
  FamilyDoctorAssignment, 
  Doctor, 
  User, 
  Elder, 
  AssignmentHistory 
} = require('../models');
const { Op } = require('sequelize');

class FamilyDoctorAssignmentController {
  // Get available doctors for assignment
  static async getAvailableDoctors(req, res) {
    try {
      console.log('🔍 Getting available doctors for assignment...');
      
      const doctors = await Doctor.findAll({
        where: {
          isActive: true,
          verificationStatus: 'Verified'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
          }
        ],
        attributes: [
          'id', 'specialization', 'experience', 'consultationFee', 
          'licenseNumber', 'availableDays', 'timeSlots', 'bio', 
          'clinicAddress', 'medicalSchool'
        ],
        order: [['experience', 'DESC']]
      });

      console.log('✅ Found', doctors.length, 'available doctors');

      res.json({
        success: true,
        data: {
          doctors,
          total: doctors.length
        }
      });
    } catch (error) {
      console.error('❌ Get available doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available doctors',
        error: error.message
      });
    }
  }

  // Assign doctor to family/elder
  static async assignDoctor(req, res) {
    try {
      const { 
        doctorId, 
        elderId, 
        assignmentType = 'primary',
        priority = 'medium',
        notes 
      } = req.body;
      const familyMemberId = req.user.id;

      console.log('📝 Assigning doctor:', { doctorId, elderId, assignmentType, familyMemberId });

      // Validate doctor exists and is active
      const doctor = await Doctor.findOne({
        where: {
          id: doctorId,
          isActive: true,
          verificationStatus: 'Verified'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }
        ]
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found or not available'
        });
      }

      // If elderId is provided, validate elder belongs to family member
      if (elderId) {
        const elder = await Elder.findOne({
          include: [{
            model: Subscription,
            as: 'subscription',
            where: {
              userId: familyMemberId,
              status: 'active'
            }
          }],
          where: { id: elderId }
        });

        if (!elder) {
          return res.status(404).json({
            success: false,
            message: 'Elder not found or access denied'
          });
        }
      }

      // Check for existing active assignment
      const existingAssignment = await FamilyDoctorAssignment.findOne({
        where: {
          familyMemberId,
          doctorId,
          elderId: elderId || null,
          assignmentType,
          isActive: true
        }
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'Doctor is already assigned to this family member/elder'
        });
      }

      // Create new assignment
      const assignment = await FamilyDoctorAssignment.create({
        familyMemberId,
        doctorId,
        elderId: elderId || null,
        assignmentType,
        priority,
        notes,
        assignedBy: familyMemberId,
        assignedDate: new Date(),
        status: 'pending',
        isActive: true
      });

      // Create history record
      await AssignmentHistory.create({
        assignmentId: assignment.id,
        action: 'assigned',
        newStatus: 'pending',
        actionBy: familyMemberId,
        notes: 'Doctor assigned to family/elder'
      });

      console.log('✅ Doctor assignment created:', assignment.id);

      // Return assignment with related data
      const assignmentWithData = await FamilyDoctorAssignment.findByPk(assignment.id, {
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email', 'phone']
            }]
          },
          {
            model: Elder,
            as: 'elder',
            attributes: ['firstName', 'lastName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Doctor assigned successfully',
        data: assignmentWithData
      });
    } catch (error) {
      console.error('❌ Assign doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign doctor',
        error: error.message
      });
    }
  }

  // Get family's doctor assignments
  static async getFamilyDoctorAssignments(req, res) {
    try {
      const { status, assignmentType, elderId } = req.query;
      const familyMemberId = req.user.id;

      console.log('🔍 Getting family doctor assignments for:', familyMemberId);

      const whereClause = { familyMemberId };

      if (status) {
        whereClause.status = status;
      }

      if (assignmentType) {
        whereClause.assignmentType = assignmentType;
      }

      if (elderId) {
        whereClause.elderId = elderId;
      }

      const assignments = await FamilyDoctorAssignment.findAll({
        where: whereClause,
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email', 'phone', 'profileImage']
            }]
          },
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo']
          }
        ],
        order: [['assignedDate', 'DESC']]
      });

      console.log('✅ Found', assignments.length, 'assignments');

      res.json({
        success: true,
        data: {
          assignments,
          total: assignments.length
        }
      });
    } catch (error) {
      console.error('❌ Get family doctor assignments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get doctor assignments',
        error: error.message
      });
    }
  }

  // Get specific assignment details
  static async getAssignmentDetails(req, res) {
    try {
      const { assignmentId } = req.params;
      const familyMemberId = req.user.id;

      console.log('🔍 Getting assignment details:', assignmentId);

      const assignment = await FamilyDoctorAssignment.findOne({
        where: {
          id: assignmentId,
          familyMemberId
        },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email', 'phone', 'profileImage']
            }]
          },
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo']
          },
          {
            model: AssignmentHistory,
            as: 'history',
            include: [{
              model: User,
              as: 'actionByUser',
              attributes: ['firstName', 'lastName']
            }],
            order: [['actionDate', 'DESC']]
          }
        ]
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      res.json({
        success: true,
        data: assignment
      });
    } catch (error) {
      console.error('❌ Get assignment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get assignment details',
        error: error.message
      });
    }
  }

  // Update assignment
  static async updateAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const { priority, notes, assignmentType } = req.body;
      const familyMemberId = req.user.id;

      console.log('📝 Updating assignment:', assignmentId);

      const assignment = await FamilyDoctorAssignment.findOne({
        where: {
          id: assignmentId,
          familyMemberId,
          isActive: true
        }
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      const previousStatus = assignment.status;
      const updateData = {};

      if (priority) updateData.priority = priority;
      if (notes) updateData.notes = notes;
      if (assignmentType) updateData.assignmentType = assignmentType;

      await assignment.update(updateData);

      // Create history record
      await AssignmentHistory.create({
        assignmentId: assignment.id,
        action: 'updated',
        previousStatus,
        newStatus: assignment.status,
        actionBy: familyMemberId,
        notes: 'Assignment updated'
      });

      console.log('✅ Assignment updated successfully');

      res.json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error) {
      console.error('❌ Update assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update assignment',
        error: error.message
      });
    }
  }

  // Remove/deactivate assignment
  static async removeAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const familyMemberId = req.user.id;

      console.log('📝 Removing assignment:', assignmentId);

      const assignment = await FamilyDoctorAssignment.findOne({
        where: {
          id: assignmentId,
          familyMemberId,
          isActive: true
        }
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      await assignment.update({
        isActive: false,
        unassignedDate: new Date(),
        status: 'inactive'
      });

      // Create history record
      await AssignmentHistory.create({
        assignmentId: assignment.id,
        action: 'unassigned',
        previousStatus: assignment.status,
        newStatus: 'inactive',
        actionBy: familyMemberId,
        notes: 'Assignment removed by family member'
      });

      console.log('✅ Assignment removed successfully');

      res.json({
        success: true,
        message: 'Assignment removed successfully'
      });
    } catch (error) {
      console.error('❌ Remove assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove assignment',
        error: error.message
      });
    }
  }

  // Get doctors assigned to family
  static async getAssignedDoctors(req, res) {
    try {
      const familyMemberId = req.user.id;
      const { elderId } = req.query;

      console.log('🔍 Getting assigned doctors for family:', familyMemberId);

      const whereClause = {
        familyMemberId,
        isActive: true,
        status: 'accepted'
      };

      if (elderId) {
        whereClause.elderId = elderId;
      }

      const assignments = await FamilyDoctorAssignment.findAll({
        where: whereClause,
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email', 'phone', 'profileImage']
            }]
          },
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo']
          }
        ],
        order: [['assignedDate', 'DESC']]
      });

      const doctors = assignments.map(assignment => ({
        assignmentId: assignment.id,
        assignmentType: assignment.assignmentType,
        assignedDate: assignment.assignedDate,
        priority: assignment.priority,
        doctor: assignment.doctor,
        elder: assignment.elder
      }));

      console.log('✅ Found', doctors.length, 'assigned doctors');

      res.json({
        success: true,
        data: {
          doctors,
          total: doctors.length
        }
      });
    } catch (error) {
      console.error('❌ Get assigned doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get assigned doctors',
        error: error.message
      });
    }
  }
}

module.exports = FamilyDoctorAssignmentController;