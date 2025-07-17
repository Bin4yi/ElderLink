// backend/controllers/doctorAppointmentController.js (Doctor Side)
const { 
  Appointment, 
  Elder, 
  Doctor, 
  User, 
  ConsultationRecord,
  Prescription,
  AppointmentNotification,
  ElderMedicalHistory 
} = require('../models');
const { Op } = require('sequelize');
// const ZoomService = require('../services/zoomService');
// const NotificationService = require('../services/notificationService');

class DoctorAppointmentController {
  
  // Get doctor's appointments
  static async getDoctorAppointments(req, res) {
    try {
      const { status, date, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          message: 'Doctor profile not found' 
        });
      }

      const whereClause = { doctorId: doctor.id };
      
      if (status) {
        whereClause.status = status;
      }

      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        whereClause.appointmentDate = {
          [Op.between]: [startDate, endDate]
        };
      }

      const appointments = await Appointment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: [
              'id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 
              'gender', 'bloodType', 'allergies', 'chronicConditions',
              'currentMedications', 'phone', 'emergencyContact'
            ]
          },
          {
            model: User,
            as: 'familyMember',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ],
        order: [['appointmentDate', 'ASC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        message: 'Doctor appointments retrieved successfully',
        appointments: appointments.rows,
        pagination: {
          total: appointments.count,
          page: parseInt(page),
          pages: Math.ceil(appointments.count / limit)
        }
      });
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Approve or reject appointment
  static async reviewAppointment(req, res) {
    try {
      const { id } = req.params; // ✅ CHANGED: from appointmentId to id
      const { action, doctorNotes, rejectionReason } = req.body;

      console.log('🔄 Reviewing appointment:', { id, action, doctorNotes });

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ 
          success: false,
          message: 'Action must be either "approve" or "reject"' 
        });
      }

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found' 
        });
      }

      console.log('🔍 Looking for appointment:', { appointmentId: id, doctorId: doctor.id });

      const appointment = await Appointment.findOne({
        where: { 
          id: id, // ✅ USING: id instead of appointmentId
          doctorId: doctor.id,
          status: 'pending'
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
        console.log('❌ Appointment not found or cannot be reviewed');
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found or cannot be reviewed' 
        });
      }

      console.log('✅ Found appointment:', appointment.id);

      let updateData = {
        doctorNotes,
        status: action === 'approve' ? 'approved' : 'rejected'
      };

      if (action === 'reject') {
        updateData.rejectionReason = rejectionReason;
      }

      // If approving, you could generate Zoom meeting here
      if (action === 'approve') {
        console.log('✅ Appointment approved');
        // updateData.zoomMeetingId = 'mock_zoom_id';
        // updateData.zoomJoinUrl = 'https://zoom.us/j/mock_meeting';
      }

      await appointment.update(updateData);

      console.log('✅ Appointment updated successfully');

      // Mock notification creation
      console.log('📧 Notification would be sent to family member:', appointment.familyMember?.email);

      res.json({
        success: true,
        message: `Appointment ${action}d successfully`,
        appointment: await appointment.reload({
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
        })
      });
    } catch (error) {
      console.error('❌ Review appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  //Reschedule appointment
  static async rescheduleAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { newDateTime, reason } = req.body;

      if (!newDateTime) {
        return res.status(400).json({ message: 'New date and time are required' });
      }

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }

      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          doctorId: doctor.id
        }
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found or access denied' });
      }

       // ✅ Convert newDateTime string to Date object
      const newDateObj = new Date(newDateTime);

      // ✅ Update appointment date and status
      appointment.appointmentDate = newDateObj;
      appointment.status = 'rescheduled';

      await appointment.save();

      // ✅ Optionally save the reason if your model supports it
      if (reason) {
        appointment.reason = reason; // Make sure Appointment model has a 'reason' field
      }

      // Optionally send notification
      await AppointmentNotification.create({
        appointmentId: appointment.id,
        recipientId: appointment.familyMemberId,
        type: 'reschedule',
        title: 'Appointment Rescheduled',
        message: `The appointment for ${appointment.elderName || 'the elder'} has been rescheduled to ${newDateObj.toLocaleString()}`
      });

      res.json({
        message: 'Appointment rescheduled successfully',
        appointment
      });
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


  // Get elder's complete medical summary for doctor
  static async getElderMedicalSummary(req, res) {
    try {
      const { elderId } = req.params;

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          message: 'Doctor profile not found' 
        });
      }

      const elder = await Elder.findByPk(elderId, {
        include: [
          {
            model: ConsultationRecord,
            as: 'consultationRecords',
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
              }
            ],
            order: [['sessionDate', 'DESC']],
            limit: 10
          },
          {
            model: ElderMedicalHistory,
            as: 'medicalHistory',
            order: [['date', 'DESC']],
            limit: 20
          }
        ]
      });

      if (!elder) {
        return res.status(404).json({ 
          message: 'Elder not found' 
        });
      }

      // Get current medications and allergies
      const currentPrescriptions = await Prescription.findAll({
        where: { 
          elderId,
          status: 'active',
          validUntil: {
            [Op.or]: [
              { [Op.gte]: new Date() },
              { [Op.is]: null }
            ]
          }
        },
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
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate age
      const age = Math.floor((new Date() - new Date(elder.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));

      res.json({
        message: 'Elder medical summary retrieved successfully',
        elderSummary: {
          personalInfo: {
            id: elder.id,
            firstName: elder.firstName,
            lastName: elder.lastName,
            dateOfBirth: elder.dateOfBirth,
            age,
            gender: elder.gender,
            bloodType: elder.bloodType,
            photo: elder.photo,
            phone: elder.phone,
            emergencyContact: elder.emergencyContact,
            address: elder.address
          },
          medicalInfo: {
            allergies: elder.allergies,
            chronicConditions: elder.chronicConditions,
            medicalHistory: elder.medicalHistory,
            currentMedications: elder.currentMedications,
            doctorName: elder.doctorName,
            doctorPhone: elder.doctorPhone,
            insuranceProvider: elder.insuranceProvider,
            insuranceNumber: elder.insuranceNumber
          },
          recentConsultations: elder.consultationRecords,
          currentPrescriptions,
          medicalHistoryRecords: elder.medicalHistory
        }
      });
    } catch (error) {
      console.error('Get elder medical summary error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Complete appointment and create consultation record
  static async completeAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const {
        diagnosis,
        treatment,
        recommendations,
        vitalSigns,
        symptoms,
        sessionSummary,
        followUpRequired = false,
        followUpDate,
        actualDuration
      } = req.body;

      if (!sessionSummary) {
        return res.status(400).json({ 
          message: 'Session summary is required' 
        });
      }

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
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
          message: 'Appointment not found or cannot be completed' 
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
        message: `Consultation for ${appointment.elder.firstName} ${appointment.elder.lastName} has been completed. Session summary and recommendations are now available.`
      });

      res.json({
        message: 'Appointment completed successfully',
        consultationRecord,
        appointment
      });
    } catch (error) {
      console.error('Complete appointment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create prescription
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
          message: 'Medications array is required' 
        });
      }

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
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
        message: 'Prescription created successfully',
        prescription
      });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get doctor's consultation records
  static async getConsultationRecords(req, res) {
    try {
      const { page = 1, limit = 10, elderId } = req.query;
      const offset = (page - 1) * limit;

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          message: 'Doctor profile not found' 
        });
      }

      const whereClause = { doctorId: doctor.id };
      if (elderId) {
        whereClause.elderId = elderId;
      }

      const consultations = await ConsultationRecord.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth']
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'reason', 'type', 'priority']
          },
          {
            model: Prescription,
            as: 'prescriptions'
          }
        ],
        order: [['sessionDate', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        message: 'Consultation records retrieved successfully',
        consultations: consultations.rows,
        pagination: {
          total: consultations.count,
          page: parseInt(page),
          pages: Math.ceil(consultations.count / limit)
        }
      });
    } catch (error) {
      console.error('Get consultation records error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update doctor's schedule
  static async updateSchedule(req, res) {
    try {
      const { schedules } = req.body;

      if (!schedules || !Array.isArray(schedules)) {
        return res.status(400).json({ 
          message: 'Schedules array is required' 
        });
      }

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          message: 'Doctor profile not found' 
        });
      }

      // Delete existing schedules
      await DoctorSchedule.destroy({
        where: { doctorId: doctor.id }
      });

      // Create new schedules
      const newSchedules = schedules.map(schedule => ({
        ...schedule,
        doctorId: doctor.id
      }));

      await DoctorSchedule.bulkCreate(newSchedules);

      res.json({
        message: 'Schedule updated successfully'
      });
    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Add schedule exception (holiday, break, etc.)
  static async addScheduleException(req, res) {
    try {
      const {
        date,
        startTime,
        endTime,
        isUnavailable = true,
        reason
      } = req.body;

      if (!date) {
        return res.status(400).json({ 
          message: 'Date is required' 
        });
      }

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          message: 'Doctor profile not found' 
        });
      }

      const exception = await ScheduleException.create({
        doctorId: doctor.id,
        date: new Date(date),
        startTime,
        endTime,
        isUnavailable,
        reason
      });

      res.status(201).json({
        message: 'Schedule exception added successfully',
        exception
      });
    } catch (error) {
      console.error('Add schedule exception error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get doctor's dashboard stats
  static async getDoctorDashboardStats(req, res) {
    try {
      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          message: 'Doctor profile not found' 
        });
      }

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Today's appointments
      const todayAppointments = await Appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: {
            [Op.between]: [startOfDay, endOfDay]
          },
          status: {
            [Op.in]: ['approved', 'completed']
          }
        }
      });

      // Pending appointments
      const pendingAppointments = await Appointment.count({
        where: {
          doctorId: doctor.id,
          status: 'pending'
        }
      });

      // Total patients (unique elders)
      const totalPatients = await Appointment.count({
        where: {
          doctorId: doctor.id,
          status: 'completed'
        },
        distinct: true,
        col: 'elderId'
      });

      // Completed consultations this month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyConsultations = await ConsultationRecord.count({
        where: {
          doctorId: doctor.id,
          sessionDate: {
            [Op.gte]: startOfMonth
          },
          status: 'completed'
        }
      });

      res.json({
        message: 'Dashboard stats retrieved successfully',
        stats: {
          todayAppointments,
          pendingAppointments,
          totalPatients,
          monthlyConsultations
        }
      });
    } catch (error) {
      console.error('Get doctor dashboard stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = DoctorAppointmentController;