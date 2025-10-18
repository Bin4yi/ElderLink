// backend/controllers/doctorProfileController.js
const { Doctor, User } = require('../models');
const { Op } = require('sequelize');

class DoctorProfileController {
  // Get doctor profile
  static async getDoctorProfile(req, res) {
    try {
      const userId = req.user.id;
      console.log('🔍 Getting doctor profile for user:', userId);

      // Find doctor with user information
      const doctor = await Doctor.findOne({
        where: { userId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'createdAt']
        }]
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      console.log('✅ Doctor profile found:', doctor.id);

      res.json({
        success: true,
        data: {
          id: doctor.id,
          userId: doctor.userId,
          // User information
          firstName: doctor.user.firstName,
          lastName: doctor.user.lastName,
          email: doctor.user.email,
          phone: doctor.user.phone || doctor.phone,
          // Doctor specific information
          specialization: doctor.specialization,
          licenseNumber: doctor.licenseNumber,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          availableDays: doctor.availableDays,
          timeSlots: doctor.timeSlots,
          isActive: doctor.isActive,
          verificationStatus: doctor.verificationStatus,
          verifiedAt: doctor.verifiedAt,
          // Additional information
          medicalSchool: doctor.medicalSchool,
          clinicAddress: doctor.clinicAddress,
          profileImage: doctor.profileImage,
          bio: doctor.bio,
          // Metadata
          createdAt: doctor.createdAt,
          updatedAt: doctor.updatedAt,
          memberSince: doctor.user.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Error fetching doctor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch doctor profile',
        error: error.message
      });
    }
  }

  // Update doctor profile
  static async updateDoctorProfile(req, res) {
    try {
      const userId = req.user.id;
      const {
        // User fields
        firstName,
        lastName,
        phone,
        // Doctor fields
        specialization,
        experience,
        consultationFee,
        availableDays,
        timeSlots,
        medicalSchool,
        clinicAddress,
        bio,
        profileImage
      } = req.body;

      console.log('🔄 Updating doctor profile for user:', userId);

      // Find doctor
      const doctor = await Doctor.findOne({
        where: { userId },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      // Update User fields
      const userUpdates = {};
      if (firstName !== undefined) userUpdates.firstName = firstName;
      if (lastName !== undefined) userUpdates.lastName = lastName;
      if (phone !== undefined) userUpdates.phone = phone;

      if (Object.keys(userUpdates).length > 0) {
        await User.update(userUpdates, {
          where: { id: userId }
        });
        console.log('✅ User information updated');
      }

      // Update Doctor fields
      const doctorUpdates = {};
      if (specialization !== undefined) doctorUpdates.specialization = specialization;
      if (experience !== undefined) doctorUpdates.experience = experience;
      if (consultationFee !== undefined) doctorUpdates.consultationFee = consultationFee;
      if (availableDays !== undefined) doctorUpdates.availableDays = availableDays;
      if (timeSlots !== undefined) doctorUpdates.timeSlots = timeSlots;
      if (medicalSchool !== undefined) doctorUpdates.medicalSchool = medicalSchool;
      if (clinicAddress !== undefined) doctorUpdates.clinicAddress = clinicAddress;
      if (bio !== undefined) doctorUpdates.bio = bio;
      if (profileImage !== undefined) doctorUpdates.profileImage = profileImage;
      if (phone !== undefined && !doctor.phone) doctorUpdates.phone = phone; // Store in doctor table too

      if (Object.keys(doctorUpdates).length > 0) {
        await doctor.update(doctorUpdates);
        console.log('✅ Doctor profile updated');
      }

      // Fetch updated profile
      const updatedDoctor = await Doctor.findOne({
        where: { userId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'createdAt']
        }]
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedDoctor.id,
          userId: updatedDoctor.userId,
          firstName: updatedDoctor.user.firstName,
          lastName: updatedDoctor.user.lastName,
          email: updatedDoctor.user.email,
          phone: updatedDoctor.user.phone || updatedDoctor.phone,
          specialization: updatedDoctor.specialization,
          licenseNumber: updatedDoctor.licenseNumber,
          experience: updatedDoctor.experience,
          consultationFee: updatedDoctor.consultationFee,
          availableDays: updatedDoctor.availableDays,
          timeSlots: updatedDoctor.timeSlots,
          isActive: updatedDoctor.isActive,
          verificationStatus: updatedDoctor.verificationStatus,
          verifiedAt: updatedDoctor.verifiedAt,
          medicalSchool: updatedDoctor.medicalSchool,
          clinicAddress: updatedDoctor.clinicAddress,
          profileImage: updatedDoctor.profileImage,
          bio: updatedDoctor.bio,
          createdAt: updatedDoctor.createdAt,
          updatedAt: updatedDoctor.updatedAt,
          memberSince: updatedDoctor.user.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Error updating doctor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update doctor profile',
        error: error.message
      });
    }
  }

  // Get doctor statistics
  static async getDoctorStats(req, res) {
    try {
      const userId = req.user.id;
      
      // Find doctor
      const doctor = await Doctor.findOne({
        where: { userId }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      // Get statistics from various tables
      const { Appointment, DoctorAssignment } = require('../models');
      const { fn, col, literal } = require('sequelize');
      
      const totalAppointments = await Appointment.count({
        where: { doctorId: doctor.id }
      });

      const completedAppointments = await Appointment.count({
        where: { 
          doctorId: doctor.id,
          status: 'completed'
        }
      });

      const totalPatients = await DoctorAssignment.count({
        where: {
          doctorId: userId,
          status: 'active'
        }
      });

      // Calculate total revenue from completed appointments (earned revenue)
      const earnedRevenueResult = await Appointment.findOne({
        attributes: [
          [fn('SUM', col('consultationFee')), 'earnedRevenue']
        ],
        where: {
          doctorId: doctor.id,
          status: 'completed',
          consultationFee: { [Op.ne]: null }
        },
        raw: true
      });

      const earnedRevenue = parseFloat(earnedRevenueResult?.earnedRevenue || 0);

      // Calculate expected revenue from all confirmed appointments (not cancelled)
      const expectedRevenueResult = await Appointment.findOne({
        attributes: [
          [fn('SUM', col('consultationFee')), 'expectedRevenue']
        ],
        where: {
          doctorId: doctor.id,
          status: { 
            [Op.in]: ['pending', 'upcoming', 'today', 'in-progress', 'completed'] 
          },
          consultationFee: { [Op.ne]: null }
        },
        raw: true
      });

      const expectedRevenue = parseFloat(expectedRevenueResult?.expectedRevenue || 0);
      const totalRevenue = expectedRevenue; // Total includes all confirmed appointments

      // Calculate revenue this month (completed)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyEarnedResult = await Appointment.findOne({
        attributes: [
          [fn('SUM', col('consultationFee')), 'monthlyEarned']
        ],
        where: {
          doctorId: doctor.id,
          status: 'completed',
          consultationFee: { [Op.ne]: null },
          createdAt: { [Op.gte]: startOfMonth }
        },
        raw: true
      });

      const monthlyEarned = parseFloat(monthlyEarnedResult?.monthlyEarned || 0);

      // Calculate expected revenue this month (all confirmed appointments)
      const monthlyExpectedResult = await Appointment.findOne({
        attributes: [
          [fn('SUM', col('consultationFee')), 'monthlyExpected']
        ],
        where: {
          doctorId: doctor.id,
          status: { 
            [Op.in]: ['pending', 'upcoming', 'today', 'in-progress', 'completed'] 
          },
          consultationFee: { [Op.ne]: null },
          createdAt: { [Op.gte]: startOfMonth }
        },
        raw: true
      });

      const monthlyExpected = parseFloat(monthlyExpectedResult?.monthlyExpected || 0);
      const monthlyRevenue = monthlyExpected; // Show expected revenue for the month

      // Calculate average consultation fee
      const avgFeeResult = await Appointment.findOne({
        attributes: [
          [fn('AVG', col('consultationFee')), 'averageFee']
        ],
        where: {
          doctorId: doctor.id,
          consultationFee: { [Op.ne]: null }
        },
        raw: true
      });

      const averageConsultationFee = parseFloat(avgFeeResult?.averageFee || doctor.consultationFee);

      // Count pending appointments (for additional info)
      const pendingAppointments = await Appointment.count({
        where: {
          doctorId: doctor.id,
          status: { [Op.in]: ['pending', 'upcoming', 'today'] }
        }
      });

      // Apply 90% calculation (10% goes to system)
      const DOCTOR_SHARE = 0.90;

      res.json({
        success: true,
        data: {
          totalAppointments,
          completedAppointments,
          pendingAppointments,
          totalPatients,
          yearsOfExperience: doctor.experience,
          consultationFee: doctor.consultationFee,
          verificationStatus: doctor.verificationStatus,
          // Revenue analytics (90% to doctor, 10% to system)
          totalRevenue: (totalRevenue * DOCTOR_SHARE).toFixed(2), // All confirmed appointments
          earnedRevenue: (earnedRevenue * DOCTOR_SHARE).toFixed(2), // Only completed
          monthlyRevenue: (monthlyRevenue * DOCTOR_SHARE).toFixed(2), // This month's expected
          monthlyEarned: (monthlyEarned * DOCTOR_SHARE).toFixed(2), // This month's earned
          averageConsultationFee: (averageConsultationFee * DOCTOR_SHARE).toFixed(2)
        }
      });

    } catch (error) {
      console.error('❌ Error fetching doctor stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  // Get daily revenue for chart (30 days)
  static async getDailyRevenue(req, res) {
    try {
      const userId = req.user.id;
      const days = parseInt(req.query.days) || 30;
      
      // Find doctor
      const doctor = await Doctor.findOne({
        where: { userId }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      const { Appointment } = require('../models');
      const { fn, col, Op } = require('sequelize');
      const { Sequelize } = require('sequelize');
      
      // Get date range
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      
      // Query daily revenue
      const dailyRevenue = await Appointment.findAll({
        attributes: [
          [fn('DATE', col('createdAt')), 'date'],
          [fn('SUM', col('consultationFee')), 'revenue'],
          [fn('COUNT', col('id')), 'appointments']
        ],
        where: {
          doctorId: doctor.id,
          status: {
            [Op.in]: ['pending', 'upcoming', 'today', 'in-progress', 'completed']
          },
          consultationFee: { [Op.ne]: null },
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: [fn('DATE', col('createdAt'))],
        order: [[fn('DATE', col('createdAt')), 'ASC']],
        raw: true
      });

      // Apply 90% calculation (10% goes to system)
      const DOCTOR_SHARE = 0.90;
      
      // Fill in missing days with zero revenue
      const result = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = dailyRevenue.find(d => d.date === dateStr);
        
        result.push({
          date: dateStr,
          revenue: dayData ? (parseFloat(dayData.revenue) * DOCTOR_SHARE).toFixed(2) : '0.00',
          appointments: dayData ? parseInt(dayData.appointments) : 0
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ Error fetching daily revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily revenue',
        error: error.message
      });
    }
  }
}

module.exports = DoctorProfileController;
