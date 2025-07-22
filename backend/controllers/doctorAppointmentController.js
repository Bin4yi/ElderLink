// backend/controllers/doctorAppointmentController.js
const { Doctor, DoctorSchedule, ScheduleException, User } = require('../models');
const { Op } = require('sequelize');

class DoctorAppointmentController {
  
  // Get doctor's appointments
  static async getDoctorAppointments(req, res) {
    try {
      const { status, date, page = 1, limit = 10 } = req.query;
      
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

      // Build query conditions
      const whereCondition = { doctorId: doctor.id };
      if (status) whereCondition.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        whereCondition.appointmentDate = {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        };
      }

      // Mock appointments data - replace with actual database query
      const mockAppointments = [
        {
          id: 1,
          elderId: 1,
          doctorId: doctor.id,
          familyMemberId: 2,
          appointmentDate: new Date('2024-01-15T10:00:00'),
          reason: 'Regular checkup',
          symptoms: 'Mild fatigue',
          notes: 'Monthly health monitoring',
          priority: 'medium',
          type: 'consultation',
          status: 'pending',
          elder: {
            id: 1,
            firstName: 'John',
            lastName: 'Elder',
            dateOfBirth: '1950-01-01',
            gender: 'male'
          },
          familyMember: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Elder',
            email: 'jane@elderlink.com'
          }
        }
      ];

      res.json({
        success: true,
        data: {
          appointments: mockAppointments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 1,
            totalItems: mockAppointments.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  }

  // ✅ ENHANCED: Update doctor's schedule with proper database operations
  static async updateSchedule(req, res) {
    try {
      console.log('🔄 Updating doctor schedule...');
      console.log('Request body:', req.body);
      console.log('User:', req.user);

      const { schedules } = req.body;
      
      // Validate input
      if (!schedules || !Array.isArray(schedules)) {
        return res.status(400).json({ 
          success: false,
          message: 'Schedules array is required' 
        });
      }

      if (schedules.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'At least one schedule slot is required' 
        });
      }

      // Get doctor profile
      const doctor = await Doctor.findOne({ 
        where: { userId: req.user.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      });

      if (!doctor) {
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found' 
        });
      }

      console.log('✅ Doctor found:', doctor.id, doctor.user?.firstName, doctor.user?.lastName);

      // Validate schedule data
      for (const schedule of schedules) {
        if (!schedule.date || !schedule.startTime || !schedule.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Each schedule must have date, startTime, and endTime'
          });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(schedule.date)) {
          return res.status(400).json({
            success: false,
            message: 'Date must be in YYYY-MM-DD format'
          });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
          return res.status(400).json({
            success: false,
            message: 'Time must be in HH:MM format'
          });
        }

        // Ensure end time is after start time
        if (schedule.startTime >= schedule.endTime) {
          return res.status(400).json({
            success: false,
            message: 'End time must be after start time'
          });
        }
      }

      // Get unique dates from schedules
      const dates = [...new Set(schedules.map(s => s.date))];
      console.log('📅 Processing dates:', dates);

      // Remove existing schedules for these dates
      const deletedCount = await DoctorSchedule.destroy({ 
        where: { 
          doctorId: doctor.id, 
          date: { [Op.in]: dates } 
        } 
      });

      console.log(`🗑️ Deleted ${deletedCount} existing schedule entries`);

      // Prepare new schedules for bulk creation
      const newSchedules = schedules.map(schedule => ({
        doctorId: doctor.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isAvailable: schedule.isAvailable !== false // Default to true if not specified
      }));

      console.log('📝 Creating new schedules:', newSchedules);

      // Create new schedules
      const createdSchedules = await DoctorSchedule.bulkCreate(newSchedules, {
        returning: true // Return created records
      });

      console.log('✅ Created schedules:', createdSchedules.length);

      // Format response
      const formattedSchedules = createdSchedules.map(schedule => ({
        id: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isAvailable: schedule.isAvailable,
        createdAt: schedule.createdAt
      }));

      res.json({ 
        success: true,
        message: 'Schedule updated successfully',
        data: {
          doctor: {
            id: doctor.id,
            name: `${doctor.user?.firstName} ${doctor.user?.lastName}`,
            specialization: doctor.specialization
          },
          schedules: formattedSchedules,
          summary: {
            datesUpdated: dates.length,
            slotsCreated: createdSchedules.length,
            slotsDeleted: deletedCount
          }
        }
      });

    } catch (error) {
      console.error('❌ Failed to update schedule:', error);
      
      // Check for specific database errors
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => e.message)
        });
      }

      if (error.name === 'SequelizeDatabaseError') {
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
      }

      res.status(500).json({ 
        success: false,
        message: 'Failed to update schedule',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
          success: false,
          message: 'Date is required' 
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

      const exception = await ScheduleException.create({
        doctorId: doctor.id,
        date: new Date(date),
        startTime,
        endTime,
        isUnavailable,
        reason
      });

      res.status(201).json({
        success: true,
        message: 'Schedule exception added successfully',
        data: exception
      });
    } catch (error) {
      console.error('Add schedule exception error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  }

  // Reschedule appointment
  static async rescheduleAppointment(req, res) {
    try {
      const { id } = req.params;
      const { newDateTime, reason } = req.body;

      if (!newDateTime) {
        return res.status(400).json({
          success: false,
          message: 'New date and time is required'
        });
      }

      // Mock reschedule - replace with actual database update
      console.log(`🔄 Rescheduling appointment ${id} to ${newDateTime}`);

      res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: {
          appointmentId: parseInt(id),
          newDateTime,
          reason,
          rescheduledAt: new Date()
        }
      });
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reschedule appointment'
      });
    }
  }

  // Get doctor's schedule
  static async getSchedule(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
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

      // Build query conditions
      const whereCondition = { doctorId: doctor.id };
      if (startDate && endDate) {
        whereCondition.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const schedules = await DoctorSchedule.findAll({
        where: whereCondition,
        order: [['date', 'ASC'], ['startTime', 'ASC']]
      });

      res.json({
        success: true,
        message: 'Schedule retrieved successfully',
        data: schedules
      });
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve schedule'
      });
    }
  }
}

module.exports = DoctorAppointmentController;
