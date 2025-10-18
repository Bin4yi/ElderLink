// backend/controllers/doctorPatientController.js
const { User, Elder, Appointment, DoctorAssignment, HealthMonitoring, Subscription } = require('../models');
const { Op } = require('sequelize');

class DoctorPatientController {
  // Get all patients for the logged-in doctor
  static async getDoctorPatients(req, res) {
    try {
      const doctorId = req.user.id;
      const { search, status, riskLevel, page = 1, limit = 100 } = req.query;

      console.log('🔍 Getting patients for doctor:', doctorId);

      // Get patients from appointments (unique elders with appointments)
      const appointmentPatients = await Appointment.findAll({
        where: {
          doctorId,
          status: {
            [Op.in]: ['approved', 'completed']
          }
        },
        attributes: ['elderId'],
        include: [{
          model: Elder,
          as: 'elder',
          attributes: [
            'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 
            'phone', 'email', 'photo', 'bloodType', 'address',
            'chronicConditions', 'allergies', 'currentMedications',
            'emergencyContact', 'emergencyPhone'
          ],
          include: [{
            model: Subscription,
            as: 'subscription',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }]
          }]
        }],
        group: ['elderId', 'elder.id', 'elder->subscription.id', 'elder->subscription->user.id']
      });

      // Get patients from doctor assignments
      const assignedPatients = await DoctorAssignment.findAll({
        where: {
          doctorId,
          status: 'active'
        },
        include: [{
          model: Elder,
          as: 'elder',
          attributes: [
            'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 
            'phone', 'email', 'photo', 'bloodType', 'address',
            'chronicConditions', 'allergies', 'currentMedications',
            'emergencyContact', 'emergencyPhone'
          ],
          include: [{
            model: Subscription,
            as: 'subscription',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }]
          }]
        }]
      });

      // Combine and deduplicate patients
      const patientMap = new Map();

      // Add appointment patients
      appointmentPatients.forEach(apt => {
        if (apt.elder) {
          patientMap.set(apt.elder.id, {
            elder: apt.elder,
            source: 'appointment'
          });
        }
      });

      // Add assigned patients
      assignedPatients.forEach(assignment => {
        if (assignment.elder) {
          const existing = patientMap.get(assignment.elder.id);
          patientMap.set(assignment.elder.id, {
            elder: assignment.elder,
            source: existing ? 'both' : 'assignment',
            assignmentType: assignment.assignmentType
          });
        }
      });

      // Get latest vitals for each patient
      const patientIds = Array.from(patientMap.keys());
      const vitalsData = await HealthMonitoring.findAll({
        where: {
          elderId: {
            [Op.in]: patientIds
          }
        },
        order: [['recordDate', 'DESC']],
        limit: patientIds.length,
        group: ['elderId']
      });

      const vitalsMap = new Map();
      vitalsData.forEach(vital => {
        if (!vitalsMap.has(vital.elderId)) {
          vitalsMap.set(vital.elderId, vital);
        }
      });

      // Get appointment counts for each patient
      const appointmentCounts = await Appointment.findAll({
        where: {
          doctorId,
          elderId: {
            [Op.in]: patientIds
          }
        },
        attributes: [
          'elderId',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'appointmentCount']
        ],
        group: ['elderId']
      });

      const appointmentCountMap = new Map();
      appointmentCounts.forEach(count => {
        appointmentCountMap.set(count.elderId, parseInt(count.get('appointmentCount')));
      });

      // Get last and next appointments
      const lastAppointments = await Appointment.findAll({
        where: {
          doctorId,
          elderId: {
            [Op.in]: patientIds
          },
          status: 'completed',
          appointmentDate: {
            [Op.lt]: new Date()
          }
        },
        order: [['appointmentDate', 'DESC']],
        limit: patientIds.length,
        group: ['elderId']
      });

      const lastAppointmentMap = new Map();
      lastAppointments.forEach(apt => {
        if (!lastAppointmentMap.has(apt.elderId)) {
          lastAppointmentMap.set(apt.elderId, apt.appointmentDate);
        }
      });

      const nextAppointments = await Appointment.findAll({
        where: {
          doctorId,
          elderId: {
            [Op.in]: patientIds
          },
          status: 'approved',
          appointmentDate: {
            [Op.gte]: new Date()
          }
        },
        order: [['appointmentDate', 'ASC']],
        limit: patientIds.length,
        group: ['elderId']
      });

      const nextAppointmentMap = new Map();
      nextAppointments.forEach(apt => {
        if (!nextAppointmentMap.has(apt.elderId)) {
          nextAppointmentMap.set(apt.elderId, apt.appointmentDate);
        }
      });

      // Format patients
      let patients = Array.from(patientMap.values()).map(({ elder, source, assignmentType }) => {
        const vitals = vitalsMap.get(elder.id);
        const age = elder.dateOfBirth ? new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear() : null;
        const appointmentCount = appointmentCountMap.get(elder.id) || 0;
        const lastVisit = lastAppointmentMap.get(elder.id);
        const nextAppointment = nextAppointmentMap.get(elder.id);

        // Determine risk level based on conditions and vitals
        let riskLevel = 'low';
        if (elder.chronicConditions || elder.allergies) {
          const conditions = (elder.chronicConditions || '').toLowerCase();
          if (conditions.includes('heart') || conditions.includes('diabetes') || conditions.includes('copd')) {
            riskLevel = 'high';
          } else {
            riskLevel = 'medium';
          }
        }

        // Get family member info
        const familyMember = elder.subscription?.user;

        return {
          id: elder.id,
          name: `${elder.firstName} ${elder.lastName}`,
          firstName: elder.firstName,
          lastName: elder.lastName,
          age,
          gender: elder.gender,
          phone: elder.phone,
          email: elder.email,
          address: elder.address,
          bloodType: elder.bloodType,
          photo: elder.photo,
          lastVisit: lastVisit ? lastVisit.toISOString().split('T')[0] : null,
          nextAppointment: nextAppointment ? nextAppointment.toISOString().split('T')[0] : null,
          appointmentCount,
          riskLevel,
          conditions: elder.chronicConditions ? elder.chronicConditions.split(',').map(c => c.trim()) : [],
          medications: elder.currentMedications ? elder.currentMedications.split(',').map(m => m.trim()) : [],
          allergies: elder.allergies || null,
          vitals: vitals ? {
            bloodPressure: `${vitals.systolic}/${vitals.diastolic}`,
            heartRate: vitals.heartRate,
            temperature: vitals.temperature,
            weight: vitals.weight
          } : null,
          status: nextAppointment ? 'active' : 'inactive',
          emergencyContact: elder.emergencyContact,
          emergencyPhone: elder.emergencyPhone,
          source,
          assignmentType: assignmentType || null,
          familyMember: familyMember ? {
            id: familyMember.id,
            name: `${familyMember.firstName} ${familyMember.lastName}`,
            email: familyMember.email,
            phone: familyMember.phone
          } : null
        };
      });

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        patients = patients.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          (p.email && p.email.toLowerCase().includes(searchLower)) ||
          (p.phone && p.phone.includes(search))
        );
      }

      if (status) {
        patients = patients.filter(p => p.status === status);
      }

      if (riskLevel) {
        patients = patients.filter(p => p.riskLevel === riskLevel);
      }

      // Pagination
      const total = patients.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedPatients = patients.slice(startIndex, endIndex);

      console.log('✅ Found patients:', {
        total,
        fromAppointments: appointmentPatients.length,
        fromAssignments: assignedPatients.length,
        unique: patients.length,
        page,
        limit
      });

      res.json({
        success: true,
        data: paginatedPatients,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        message: 'Patients retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting doctor patients:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve patients',
        error: error.message
      });
    }
  }

  // Get specific patient details
  static async getPatientDetails(req, res) {
    try {
      const doctorId = req.user.id;
      const { elderId } = req.params;

      console.log('🔍 Getting patient details:', { doctorId, elderId });

      // Check if doctor has access to this patient
      const hasAppointment = await Appointment.findOne({
        where: {
          doctorId,
          elderId,
          status: {
            [Op.in]: ['approved', 'completed']
          }
        }
      });

      const hasAssignment = await DoctorAssignment.findOne({
        where: {
          doctorId,
          elderId,
          status: 'active'
        }
      });

      if (!hasAppointment && !hasAssignment) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this patient'
        });
      }

      // Get elder details
      const elder = await Elder.findByPk(elderId, {
        include: [{
          model: Subscription,
          as: 'subscription',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }]
        }]
      });

      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: elder,
        message: 'Patient details retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting patient details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve patient details',
        error: error.message
      });
    }
  }
}

module.exports = DoctorPatientController;
