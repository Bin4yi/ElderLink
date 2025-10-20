// backend/controllers/doctorDashboardController.js
const { sequelize } = require('../models');
const { 
  Appointment, 
  Elder, 
  Doctor, 
  User, 
  ConsultationRecord,
  Prescription,
  HealthMonitoring,
  HealthAlert,
  DoctorAssignment
} = require('../models');
const { Op } = require('sequelize');

class DoctorDashboardController {
  
  // Get comprehensive dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      console.log('🔄 Getting comprehensive dashboard stats for user:', req.user.id);

      // Get doctor profile
      const doctor = await Doctor.findOne({
        where: { userId: req.user.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
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
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Get comprehensive statistics
      const [
        todayAppointments,
        upcomingAppointments,
        completedToday,
        pendingAppointments,
        cancelledToday,
        totalPatientsFromAppointments,
        totalPatientsFromAssignments,
        weeklyConsultations,
        monthlyConsultations,
        yearlyConsultations,
        activeHealthAlerts,
        criticalHealthAlerts,
        recentPrescriptions,
        todayRevenue
      ] = await Promise.all([
        // Today's appointments count
        Appointment.count({
          where: {
            doctorId: doctor.id,
            appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
          }
        }),
        
        // Upcoming appointments (future)
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: { [Op.in]: ['scheduled', 'confirmed'] },
            appointmentDate: { [Op.gt]: new Date() }
          }
        }),
        
        // Completed today
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
          }
        }),
        
        // Pending appointments
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: { [Op.in]: ['pending', 'scheduled'] }
          }
        }),
        
        // Cancelled today
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'cancelled',
            appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
          }
        }),
        
        // Total unique patients from appointments
        Appointment.count({
          where: { doctorId: doctor.id },
          distinct: true,
          col: 'elderId'
        }),
        
        // Total unique patients from doctor assignments
        DoctorAssignment.count({
          where: { doctorId: req.user.id },
          distinct: true,
          col: 'elderId'
        }),
        
        // Weekly consultations
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.gte]: startOfWeek }
          }
        }),
        
        // Monthly consultations
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.gte]: startOfMonth }
          }
        }),
        
        // Yearly consultations
        Appointment.count({
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.gte]: startOfYear }
          }
        }),
        
        // Active health alerts for doctor's patients
        HealthAlert.count({
          where: {
            status: 'active',
            severity: { [Op.in]: ['high', 'critical'] }
          },
          include: [{
            model: Elder,
            as: 'elder',
            required: true,
            include: [{
              model: Appointment,
              as: 'appointments',
              where: { doctorId: doctor.id },
              required: true
            }]
          }]
        }),
        
        // Critical health alerts
        HealthAlert.count({
          where: {
            status: 'active',
            severity: 'critical'
          },
          include: [{
            model: Elder,
            as: 'elder',
            required: true,
            include: [{
              model: Appointment,
              as: 'appointments',
              where: { doctorId: doctor.id },
              required: true
            }]
          }]
        }),
        
        // Recent prescriptions (last 7 days)
        Prescription.count({
          where: {
            doctorId: req.user.id,
            createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }),
        
        // Today's revenue from completed appointments
        Appointment.sum('consultationFee', {
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
          }
        })
      ]);

      // Calculate total patients (combine both sources, remove duplicates would need more complex query)
      const totalPatients = totalPatientsFromAppointments + totalPatientsFromAssignments;

      const stats = {
        // Core metrics
        totalPatients,
        todayAppointments,
        upcomingAppointments,
        completedToday,
        pendingAppointments,
        cancelledToday,
        
        // Health alerts
        activeHealthAlerts: activeHealthAlerts || 0,
        criticalHealthAlerts: criticalHealthAlerts || 0,
        
        // Consultations by period
        weeklyConsultations,
        monthlyConsultations,
        yearlyConsultations,
        
        // Additional metrics
        recentPrescriptions,
        todayRevenue: parseFloat(todayRevenue || 0).toFixed(2),
        
        // Calculated metrics
        completionRate: todayAppointments > 0 
          ? ((completedToday / todayAppointments) * 100).toFixed(1)
          : 0,
        averageConsultationsPerDay: monthlyConsultations > 0
          ? (monthlyConsultations / new Date().getDate()).toFixed(1)
          : 0,
          
        // Doctor info
        doctorName: `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}`.trim(),
        specialization: doctor.specialization || 'General Practice'
      };

      console.log('📊 Comprehensive dashboard stats:', stats);

      res.json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        stats
      });
    } catch (error) {
      console.error('❌ Get doctor dashboard stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get today's schedule
  static async getTodaySchedule(req, res) {
    try {
      console.log('📅 Getting today\'s schedule for user:', req.user.id);

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

      const schedule = await Appointment.findAll({
        where: {
          doctorId: doctor.id,
          appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'phone', 'dateOfBirth']
          },
          {
            model: User,
            as: 'familyMember',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ],
        order: [['appointmentDate', 'ASC']]
      });

      const formattedSchedule = schedule.map(apt => ({
        id: apt.id,
        time: apt.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: apt.appointmentDate,
        patient: {
          id: apt.elder?.id,
          name: `${apt.elder?.firstName || ''} ${apt.elder?.lastName || ''}`.trim(),
          photo: apt.elder?.photo,
          phone: apt.elder?.phone,
          age: apt.elder?.dateOfBirth 
            ? Math.floor((new Date() - new Date(apt.elder.dateOfBirth)) / 31557600000)
            : null
        },
        familyMember: apt.familyMember ? {
          name: `${apt.familyMember.firstName || ''} ${apt.familyMember.lastName || ''}`.trim(),
          email: apt.familyMember.email,
          phone: apt.familyMember.phone
        } : null,
        type: apt.type,
        reason: apt.reason,
        status: apt.status,
        notes: apt.notes
      }));

      res.json({
        success: true,
        message: 'Today\'s schedule retrieved successfully',
        schedule: formattedSchedule,
        total: formattedSchedule.length
      });
    } catch (error) {
      console.error('❌ Get today\'s schedule error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve schedule',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get recent activity
  static async getRecentActivity(req, res) {
    try {
      console.log('📝 Getting recent activity for user:', req.user.id);

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found' 
        });
      }

      const { limit = 10 } = req.query;

      // Get recent consultations
      const recentConsultations = await ConsultationRecord.findAll({
        where: { doctorId: req.user.id },
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo']
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'type', 'status']
          }
        ],
        order: [['sessionDate', 'DESC']],
        limit: parseInt(limit)
      });

      const formattedActivity = recentConsultations.map(consultation => ({
        id: consultation.id,
        type: 'consultation',
        patient: {
          id: consultation.elder?.id,
          name: `${consultation.elder?.firstName || ''} ${consultation.elder?.lastName || ''}`.trim(),
          photo: consultation.elder?.photo
        },
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        date: consultation.sessionDate,
        appointmentType: consultation.appointment?.type,
        priority: consultation.followUpRequired ? 'high' : 'normal',
        followUpDate: consultation.followUpDate
      }));

      res.json({
        success: true,
        message: 'Recent activity retrieved successfully',
        activity: formattedActivity,
        total: formattedActivity.length
      });
    } catch (error) {
      console.error('❌ Get recent activity error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve recent activity',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get health alerts for doctor's patients
  static async getHealthAlerts(req, res) {
    try {
      console.log('🚨 Getting health alerts for user:', req.user.id);

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found' 
        });
      }

      const { severity, limit = 10 } = req.query;

      const whereClause = {
        status: 'active'
      };

      if (severity) {
        whereClause.severity = severity;
      }

      // Get patient IDs for this doctor
      const patientIds = await Appointment.findAll({
        where: { doctorId: doctor.id },
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('elderId')), 'elderId']],
        raw: true
      });

      const elderIds = patientIds.map(p => p.elderId);

      if (elderIds.length === 0) {
        return res.json({
          success: true,
          message: 'No patients found',
          alerts: [],
          total: 0
        });
      }

      const alerts = await HealthAlert.findAll({
        where: {
          ...whereClause,
          elderId: { [Op.in]: elderIds }
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'phone']
          }
        ],
        order: [
          [sequelize.literal(`CASE severity 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
          END`), 'ASC'],
          ['createdAt', 'DESC']
        ],
        limit: parseInt(limit)
      });

      const formattedAlerts = alerts.map(alert => ({
        id: alert.id,
        patient: {
          id: alert.elder?.id,
          name: `${alert.elder?.firstName || ''} ${alert.elder?.lastName || ''}`.trim(),
          photo: alert.elder?.photo,
          phone: alert.elder?.phone
        },
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        triggerValue: alert.triggerValue,
        normalRange: alert.normalRange,
        status: alert.status,
        createdAt: alert.createdAt,
        acknowledgedAt: alert.acknowledgedAt
      }));

      res.json({
        success: true,
        message: 'Health alerts retrieved successfully',
        alerts: formattedAlerts,
        total: formattedAlerts.length
      });
    } catch (error) {
      console.error('❌ Get health alerts error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve health alerts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get upcoming appointments
  static async getUpcomingAppointments(req, res) {
    try {
      console.log('📆 Getting upcoming appointments for user:', req.user.id);

      const doctor = await Doctor.findOne({
        where: { userId: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found' 
        });
      }

      const { days = 7, limit = 10 } = req.query;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(days));

      const appointments = await Appointment.findAll({
        where: {
          doctorId: doctor.id,
          status: { [Op.in]: ['upcoming', 'today'] },
          appointmentDate: {
            [Op.between]: [new Date(), futureDate]
          }
        },
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'phone', 'dateOfBirth']
          },
          {
            model: User,
            as: 'familyMember',
            attributes: ['id', 'firstName', 'lastName', 'phone']
          }
        ],
        order: [['appointmentDate', 'ASC']],
        limit: parseInt(limit)
      });

      const formattedAppointments = appointments.map(apt => ({
        id: apt.id,
        date: apt.appointmentDate,
        time: apt.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        patient: {
          id: apt.elder?.id,
          name: `${apt.elder?.firstName || ''} ${apt.elder?.lastName || ''}`.trim(),
          photo: apt.elder?.photo,
          phone: apt.elder?.phone,
          age: apt.elder?.dateOfBirth 
            ? Math.floor((new Date() - new Date(apt.elder.dateOfBirth)) / 31557600000)
            : null
        },
        type: apt.type,
        reason: apt.reason,
        status: apt.status,
        familyMemberPhone: apt.familyMember?.phone
      }));

      res.json({
        success: true,
        message: 'Upcoming appointments retrieved successfully',
        appointments: formattedAppointments,
        total: formattedAppointments.length
      });
    } catch (error) {
      console.error('❌ Get upcoming appointments error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve upcoming appointments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get revenue history for chart (last 7 days)
  static async getRevenueHistory(req, res) {
    try {
      console.log('🔄 Getting revenue history for user:', req.user.id);

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

      const days = parseInt(req.query.days) || 7;
      const revenueData = [];

      // Get revenue for each of the last N days
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const dailyRevenue = await Appointment.sum('consultationFee', {
          where: {
            doctorId: doctor.id,
            status: 'completed',
            appointmentDate: { [Op.between]: [startOfDay, endOfDay] }
          }
        });

        revenueData.push({
          date: startOfDay.toISOString().split('T')[0],
          day: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: parseFloat(dailyRevenue || 0).toFixed(2)
        });
      }

      const totalRevenue = revenueData.reduce((sum, day) => sum + parseFloat(day.revenue), 0);

      res.json({
        success: true,
        message: 'Revenue history retrieved successfully',
        revenueData,
        totalRevenue: totalRevenue.toFixed(2),
        days
      });
    } catch (error) {
      console.error('❌ Get revenue history error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve revenue history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = DoctorDashboardController;
