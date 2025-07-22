// backend/controllers/DoctorAppointmentController.js (Doctor Side)
const { 
  Appointment, 
  Elder, 
  Doctor, 
  User, 
  ConsultationRecord,
  Prescription,
  AppointmentNotification,
  ElderMedicalHistory,
  DoctorSchedule
} = require('../models');
const { Op } = require('sequelize');

class DoctorAppointmentController {
  
  // Get doctor's appointments
  static async getDoctorAppointments(req, res) {
    try {
      const { status, date, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      console.log('🔍 Getting doctor appointments:', { 
        userId: req.user.id, 
        status, 
        date, 
        page, 
        limit 
      });

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        console.log('❌ Doctor profile not found for user:', req.user.id);
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found' 
        });
      }

      console.log('✅ Found doctor:', doctor.id);

      const whereClause = { doctorId: doctor.id };
      
      if (status && status !== 'all') {
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

      console.log('🔍 Query whereClause:', whereClause);

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

      console.log('✅ Found appointments:', appointments.count);

      res.json({
        success: true,
        message: 'Doctor appointments retrieved successfully',
        appointments: appointments.rows,
        pagination: {
          total: appointments.count,
          page: parseInt(page),
          pages: Math.ceil(appointments.count / limit)
        }
      });
    } catch (error) {
      console.error('❌ Get doctor appointments error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Approve or reject appointment
  static async reviewAppointment(req, res) {
    try {
      const { id } = req.params;
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
          id: id,
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
        updateData.rejectionReason = rejectionReason || 'Rejected by doctor';
      }

      // If approving, you could generate Zoom meeting here
      if (action === 'approve') {
        console.log('✅ Appointment approved');
        // updateData.zoomMeetingId = 'mock_zoom_id';
        // updateData.zoomJoinUrl = 'https://zoom.us/j/mock_meeting';
      }

      await appointment.update(updateData);

      console.log('✅ Appointment updated successfully');

      // TODO: Send notification to family member
      try {
        await AppointmentNotification.create({
          appointmentId: appointment.id,
          recipientId: appointment.familyMemberId,
          type: action,
          title: `Appointment ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: `Your appointment for ${appointment.elder?.firstName} ${appointment.elder?.lastName} has been ${action}d.`,
          isRead: false
        });
        console.log('📧 Notification created for family member');
      } catch (notifyError) {
        console.log('⚠️ Failed to create notification:', notifyError.message);
      }

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
  
  // Reschedule appointment
  static async rescheduleAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { newDateTime, reason } = req.body;

      console.log('🔄 Rescheduling appointment:', { appointmentId, newDateTime, reason });

      if (!newDateTime) {
        return res.status(400).json({ 
          success: false,
          message: 'New date and time are required' 
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
          doctorId: doctor.id
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
          message: 'Appointment not found or access denied' 
        });
      }

      // Convert newDateTime string to Date object
      const newDateObj = new Date(newDateTime);
      const oldDate = appointment.appointmentDate;

      // Update appointment date and add reschedule info
      await appointment.update({
        appointmentDate: newDateObj,
        status: 'approved', // Keep as approved after reschedule
        doctorNotes: appointment.doctorNotes ? 
          `${appointment.doctorNotes}\n\nRescheduled from ${oldDate.toLocaleString()} to ${newDateObj.toLocaleString()}. Reason: ${reason || 'No reason provided'}` :
          `Rescheduled from ${oldDate.toLocaleString()} to ${newDateObj.toLocaleString()}. Reason: ${reason || 'No reason provided'}`
      });

      // Create notification for family member
      try {
        await AppointmentNotification.create({
          appointmentId: appointment.id,
          recipientId: appointment.familyMemberId,
          type: 'reschedule',
          title: 'Appointment Rescheduled',
          message: `Your appointment for ${appointment.elder?.firstName} ${appointment.elder?.lastName} has been rescheduled to ${newDateObj.toLocaleString()}`,
          isRead: false
        });
        console.log('📧 Reschedule notification created');
      } catch (notifyError) {
        console.log('⚠️ Failed to create reschedule notification:', notifyError.message);
      }

      console.log('✅ Appointment rescheduled successfully');

      res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
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
      console.error('❌ Reschedule appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
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
          success: false,
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
          success: false,
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
        success: true,
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
      console.error('❌ Get elder medical summary error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
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
          success: false,
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
        success: true,
        message: 'Dashboard stats retrieved successfully',
        stats: {
          todayAppointments,
          pendingAppointments,
          totalPatients,
          monthlyConsultations
        }
      });
    } catch (error) {
      console.error('❌ Get doctor dashboard stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = DoctorAppointmentController;
