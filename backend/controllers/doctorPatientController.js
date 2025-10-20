// backend/controllers/doctorPatientController.js
const { User, Elder, Appointment, DoctorAssignment, HealthMonitoring, Subscription, Doctor } = require('../models');
const { Op } = require('sequelize');

class DoctorPatientController {
  // Get all patients for the logged-in doctor
  static async getDoctorPatients(req, res) {
    try {
      // Step 2: Get Doctor Information
      const userId = req.user.id;
      const { search, status, riskLevel, source, page = 1, limit = 100 } = req.query;

      console.log('🔍 Getting patients for doctor user:', userId);
      console.log('🔍 Source filter:', source);

      // Find doctor profile from Doctor table using user ID
      const doctor = await Doctor.findOne({
        where: { userId }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      const doctorId = doctor.id;
      console.log('✅ Found doctor profile:', doctorId);

      // Step 3: Fetch Patients from Appointments
      const appointmentPatients = await Appointment.findAll({
        where: {
          doctorId,
          status: {
            [Op.notIn]: ['cancelled', 'no-show']
          }
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            required: false, // Make elder optional
            attributes: [
              'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 
              'phone', 'photo', 'bloodType', 'address',
              'chronicConditions', 'allergies', 'currentMedications',
              'emergencyContact'
            ],
            include: [{
              model: Subscription,
              as: 'subscription',
              required: false, // Make subscription optional
              include: [{
                model: User,
                as: 'user',
                required: false, // Make user optional
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
              }]
            }]
          },
          {
            model: User,
            as: 'familyMember',
            required: false, // Make familyMember optional
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      // Step 4: Fetch Patients from Doctor Assignments
      const assignedPatients = await DoctorAssignment.findAll({
        where: {
          doctorId: userId, // DoctorAssignment uses userId, not doctor.id
          status: 'active'
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            required: false, // Make elder optional
            attributes: [
              'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 
              'phone', 'photo', 'bloodType', 'address',
              'chronicConditions', 'allergies', 'currentMedications',
              'emergencyContact'
            ],
            include: [{
              model: Subscription,
              as: 'subscription',
              required: false, // Make subscription optional
              include: [{
                model: User,
                as: 'user',
                required: false, // Make user optional
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
              }]
            }]
          },
          {
            model: User,
            as: 'familyMember',
            required: false, // Make familyMember optional
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      console.log('📊 Raw data:', {
        appointmentPatients: appointmentPatients.length,
        assignedPatients: assignedPatients.length
      });

      // Filter out any entries without elder data
      const validAppointments = appointmentPatients.filter(apt => apt.elder);
      const validAssignments = assignedPatients.filter(assignment => assignment.elder);

      console.log('✅ Valid data:', {
        validAppointments: validAppointments.length,
        validAssignments: validAssignments.length
      });

      // Step 5 & 6: Format Data and Remove Duplicates
      const patientMap = new Map();

      // Add appointment patients
      validAppointments.forEach(apt => {
        if (apt.elder) {
          patientMap.set(apt.elder.id, {
            elder: apt.elder,
            source: 'appointment',
            appointmentDate: apt.appointmentDate,
            appointmentStatus: apt.status,
            familyMember: apt.familyMember || apt.elder.subscription?.user,
            assignmentType: null,
            assignmentDate: null
          });
        }
      });

      // Add assigned patients
      validAssignments.forEach(assignment => {
        if (assignment.elder) {
          const existing = patientMap.get(assignment.elder.id);
          if (existing) {
            // Patient exists in appointments, mark as both
            existing.source = 'both';
            existing.assignmentType = assignment.assignmentType;
            existing.assignmentDate = assignment.assignmentDate;
          } else {
            // New patient from assignment only
            patientMap.set(assignment.elder.id, {
              elder: assignment.elder,
              source: 'assignment',
              assignmentType: assignment.assignmentType,
              assignmentDate: assignment.assignmentDate,
              appointmentDate: null,
              appointmentStatus: null,
              familyMember: assignment.familyMember || assignment.elder.subscription?.user
            });
          }
        }
      });

      // Get latest vitals for each patient
      const patientIds = Array.from(patientMap.keys());
      
      // If no patients found, return early
      if (patientIds.length === 0) {
        console.log('⚠️ No patients found for doctor');
        return res.json({
          success: true,
          data: [],
          statistics: {
            total: 0,
            fromAppointments: 0,
            fromAssignments: 0,
            active: 0,
            unique: 0
          },
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: 0
          },
          message: 'No patients found'
        });
      }
      
      // Fetch vitals without group/limit to avoid SQL errors
      const allVitals = await HealthMonitoring.findAll({
        where: {
          elderId: {
            [Op.in]: patientIds
          }
        },
        order: [['monitoringDate', 'DESC']]
      });
      
      // Group vitals manually to get latest for each patient
      const vitalsMap = new Map();
      allVitals.forEach(vital => {
        if (!vitalsMap.has(vital.elderId)) {
          vitalsMap.set(vital.elderId, vital);
        }
      });

      // Get appointment counts for each patient - simplified
      const allAppointmentsForCount = await Appointment.findAll({
        where: {
          doctorId,
          elderId: {
            [Op.in]: patientIds
          }
        },
        attributes: ['elderId', 'id']
      });

      const appointmentCountMap = new Map();
      allAppointmentsForCount.forEach(apt => {
        const count = appointmentCountMap.get(apt.elderId) || 0;
        appointmentCountMap.set(apt.elderId, count + 1);
      });

      // Get last appointments (completed)
      const allLastAppointments = await Appointment.findAll({
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
        order: [['appointmentDate', 'DESC']]
      });

      const lastAppointmentMap = new Map();
      allLastAppointments.forEach(apt => {
        if (!lastAppointmentMap.has(apt.elderId)) {
          lastAppointmentMap.set(apt.elderId, apt.appointmentDate);
        }
      });

      // Get next appointments (upcoming)
      const allNextAppointments = await Appointment.findAll({
        where: {
          doctorId,
          elderId: {
            [Op.in]: patientIds
          },
          status: {
            [Op.in]: ['upcoming', 'approved', 'today']
          },
          appointmentDate: {
            [Op.gte]: new Date()
          }
        },
        order: [['appointmentDate', 'ASC']]
      });

      const nextAppointmentMap = new Map();
      allNextAppointments.forEach(apt => {
        if (!nextAppointmentMap.has(apt.elderId)) {
          nextAppointmentMap.set(apt.elderId, apt.appointmentDate);
        }
      });

      // Format patients with all details
      let patients = Array.from(patientMap.values()).map(({ elder, source, assignmentType, appointmentDate, appointmentStatus, assignmentDate, familyMember }) => {
        // Safety check
        if (!elder || !elder.id) {
          console.warn('⚠️ Skipping patient with missing elder data');
          return null;
        }

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

        return {
          id: elder.id,
          name: `${elder.firstName || ''} ${elder.lastName || ''}`.trim(),
          firstName: elder.firstName || '',
          lastName: elder.lastName || '',
          age,
          gender: elder.gender || null,
          phone: elder.phone || null,
          email: null, // Elder doesn't have email field
          address: elder.address || null,
          bloodType: elder.bloodType || null,
          photo: elder.photo || null,
          lastVisit: lastVisit ? lastVisit.toISOString().split('T')[0] : null,
          nextAppointment: nextAppointment ? nextAppointment.toISOString().split('T')[0] : null,
          appointmentCount,
          riskLevel,
          conditions: elder.chronicConditions ? elder.chronicConditions.split(',').map(c => c.trim()) : [],
          medications: elder.currentMedications ? elder.currentMedications.split(',').map(m => m.trim()) : [],
          allergies: elder.allergies || null,
          vitals: vitals ? {
            bloodPressure: `${vitals.systolic || 0}/${vitals.diastolic || 0}`,
            heartRate: vitals.heartRate || 0,
            temperature: vitals.temperature || 0,
            weight: vitals.weight || 0
          } : null,
          status: nextAppointment ? 'active' : 'inactive',
          emergencyContact: elder.emergencyContact || null,
          emergencyPhone: null, // Elder doesn't have emergencyPhone field
          source,
          assignmentType: assignmentType || null,
          appointmentDate: appointmentDate || null,
          appointmentStatus: appointmentStatus || null,
          assignmentDate: assignmentDate || null,
          familyMember: familyMember ? {
            id: familyMember.id,
            name: `${familyMember.firstName || ''} ${familyMember.lastName || ''}`.trim(),
            email: familyMember.email || null,
            phone: familyMember.phone || null
          } : null
        };
      }).filter(p => p !== null); // Remove any null entries

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

      // Filter by source (appointment, assignment, or both)
      console.log('📊 Before source filter:', patients.length);
      console.log('📊 Patient sources:', patients.map(p => ({ name: p.name, source: p.source })));
      
      if (source) {
        const beforeFilter = patients.length;
        patients = patients.filter(p => {
          if (source === 'appointment') {
            return p.source === 'appointment' || p.source === 'both';
          } else if (source === 'assignment') {
            return p.source === 'assignment' || p.source === 'both';
          }
          return true;
        });
        console.log(`✅ Filtered by source '${source}': ${beforeFilter} -> ${patients.length} patients`);
      }

      // Step 7: Calculate Statistics
      const totalPatients = patients.length;
      const patientsFromAppointments = appointmentPatients.filter(apt => apt.elder).length;
      const patientsFromAssignments = assignedPatients.filter(assignment => assignment.elder).length;
      const activePatients = patients.filter(p => p.status === 'active').length;
      const uniquePatients = patientMap.size;

      // Pagination
      const total = patients.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedPatients = patients.slice(startIndex, endIndex);

      console.log('✅ Found patients:', {
        total: totalPatients,
        fromAppointments: patientsFromAppointments,
        fromAssignments: patientsFromAssignments,
        unique: uniquePatients,
        active: activePatients,
        page,
        limit
      });

      // Step 8: Send Response
      res.json({
        success: true,
        data: paginatedPatients,
        statistics: {
          total: totalPatients,
          fromAppointments: patientsFromAppointments,
          fromAssignments: patientsFromAssignments,
          active: activePatients,
          unique: uniquePatients
        },
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
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        sql: error.sql // If it's a SQL error
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve patients',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
