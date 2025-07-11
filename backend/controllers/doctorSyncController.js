// backend/controllers/doctorSyncController.js
const DoctorSyncService = require('../services/doctorSyncService');
const { User, Doctor } = require('../models');

const doctorSyncController = {
  
  // Sync all doctors from User table (Admin only)
  syncAllDoctors: async (req, res) => {
    try {
      const result = await DoctorSyncService.syncAllDoctorsFromUsers();
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Doctor sync completed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error syncing doctors',
        error: error.message
      });
    }
  },
  
  // Sync single doctor by user ID (Admin only)
  syncSingleDoctor: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (user.role !== 'doctor') {
        return res.status(400).json({
          success: false,
          message: 'User role is not doctor'
        });
      }
      
      const result = await DoctorSyncService.syncSingleDoctor(user);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Doctor ${result.action} successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error syncing doctor',
        error: error.message
      });
    }
  },
  
  // Get all users with role 'doctor' and their sync status
  getDoctorUsers: async (req, res) => {
    try {
      const doctorUsers = await User.findAll({
        where: { role: 'doctor' },
        include: [
          {
            model: Doctor,
            as: 'doctorProfile',
            required: false,
            attributes: ['id', 'specialization', 'licenseNumber', 'verificationStatus', 'syncedAt']
          }
        ],
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'isActive', 'createdAt']
      });
      
      // Add sync status to each user
      const usersWithSyncStatus = doctorUsers.map(user => ({
        ...user.toJSON(),
        syncStatus: user.doctorProfile ? 'Synced' : 'Not Synced',
        needsUpdate: user.doctorProfile ? 
          (user.doctorProfile.specialization === 'General Medicine' || 
           user.doctorProfile.licenseNumber.startsWith('TEMP-') ||
           user.doctorProfile.verificationStatus === 'Pending') : false
      }));
      
      res.status(200).json({
        success: true,
        data: usersWithSyncStatus,
        message: 'Doctor users retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctor users',
        error: error.message
      });
    }
  },
  
  // Get doctors that need profile updates
  getDoctorsNeedingUpdate: async (req, res) => {
    try {
      const doctors = await DoctorSyncService.getDoctorsNeedingUpdate();
      
      res.status(200).json({
        success: true,
        data: doctors,
        message: 'Doctors needing update retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors needing update',
        error: error.message
      });
    }
  },
  
  // Complete doctor profile setup (Admin updates after sync)
  completeDoctorProfile: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const {
        specialization,
        licenseNumber,
        experience,
        medicalSchool,
        residency,
        boardCertifications,
        qualifications,
        consultationFee,
        clinicAddress,
        npiNumber,
        deaNumber,
        availableDays,
        timeSlots
      } = req.body;
      
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }
      
      // Update doctor profile with complete information
      await doctor.update({
        specialization,
        licenseNumber,
        experience,
        medicalSchool,
        residency,
        boardCertifications,
        qualifications,
        consultationFee,
        clinicAddress,
        npiNumber,
        deaNumber,
        availableDays,
        timeSlots,
        verificationStatus: 'Verified',
        verifiedAt: new Date(),
        verifiedBy: req.user?.id // Assuming auth middleware provides user
      });
      
      const updatedDoctor = await Doctor.findByPk(doctorId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });
      
      res.status(200).json({
        success: true,
        data: updatedDoctor,
        message: 'Doctor profile completed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error completing doctor profile',
        error: error.message
      });
    }
  },
  
  // Remove doctor profile when user role changes
  removeDoctorProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const result = await DoctorSyncService.removeDoctorProfile(userId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Doctor profile removed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing doctor profile',
        error: error.message
      });
    }
  },
  
  // Get sync statistics
  getSyncStats: async (req, res) => {
    try {
      const [totalDoctorUsers, syncedDoctors, pendingVerification, needsUpdate] = await Promise.all([
        User.count({ where: { role: 'doctor', isActive: true } }),
        Doctor.count({ where: { isActive: true } }),
        Doctor.count({ where: { verificationStatus: 'Pending', isActive: true } }),
        DoctorSyncService.getDoctorsNeedingUpdate()
      ]);
      
      const stats = {
        totalDoctorUsers,
        syncedDoctors,
        notSynced: totalDoctorUsers - syncedDoctors,
        pendingVerification,
        needsUpdate: needsUpdate.length,
        syncPercentage: totalDoctorUsers > 0 ? Math.round((syncedDoctors / totalDoctorUsers) * 100) : 0
      };
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Sync statistics retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching sync statistics',
        error: error.message
      });
    }
  }
};

module.exports = doctorSyncController;