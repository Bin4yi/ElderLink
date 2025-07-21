// backend/controllers/ConsultationController.js
const { 
  Appointment, 
  Elder, 
  Doctor, 
  User, 
  ConsultationRecord,
  Prescription,
  ElderMedicalHistory
} = require('../models');
const { Op } = require('sequelize');
const ZoomService = require('../services/zoomService');
const NotificationService = require('../services/notificationService');
const cron = require('node-cron');

class ConsultationController {

  // Auto-generate Zoom links 1 hour before consultation
  static initializeZoomLinkGeneration() {
    // Run every minute to check for appointments
    cron.schedule('* * * * *', async () => {
      try {
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

        // Find appointments that need Zoom links generated
        const appointmentsNeedingZoom = await Appointment.findAll({
          where: {
            status: 'approved',
            appointmentDate: {
              [Op.between]: [fiveMinutesFromNow, oneHourFromNow]
            },
            zoomMeetingId: null // Not yet generated
          },
          include: [
            {
              model: Elder,
              as: 'elder'
            },
            {
              model: User,
              as: 'familyMember'
            },
            {
              model: Doctor,
              as: 'doctor',
              include: [
                {
                  model: User,
                  as: 'user'
                }
              ]
            }
          ]
        });

        // Generate Zoom links for eligible appointments
        for (const appointment of appointmentsNeedingZoom) {
          await this.generateZoomLink(appointment);
        }
      } catch (error) {
        console.error('Zoom link generation cron error:', error);
      }
    });
  }

  // Generate Zoom link for appointment
  static async generateZoomLink(appointment) {
    try {
      const zoomData = await ZoomService.createMeeting({
        elder: appointment.elder,
        appointmentDate: appointment.appointmentDate,
        duration: appointment.duration
      });

      await appointment.update({
        zoomMeetingId: zoomData.meetingId,
        zoomJoinUrl: zoomData.joinUrl,
        zoomPassword: zoomData.password,
        zoomStartUrl: zoomData.startUrl
      });

      // Send notifications to both doctor and family
      await NotificationService.sendZoomLinkNotification(appointment);

      console.log(`✅ Zoom link generated for appointment ${appointment.id}`);
      return zoomData;
    } catch (error) {
      console.error('Error generating Zoom link:', error);
      throw error;
    }
  }

  // Get consultation appointments for family members
  static async getFamilyConsultations(req, res) {
    try {
      const { status = 'approved' } = req.query;

      const appointments = await Appointment.findAll({
        where: {
          familyMemberId: req.user.id,
          status: status
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth']
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName']
              }
            ]
          }
        ],
        order: [['appointmentDate', 'ASC']]
      });

      // Add time calculations for each appointment
      const enhancedAppointments = appointments.map(appointment => {
        const appointmentTime = new Date(appointment.appointmentDate);
        const now = new Date();
        const timeUntilConsultation = appointmentTime.getTime() - now.getTime();
        const oneHourInMs = 60 * 60 * 1000;

        return {
          ...appointment.toJSON(),
          timeUntilConsultation,
          canJoinMeeting: timeUntilConsultation <= oneHourInMs && timeUntilConsultation > 0,
          isConsultationTime: timeUntilConsultation <= 0 && timeUntilConsultation > -appointment.duration * 60 * 1000,
          hasZoomLink: !!appointment.zoomJoinUrl
        };
      });

      res.json({
        success: true,
        message: 'Consultations retrieved successfully',
        consultations: enhancedAppointments
      });
    } catch (error) {
      console.error('Get family consultations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // ✅ FIXED: Get consultation appointments for doctors from APPOINTMENTS table
  static async getDoctorConsultations(req, res) {
    try {
      const { status, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      console.log('🔄 Loading doctor consultations with params:', { status, page, limit });

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      // ✅ Build where clause to fetch from Appointments table with status = 'approved'
      const whereClause = {
        doctorId: doctor.id,
        status: {
          [Op.in]: ['approved', 'in-progress', 'completed'] // Include approved appointments for consultations
        }
      };

      // If specific status is requested, filter by it
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      console.log('🔍 Query whereClause:', whereClause);

      // ✅ Fetch appointments with status = 'approved' (these are consultations)
      const appointments = await Appointment.findAll({
        where: whereClause,
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: [
              'id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 
              'chronicConditions', 'allergies', 'currentMedications'
            ]
          },
          {
            model: User,
            as: 'familyMember',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: ConsultationRecord,
            as: 'consultationRecord',
            required: false, // Left join to get consultation records if they exist
            include: [
              {
                model: Prescription,
                as: 'prescriptions',
                required: false
              }
            ]
          }
        ],
        order: [['appointmentDate', 'ASC']],
        limit: parseInt(limit),
        offset: offset
      });

      console.log('✅ Found appointments for consultations:', appointments.length);

      // Add time calculations for each appointment
      const enhancedAppointments = appointments.map(appointment => {
        const appointmentTime = new Date(appointment.appointmentDate);
        const now = new Date();
        const timeUntilConsultation = appointmentTime.getTime() - now.getTime();
        const oneHourInMs = 60 * 60 * 1000;

        // Get consultation record data if exists
        const consultationRecord = appointment.consultationRecord;

        return {
          ...appointment.toJSON(),
          // Time calculations
          timeUntilConsultation,
          canStartMeeting: timeUntilConsultation <= oneHourInMs && appointment.status === 'approved',
          isConsultationTime: timeUntilConsultation <= 0 && timeUntilConsultation > -appointment.duration * 60 * 1000,
          hasZoomLink: !!appointment.zoomJoinUrl,
          // Add consultation data if completed
          diagnosis: consultationRecord?.diagnosis || null,
          treatment: consultationRecord?.treatment || null,
          prescription: consultationRecord?.prescriptions?.[0] || null,
          followUpRequired: consultationRecord?.followUpRequired || false,
          followUpDate: consultationRecord?.followUpDate || null,
          // Elder age calculation
          elderAge: appointment.elder?.dateOfBirth ? 
            Math.floor((new Date() - new Date(appointment.elder.dateOfBirth)) / 365.25 / 24 / 60 / 60 / 1000) : null
        };
      });

      res.json({
        success: true,
        message: 'Doctor consultations retrieved successfully',
        consultations: enhancedAppointments
      });
    } catch (error) {
      console.error('❌ Get doctor consultations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Start consultation (for doctors)
  static async startConsultation(req, res) {
    try {
      const { appointmentId } = req.params;

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          doctorId: doctor.id,
          status: 'approved'
        },
        include: [
          {
            model: Elder,
            as: 'elder'
          },
          {
            model: User,
            as: 'familyMember'
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found or cannot be started'
        });
      }

      // Check if meeting can be started (within 1 hour of appointment time)
      const appointmentTime = new Date(appointment.appointmentDate);
      const now = new Date();
      const timeUntilConsultation = appointmentTime.getTime() - now.getTime();
      const oneHourInMs = 60 * 60 * 1000;

      if (timeUntilConsultation > oneHourInMs) {
        return res.status(400).json({
          success: false,
          message: 'Meeting cannot be started yet. Available 1 hour before consultation.'
        });
      }

      // Update appointment status to in-progress
      await appointment.update({
        status: 'in-progress'
      });

      console.log('✅ Consultation started for appointment:', appointmentId);

      res.json({
        success: true,
        message: 'Consultation started successfully',
        appointment: appointment,
        zoomStartUrl: appointment.zoomStartUrl
      });
    } catch (error) {
      console.error('Start consultation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Complete consultation and redirect to forms
  static async completeConsultation(req, res) {
    try {
      const { appointmentId } = req.params;
      const {
        diagnosis,
        treatment,
        recommendations,
        vitalSigns,
        symptoms,
        sessionSummary,
        followUpRequired,
        followUpDate,
        actualDuration
      } = req.body;

      if (!sessionSummary) {
        return res.status(400).json({
          success: false,
          message: 'Session summary is required'
        });
      }

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          doctorId: doctor.id,
          status: 'in-progress'
        },
        include: [
          {
            model: Elder,
            as: 'elder'
          },
          {
            model: User,
            as: 'familyMember'
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Active appointment not found'
        });
      }

      // Create consultation record
      const consultationRecord = await ConsultationRecord.create({
        appointmentId: appointment.id,
        doctorId: doctor.id,
        elderId: appointment.elderId,
        sessionDate: new Date(),
        duration: actualDuration || appointment.duration,
        diagnosis,
        treatment,
        recommendations,
        vitalSigns,
        symptoms,
        sessionSummary,
        followUpRequired,
        followUpDate,
        status: 'completed'
      });

      // Update appointment status
      await appointment.update({
        status: 'completed'
      });

      // Create medical history record
      await ElderMedicalHistory.create({
        elderId: appointment.elderId,
        recordType: 'consultation',
        date: new Date(),
        description: `Consultation: ${diagnosis || 'General consultation'}`,
        doctorName: `Dr. ${req.user.firstName} ${req.user.lastName}`,
        createdBy: req.user.id
      });

      console.log('✅ Consultation completed successfully');

      res.json({
        success: true,
        message: 'Consultation completed successfully',
        consultationRecord,
        appointment
      });
    } catch (error) {
      console.error('Complete consultation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create prescription after consultation
  static async createPrescription(req, res) {
    try {
      const { consultationId } = req.params;
      const {
        medications,
        instructions,
        validUntil
      } = req.body;

      if (!medications || !Array.isArray(medications) || medications.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Medications array is required'
        });
      }

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      // Verify consultation belongs to doctor
      const consultation = await ConsultationRecord.findOne({
        where: {
          id: consultationId,
          doctorId: doctor.id
        },
        include: [
          {
            model: Elder,
            as: 'elder'
          },
          {
            model: Appointment,
            as: 'appointment',
            include: [
              {
                model: User,
                as: 'familyMember'
              }
            ]
          }
        ]
      });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: 'Consultation not found or access denied'
        });
      }

      // Create prescription
      const prescription = await Prescription.create({
        consultationId: consultation.id,
        doctorId: doctor.id,
        elderId: consultation.elderId,
        medications,
        instructions,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: 'active'
      });

      // Update consultation record
      await consultation.update({
        prescriptionAttached: true
      });

      // Create medical history record
      await ElderMedicalHistory.create({
        elderId: consultation.elderId,
        recordType: 'prescription',
        date: new Date(),
        description: `Prescription: ${medications.map(med => med.name).join(', ')}`,
        doctorName: `Dr. ${req.user.firstName} ${req.user.lastName}`,
        createdBy: req.user.id
      });

      console.log('✅ Prescription created successfully');

      res.status(201).json({
        success: true,
        message: 'Prescription created successfully',
        prescription
      });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get elder medical details
  static async getElderDetails(req, res) {
    try {
      const { elderId } = req.params;

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      const elder = await Elder.findByPk(elderId, {
        include: [
          {
            model: ElderMedicalHistory,
            as: 'medicalHistoryRecords', // Updated alias to match models/index.js
            order: [['date', 'DESC']],
            limit: 10
          },
          {
            model: ConsultationRecord,
            as: 'consultationRecords',
            where: { doctorId: doctor.id },
            required: false,
            order: [['sessionDate', 'DESC']],
            limit: 5,
            include: [
              {
                model: Prescription,
                as: 'prescriptions'
              }
            ]
          }
        ]
      });

      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder not found'
        });
      }

      res.json({
        success: true,
        message: 'Elder details retrieved successfully',
        elder
      });
    } catch (error) {
      console.error('Get elder details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get appointment details with countdown
  static async getAppointmentDetails(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 'chronicConditions', 'allergies']
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName']
              }
            ]
          },
          {
            model: User,
            as: 'familyMember',
            attributes: ['firstName', 'lastName', 'email', 'phone']
          },
          {
            model: ConsultationRecord,
            as: 'consultationRecord',
            required: false
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Calculate time until consultation
      const appointmentTime = new Date(appointment.appointmentDate);
      const now = new Date();
      const timeUntilConsultation = appointmentTime.getTime() - now.getTime();
      const oneHourInMs = 60 * 60 * 1000;

      const enhancedAppointment = {
        ...appointment.toJSON(),
        timeUntilConsultation,
        canJoinMeeting: timeUntilConsultation <= oneHourInMs && timeUntilConsultation > 0,
        canStartMeeting: timeUntilConsultation <= oneHourInMs,
        isConsultationTime: timeUntilConsultation <= 0 && timeUntilConsultation > -appointment.duration * 60 * 1000,
        hasZoomLink: !!appointment.zoomJoinUrl
      };

      res.json({
        success: true,
        message: 'Appointment details retrieved successfully',
        appointment: enhancedAppointment
      });
    } catch (error) {
      console.error('Get appointment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // Join consultation (for family members)
  static async joinConsultation(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          familyMemberId: req.user.id,
          status: {
            [Op.in]: ['approved', 'in-progress']
          }
        },
        include: [
          {
            model: Elder,
            as: 'elder'
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user'
              }
            ]
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found or cannot be joined'
        });
      }

      // Check if meeting can be joined (within 1 hour of appointment time)
      const appointmentTime = new Date(appointment.appointmentDate);
      const now = new Date();
      const timeUntilConsultation = appointmentTime.getTime() - now.getTime();
      const oneHourInMs = 60 * 60 * 1000;

      if (timeUntilConsultation > oneHourInMs) {
        return res.status(400).json({
          success: false,
          message: 'Meeting cannot be joined yet. Available 1 hour before consultation.'
        });
      }

      if (!appointment.zoomJoinUrl) {
        return res.status(400).json({
          success: false,
          message: 'Meeting link not yet available'
        });
      }

      res.json({
        success: true,
        message: 'Ready to join consultation',
        appointment: appointment,
        zoomJoinUrl: appointment.zoomJoinUrl
      });
    } catch (error) {
      console.error('Join consultation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get consultation history for elder
  static async getConsultationHistory(req, res) {
    try {
      const { elderId } = req.params;

      // Check if user has access to this elder's data
      let hasAccess = false;
      
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({
          where: { userId: req.user.id }
        });
        
        if (doctor) {
          // Check if doctor has consulted this elder
          const consultationExists = await ConsultationRecord.findOne({
            where: {
              elderId,
              doctorId: doctor.id
            }
          });
          hasAccess = !!consultationExists;
        }
      } else if (req.user.role === 'family') {
        // Check if this elder belongs to family member
        const elderExists = await Elder.findOne({
          where: {
            id: elderId,
            // Add family member relationship check here
          }
        });
        hasAccess = !!elderExists;
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to elder records'
        });
      }

      const consultationHistory = await ConsultationRecord.findAll({
        where: { elderId },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName']
              }
            ]
          },
          {
            model: Prescription,
            as: 'prescriptions'
          },
          {
            model: Appointment,
            as: 'appointment'
          }
        ],
        order: [['sessionDate', 'DESC']],
        limit: 20
      });

      res.json({
        success: true,
        message: 'Consultation history retrieved successfully',
        consultationHistory
      });
    } catch (error) {
      console.error('Get consultation history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update consultation status
  static async updateConsultationStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      if (!['approved', 'in-progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      let appointment;
      
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({
          where: { userId: req.user.id }
        });

        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: 'Doctor profile not found'
          });
        }

        appointment = await Appointment.findOne({
          where: {
            id: appointmentId,
            doctorId: doctor.id
          }
        });
      } else if (req.user.role === 'family') {
        appointment = await Appointment.findOne({
          where: {
            id: appointmentId,
            familyMemberId: req.user.id
          }
        });
      }

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found or access denied'
        });
      }

      await appointment.update({ status });

      res.json({
        success: true,
        message: 'Consultation status updated successfully',
        appointment
      });
    } catch (error) {
      console.error('Update consultation status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// Initialize Zoom link generation when server starts
ConsultationController.initializeZoomLinkGeneration();

module.exports = ConsultationController;