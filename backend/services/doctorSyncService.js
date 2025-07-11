// backend/services/doctorSyncService.js
const { User, Doctor } = require('../models');
const { Op } = require('sequelize');

class DoctorSyncService {
  
  // Sync all users with role 'doctor' to Doctor table
  static async syncAllDoctorsFromUsers() {
    try {
      console.log('🔄 Starting doctor sync from User table...');
      
      // Get all users with role 'doctor'
      const doctorUsers = await User.findAll({
        where: { 
          role: 'doctor',
          isActive: true 
        },
        include: [
          {
            model: Doctor,
            as: 'doctorProfile',
            required: false
          }
        ]
      });
      
      console.log(`📋 Found ${doctorUsers.length} users with role 'doctor'`);
      
      let synced = 0;
      let updated = 0;
      let skipped = 0;
      
      for (const user of doctorUsers) {
        const result = await this.syncSingleDoctor(user);
        
        if (result.action === 'created') synced++;
        else if (result.action === 'updated') updated++;
        else skipped++;
      }
      
      console.log(`✅ Sync completed: ${synced} created, ${updated} updated, ${skipped} skipped`);
      
      return {
        total: doctorUsers.length,
        created: synced,
        updated: updated,
        skipped: skipped
      };
      
    } catch (error) {
      console.error('❌ Error syncing doctors:', error);
      throw error;
    }
  }
  
  // Sync single user to Doctor table
  static async syncSingleDoctor(user) {
    try {
      // Check if doctor profile already exists
      let doctor = await Doctor.findOne({ where: { userId: user.id } });
      
      if (doctor) {
        // Update existing doctor with latest user info
        const needsUpdate = this.checkIfUpdateNeeded(user, doctor);
        
        if (needsUpdate) {
          await doctor.update({
            lastSyncedFromUser: new Date()
          });
          console.log(`🔄 Updated doctor profile for ${user.firstName} ${user.lastName}`);
          return { action: 'updated', doctor };
        } else {
          console.log(`⏭️  Skipped ${user.firstName} ${user.lastName} - already up to date`);
          return { action: 'skipped', doctor };
        }
        
      } else {
        // Create new doctor profile
        const doctorData = this.createDoctorDataFromUser(user);
        doctor = await Doctor.create(doctorData);
        
        console.log(`✅ Created new doctor profile for ${user.firstName} ${user.lastName}`);
        return { action: 'created', doctor };
      }
      
    } catch (error) {
      console.error(`❌ Error syncing doctor for user ${user.id}:`, error);
      throw error;
    }
  }
  
  // Create doctor data from user info
  static createDoctorDataFromUser(user) {
    return {
      userId: user.id,
      // Default values - admin can update these later
      specialization: 'General Medicine', // Default, admin should update
      licenseNumber: `TEMP-${user.id.substring(0, 8)}`, // Temporary, admin should update
      experience: 0, // Default, admin should update
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'],
      consultationFee: 100.00,
      verificationStatus: 'Pending', // Requires admin verification
      syncedAt: new Date(),
      lastSyncedFromUser: new Date()
    };
  }
  
  // Check if doctor needs updating from user data
  static checkIfUpdateNeeded(user, doctor) {
    // Check if user was updated after last sync
    const userUpdatedAt = new Date(user.updatedAt);
    const lastSynced = new Date(doctor.lastSyncedFromUser);
    
    return userUpdatedAt > lastSynced;
  }
  
  // Sync new doctor when user role is changed to 'doctor'
  static async syncNewDoctorFromUser(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Doctor,
            as: 'doctorProfile',
            required: false
          }
        ]
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role !== 'doctor') {
        throw new Error('User role is not doctor');
      }
      
      return await this.syncSingleDoctor(user);
      
    } catch (error) {
      console.error('❌ Error syncing new doctor:', error);
      throw error;
    }
  }
  
  // Remove doctor profile when user role is changed from 'doctor'
  static async removeDoctorProfile(userId) {
    try {
      const doctor = await Doctor.findOne({ where: { userId } });
      
      if (doctor) {
        // Soft delete - set isActive to false instead of deleting
        await doctor.update({ isActive: false });
        console.log(`🗑️  Deactivated doctor profile for user ${userId}`);
        return { action: 'deactivated', doctor };
      } else {
        console.log(`⏭️  No doctor profile found for user ${userId}`);
        return { action: 'not_found' };
      }
      
    } catch (error) {
      console.error('❌ Error removing doctor profile:', error);
      throw error;
    }
  }
  
  // Get doctors with missing or incomplete profiles
  static async getDoctorsNeedingUpdate() {
    try {
      const doctors = await Doctor.findAll({
        where: {
          [Op.or]: [
            { specialization: 'General Medicine' }, // Default value
            { licenseNumber: { [Op.like]: 'TEMP-%' } }, // Temporary license
            { verificationStatus: 'Pending' }
          ]
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });
      
      return doctors;
    } catch (error) {
      console.error('❌ Error getting doctors needing update:', error);
      throw error;
    }
  }
  
  // Auto-sync function to be called periodically
  static async autoSync() {
    try {
      console.log('🤖 Running automatic doctor sync...');
      const result = await this.syncAllDoctorsFromUsers();
      
      if (result.created > 0 || result.updated > 0) {
        console.log(`🔔 Auto-sync results: ${result.created} new doctors, ${result.updated} updated`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
      throw error;
    }
  }
}

module.exports = DoctorSyncService;