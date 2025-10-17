// backend/controllers/doctorAppointmentController.js
const { sequelize } = require('../models');
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
      console.log('🔄 Getting doctor appointments for user:', req.user.id);
      
      const { status, date, page = 1, limit = 100 } = req.query; // Increased default limit to 100
      const offset = (page - 1) * limit;

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        console.log('❌ Doctor profile not found for user:', req.user.id);
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found',
          appointments: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            pages: 0
          }
        });
      }

      console.log('✅ Doctor found:', doctor.id);

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

      console.log('🔍 Searching appointments with:', whereClause);

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

      console.log('📋 Found appointments:', appointments.count);

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
        appointments: [],
        pagination: {
          total: 0,
          page: parseInt(req.query.page) || 1,
          pages: 0
        }
      });
    }
  }

  // Review appointment (approve/reject)
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

      // Find the appointment
      const appointment = await Appointment.findOne({
        where: {
          id: id,
          doctorId: doctor.id
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 'gender']
          },
          {
            model: User,
            as: 'familyMember',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found or access denied' 
        });
      }

      // Update appointment
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      appointment.status = newStatus;
      appointment.doctorNotes = doctorNotes;
      
      if (action === 'reject' && rejectionReason) {
        appointment.rejectionReason = rejectionReason;
      }

      await appointment.save();

      // Create notification
      try {
        await AppointmentNotification.create({
          appointmentId: appointment.id,
          recipientId: appointment.familyMemberId,
          type: action,
          title: `Appointment ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: `Your appointment for ${appointment.elder.firstName} ${appointment.elder.lastName} has been ${action}d.`
        });
      } catch (notificationError) {
        console.log('Warning: Could not create notification:', notificationError.message);
      }

      console.log('✅ Appointment updated successfully');

      res.json({
        success: true,
        message: `Appointment ${action}d successfully`,
        appointment: appointment
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
      const { id } = req.params;
      const { newDateTime, reason } = req.body;

      console.log('🔄 Rescheduling appointment:', { id, newDateTime, reason });

      if (!newDateTime) {
        return res.status(400).json({
          success: false,
          message: 'New date and time is required'
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

      // Find the appointment
      const appointment = await Appointment.findOne({
        where: {
          id: id,
          doctorId: doctor.id
        }
      });

      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found or access denied' 
        });
      }

      // Convert newDateTime string to Date object
      const newDateObj = new Date(newDateTime);

      // Update appointment date and status
      appointment.appointmentDate = newDateObj;
      appointment.status = 'rescheduled';

      if (reason) {
        appointment.rescheduleReason = reason;
      }

      await appointment.save();

      // Create notification
      try {
        await AppointmentNotification.create({
          appointmentId: appointment.id,
          recipientId: appointment.familyMemberId,
          type: 'reschedule',
          title: 'Appointment Rescheduled',
          message: `Your appointment has been rescheduled to ${newDateObj.toLocaleString()}`
        });
      } catch (notificationError) {
        console.log('Warning: Could not create notification:', notificationError.message);
      }

      res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        appointment
      });
    } catch (error) {
      console.error('❌ Reschedule appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  }

  // Complete appointment
  static async completeAppointment(req, res) {
    try {
      const { id } = req.params;
      const { consultation, prescription, followUpRequired, followUpDate } = req.body;

      console.log('🔄 Completing appointment:', { id, consultation, prescription });

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

      // Find the appointment
      const appointment = await Appointment.findOne({
        where: {
          id: id,
          doctorId: doctor.id
        }
      });

      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found or access denied' 
        });
      }

      // Update appointment
      appointment.status = 'completed';
      appointment.consultation = consultation;
      appointment.prescription = prescription;
      appointment.followUpRequired = followUpRequired || false;
      appointment.followUpDate = followUpDate || null;
      appointment.completedAt = new Date();

      await appointment.save();

      // Create consultation record
      if (consultation) {
        try {
          await ConsultationRecord.create({
            appointmentId: appointment.id,
            doctorId: doctor.id,
            elderId: appointment.elderId,
            consultation: consultation,
            prescription: prescription,
            followUpRequired: followUpRequired || false,
            followUpDate: followUpDate || null
          });
        } catch (recordError) {
          console.log('Warning: Could not create consultation record:', recordError.message);
        }
      }

      console.log('✅ Appointment completed successfully');

      res.json({
        success: true,
        message: 'Appointment completed successfully',
        appointment
      });
    } catch (error) {
      console.error('❌ Complete appointment error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get elder's medical summary
  static async getElderMedicalSummary(req, res) {
    try {
      const { elderId } = req.params;

      console.log('🔄 Getting medical summary for elder:', elderId);

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

      // Find elder
      const elder = await Elder.findOne({
        where: { id: elderId },
        attributes: [
          'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 
          'bloodType', 'medicalHistory', 'currentMedications', 
          'allergies', 'chronicConditions', 'phone', 'emergencyContact'
        ]
      });

      if (!elder) {
        return res.status(404).json({ 
          success: false,
          message: 'Elder not found' 
        });
      }

      // Get recent appointments and medical history
      const recentAppointments = await Appointment.findAll({
        where: { 
          elderId,
          status: 'completed'
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
        order: [['appointmentDate', 'DESC']],
        limit: 5
      });

      console.log('✅ Medical summary retrieved successfully');

      res.json({
        success: true,
        message: 'Elder medical summary retrieved successfully',
        elder,
        recentAppointments
      });
    } catch (error) {
      console.error('❌ Get elder medical summary error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  }

  // Get dashboard stats
  static async getDashboardStats(req, res) {
    try {
      console.log('🔄 Getting dashboard stats for user:', req.user.id);

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
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get actual statistics from database
      const [
        todayAppointments,
        pendingAppointments,
        totalPatients,
        monthlyConsultations,
        completedToday
      ] = await Promise.all([
        Appointment.count({
          where: {
            doctorId: doctor.id,
            appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
          }
        }),
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'pending'
          }
        }),
        Appointment.count({
          where: { doctorId: doctor.id },
          distinct: true,
          col: 'elderId'
        }),
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.gte]: startOfMonth }
          }
        }),
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
          }
        })
      ]);

      const stats = {
        todayAppointments,
        pendingAppointments,
        totalPatients,
        monthlyConsultations,
        completedToday,
        emergencyAlerts: 0, // This would need a separate table
        avgRating: 4.8 // This would need a ratings table
      };

      console.log('📊 Dashboard stats:', stats);

      res.json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        stats
      });
    } catch (error) {
      console.error('❌ Get doctor dashboard stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  }

  // Update doctor schedule
  static async updateSchedule(req, res) {
  try {
    const { schedules } = req.body;

    console.log('🔄 Updating doctor schedule:', schedules);

    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({ 
        success: false,
        message: 'Schedules array is required' 
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

    // Begin transaction
    const transaction = await sequelize.transaction();

    try {
      // Get unique dates being updated
      const dates = [...new Set(schedules.map(s => s.date))];
      
      // Remove existing schedules for these dates
      await DoctorSchedule.destroy({
        where: {
          doctorId: doctor.id,
          date: { [Op.in]: dates }
        },
        transaction
      });

      // Create new schedule entries
      const scheduleData = schedules.map(schedule => ({
        doctorId: doctor.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isAvailable: schedule.isAvailable !== false
      }));

      await DoctorSchedule.bulkCreate(scheduleData, { transaction });
      await transaction.commit();

      res.json({
        success: true,
        message: 'Schedule updated successfully'
      });

    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }

    } catch (error) {
      console.error('❌ Update schedule error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to update schedule',
        error: error.message
      });
    }
  }
}

module.exports = DoctorAppointmentController;
