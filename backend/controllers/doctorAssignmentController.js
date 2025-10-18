// backend/controllers/doctorAssignmentController.js
const { User, Elder, DoctorAssignment, Subscription } = require('../models');
const { Op } = require('sequelize');

class DoctorAssignmentController {
  // Get available doctors for assignment
  static async getAvailableDoctors(req, res) {
    try {
      const doctors = await User.findAll({
        where: {
          role: 'doctor',
          isActive: true
        },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'specialization',
          'experience'
        ],
        order: [['firstName', 'ASC']]
      });

      const formattedDoctors = doctors.map(doctor => ({
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization || 'General Medicine',
        experience: doctor.experience || 0,
        isAvailable: true
      }));

      res.json({
        success: true,
        data: formattedDoctors,
        message: 'Available doctors retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Get available doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available doctors',
        error: error.message
      });
    }
  }

  // Assign doctor to elder
  static async assignDoctor(req, res) {
    try {
      const { elderId, doctorId, assignmentType, notes } = req.body;
      const familyMemberId = req.user.id;

      // Find elder and check authorization
      const elder = await Elder.findOne({
        where: { id: elderId },
        include: [{
          model: Subscription,
          as: 'subscription',
          where: { userId: familyMemberId }
        }]
      });

      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder not found or not authorized'
        });
      }

      // Check for existing active primary assignment
      if (assignmentType === 'primary') {
        const existingPrimary = await DoctorAssignment.findOne({
          where: {
            elderId,
            assignmentType: 'primary',
            status: 'active'
          }
        });
        if (existingPrimary) {
          return res.status(400).json({
            success: false,
            message: 'Elder already has an active primary doctor assigned'
          });
        }
      }

      // Create new assignment in DoctorAssignment table
      const assignment = await DoctorAssignment.create({
        elderId,
        doctorId,
        familyMemberId,
        assignmentType,
        status: 'active',
        assignmentDate: new Date(),
        notes
      });

      res.status(201).json({
        success: true,
        data: assignment,
        message: 'Doctor assigned successfully'
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
      const familyMemberId = req.user.id;
      const { status = 'active' } = req.query;

      console.log('🔍 Getting assignments for family member:', familyMemberId, 'with status:', status);

      const assignments = await DoctorAssignment.findAll({
        where: {
          familyMemberId,
          ...(status !== 'all' ? { status } : {})
        },
        include: [
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'specialization', 'experience']
          },
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'photo']
          }
        ],
        order: [['assignmentDate', 'DESC']]
      });

      res.json({
        success: true,
        data: assignments,
        message: 'Doctor assignments retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Get family doctor assignments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctor assignments',
        error: error.message
      });
    }
  }

  // Get assignments for specific elder
  static async getElderDoctorAssignments(req, res) {
    try {
      const { elderId } = req.params;
      const familyMemberId = req.user.id;

      console.log('🔍 Getting assignments for elder:', elderId);

      // Get assignments from DoctorAssignment table with doctor details
      const assignments = await DoctorAssignment.findAll({
        where: { 
          elderId,
          familyMemberId,
          status: 'active'  // Only get active assignments
        },
        include: [
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'specialization', 'experience', 'photo']
          }
        ],
        order: [['assignmentDate', 'DESC']]
      });

      console.log('✅ Found assignments:', assignments.length);

      res.json({
        success: true,
        data: assignments,
        message: 'Elder doctor assignments retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Get elder doctor assignments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve elder doctor assignments',
        error: error.message
      });
    }
  }

  // Terminate doctor assignment
  static async terminateAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const { reason } = req.body;
      const familyMemberId = req.user.id;

      console.log('🔄 Terminating assignment:', assignmentId, 'for family member:', familyMemberId);

      // Find the elder with this assignment
      const elders = await Elder.findAll({
        where: { userId: familyMemberId }
      });

      let targetElder = null;
      let assignmentIndex = -1;

      for (const elder of elders) {
        const assignments = elder.doctorAssignmentData || [];  // ✅ Changed field name
        assignmentIndex = assignments.findIndex(a => a.id === assignmentId);
        
        if (assignmentIndex !== -1) {
          targetElder = elder;
          break;
        }
      }

      if (!targetElder || assignmentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found or not authorized'
        });
      }

      // Update assignment status
      const assignments = [...targetElder.doctorAssignmentData];  // ✅ Changed field name
      assignments[assignmentIndex] = {
        ...assignments[assignmentIndex],
        status: 'terminated',
        terminationDate: new Date(),
        terminationReason: reason,
        updatedAt: new Date()
      };

      // Update elder
      await targetElder.update({
        doctorAssignmentData: assignments  // ✅ Changed field name
      });

      console.log('✅ Assignment terminated');

      res.json({
        success: true,
        message: 'Doctor assignment terminated successfully'
      });
    } catch (error) {
      console.error('❌ Terminate assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate assignment',
        error: error.message
      });
    }
  }

  // Get assignment details
  static async getAssignmentDetails(req, res) {
    try {
      const { assignmentId } = req.params;
      const familyMemberId = req.user.id;

      console.log('🔍 Getting assignment details:', assignmentId);

      // Find the elder with this assignment
      const elders = await Elder.findAll({
        where: { userId: familyMemberId }
      });

      let assignment = null;
      let elder = null;

      for (const e of elders) {
        const assignments = e.doctorAssignmentData || [];  // ✅ Changed field name
        assignment = assignments.find(a => a.id === assignmentId);
        
        if (assignment) {
          elder = e;
          break;
        }
      }

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found or not authorized'
        });
      }

      res.json({
        success: true,
        data: {
          ...assignment,
          elder: {
            id: elder.id,
            firstName: elder.firstName,
            lastName: elder.lastName,
            dateOfBirth: elder.dateOfBirth,
            gender: elder.gender,
            photo: elder.photo
          }
        },
        message: 'Assignment details retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Get assignment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve assignment details',
        error: error.message
      });
    }
  }
}

module.exports = DoctorAssignmentController;