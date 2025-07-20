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

  // Get consultation appointments for doctors
  static async getDoctorConsultations(req, res) {
    try {
      const { status = 'approved' } = req.query;

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      const appointments = await Appointment.findAll({
        where: {
          doctorId: doctor.id,
          status: status
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 'chronicConditions', 'allergies']
          },
          {
            model: User,
            as: 'familyMember',
            attributes: ['firstName', 'lastName', 'email', 'phone']
          }
        ],
        order: [['appointmentDate', 'ASC']],
        status: 'approved',
        date: {
          [Op.gte]: today // today and future appointments
        }
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
          canStartMeeting: timeUntilConsultation <= oneHourInMs,
          isConsultationTime: timeUntilConsultation <= 0 && timeUntilConsultation > -appointment.duration * 60 * 1000,
          hasZoomLink: !!appointment.zoomJoinUrl
        };
      });

      res.json({
        success: true,
        message: 'Doctor consultations retrieved successfully',
        consultations: enhancedAppointments
      });
    } catch (error) {
      console.error('Get doctor consultations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
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
          message: 'Appointment not found'
        });
      }

      // Update appointment status to in-progress
      await appointment.update({
        status: 'in-progress'
      });

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

      // Send completion notification to family member
      await NotificationService.createAppointmentNotification({
        appointmentId: appointment.id,
        recipientId: appointment.familyMemberId,
        type: 'completion',
        title: 'Consultation Completed',
        message: `Consultation for ${appointment.elder.firstName} ${appointment.elder.lastName} has been completed.`
      });

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

      // Send notification to family member
      await NotificationService.createAppointmentNotification({
        appointmentId: consultation.appointment.id,
        recipientId: consultation.appointment.familyMemberId,
        type: 'prescription',
        title: 'Prescription Available',
        message: `New prescription for ${consultation.elder.firstName} ${consultation.elder.lastName} is now available`
      });

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
            as: 'medicalHistory',
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
}

// Initialize Zoom link generation when server starts
ConsultationController.initializeZoomLinkGeneration();

module.exports = ConsultationController;