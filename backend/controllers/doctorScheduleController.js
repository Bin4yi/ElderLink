// backend/controllers/doctorScheduleController.js
const { DoctorSchedule, Doctor } = require('../models');
const { Op } = require('sequelize');

class DoctorScheduleController {
  // Helper to get doctor ID from user
  static async getDoctorId(userId) {
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      throw new Error('Doctor profile not found');
    }
    return doctor.id;
  }

  // Get doctor's schedules
  static async getSchedules(req, res) {
    try {
      const doctorId = await DoctorScheduleController.getDoctorId(req.user.id);
      const { year, month } = req.query;

      let whereClause = { doctorId };

      if (year && month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const schedules = await DoctorSchedule.findAll({
        where: whereClause,
        order: [['date', 'ASC'], ['startTime', 'ASC']]
      });

      res.json({
        success: true,
        data: schedules,
        count: schedules.length
      });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch schedules',
        error: error.message
      });
    }
  }

  // Add single schedule
  static async addSchedule(req, res) {
    try {
      const doctorId = await DoctorScheduleController.getDoctorId(req.user.id);
      const { date, startTime, endTime, slotDuration, isAvailable } = req.body;

      console.log('📅 Adding schedule for doctor:', doctorId, req.body);

      if (!date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Date, start time, and end time are required'
        });
      }

      // Check if schedule already exists
      const existing = await DoctorSchedule.findOne({
        where: {
          doctorId,
          date,
          startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
          endTime: endTime.length === 5 ? `${endTime}:00` : endTime
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Schedule already exists for this time slot'
        });
      }

      const schedule = await DoctorSchedule.create({
        doctorId,
        date,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
        slotDuration: slotDuration || 30,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      });

      console.log('✅ Schedule created:', schedule.id);

      res.json({
        success: true,
        data: schedule,
        message: 'Schedule added successfully'
      });
    } catch (error) {
      console.error('❌ Error adding schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add schedule',
        error: error.message
      });
    }
  }

  // Add bulk schedules
  static async addBulkSchedules(req, res) {
    try {
      const doctorId = await DoctorScheduleController.getDoctorId(req.user.id);
      const { schedules, startDate, days, timeSlots, skipSunday } = req.body;

      console.log('📅 Bulk add request for doctor:', doctorId, { startDate, days, timeSlotsCount: timeSlots?.length });

      // Handle two different input formats
      let schedulesToCreate = [];

      if (schedules && Array.isArray(schedules)) {
        // Format 1: Array of schedules directly
        schedulesToCreate = schedules.map(schedule => ({
          ...schedule,
          doctorId,
          startTime: schedule.startTime.length === 5 ? `${schedule.startTime}:00` : schedule.startTime,
          endTime: schedule.endTime.length === 5 ? `${schedule.endTime}:00` : schedule.endTime,
          slotDuration: schedule.slotDuration || 30,
          isAvailable: schedule.isAvailable !== undefined ? schedule.isAvailable : true
        }));
      } else if (startDate && days && timeSlots) {
        // Format 2: Generate schedules for N days
        const start = new Date(startDate);
        
        for (let i = 0; i < days; i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          
          // Skip Sundays if requested
          if (skipSunday && currentDate.getDay() === 0) {
            continue;
          }
          
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // Add all time slots for this date
          for (const slot of timeSlots) {
            schedulesToCreate.push({
              doctorId,
              date: dateStr,
              startTime: slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime,
              endTime: slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime,
              slotDuration: slot.slotDuration || 30,
              isAvailable: true
            });
          }
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either provide schedules array or (startDate, days, timeSlots)'
        });
      }

      if (schedulesToCreate.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No schedules to create'
        });
      }

      console.log(`📝 Creating ${schedulesToCreate.length} schedules...`);

      const created = await DoctorSchedule.bulkCreate(schedulesToCreate, {
        ignoreDuplicates: true
      });

      console.log(`✅ Created ${created.length} schedules`);

      res.json({
        success: true,
        data: created,
        count: created.length,
        message: `${created.length} schedules added successfully`
      });
    } catch (error) {
      console.error('❌ Error adding bulk schedules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add bulk schedules',
        error: error.message
      });
    }
  }

  // Update schedule
  static async updateSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const doctorId = await DoctorScheduleController.getDoctorId(req.user.id);
      const { startTime, endTime, slotDuration, isAvailable } = req.body;

      const schedule = await DoctorSchedule.findOne({
        where: {
          id: scheduleId,
          doctorId
        }
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      await schedule.update({
        startTime: startTime || schedule.startTime,
        endTime: endTime || schedule.endTime,
        slotDuration: slotDuration || schedule.slotDuration,
        isAvailable: isAvailable !== undefined ? isAvailable : schedule.isAvailable
      });

      res.json({
        success: true,
        schedule,
        message: 'Schedule updated successfully'
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update schedule',
        error: error.message
      });
    }
  }

  // Delete schedule
  static async deleteSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const doctorId = await DoctorScheduleController.getDoctorId(req.user.id);

      const schedule = await DoctorSchedule.findOne({
        where: {
          id: scheduleId,
          doctorId
        }
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      await schedule.destroy();

      res.json({
        success: true,
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete schedule',
        error: error.message
      });
    }
  }
}

module.exports = DoctorScheduleController;
