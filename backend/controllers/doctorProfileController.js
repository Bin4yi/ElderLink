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

      res.json({
        success: true,
        data: {
          totalAppointments,
          completedAppointments,
          totalPatients,
          yearsOfExperience: doctor.experience,
          consultationFee: doctor.consultationFee,
          verificationStatus: doctor.verificationStatus
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
}

module.exports = DoctorProfileController;
