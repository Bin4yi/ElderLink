// backend/middleware/userHooks.js
const DoctorSyncService = require('../services/doctorSyncService');

// Middleware to handle automatic doctor sync when User table changes
class UserHooks {
  
  // Setup database hooks for automatic syncing
  static setupHooks(User) {
    
    // After user is created with role 'doctor'
    User.addHook('afterCreate', 'syncNewDoctor', async (user, options) => {
      if (user.role === 'doctor') {
        try {
          console.log(`🔄 Auto-syncing new doctor: ${user.firstName} ${user.lastName}`);
          await DoctorSyncService.syncNewDoctorFromUser(user.id);
        } catch (error) {
          console.error('❌ Error auto-syncing new doctor:', error);
          // Don't throw error to prevent user creation failure
        }
      }
    });
    
    // After user role is updated
    User.addHook('afterUpdate', 'syncDoctorRoleChange', async (user, options) => {
      if (options.fields.includes('role')) {
        try {
          const previousRole = user._previousDataValues.role;
          const currentRole = user.role;
          
          // User role changed TO doctor
          if (currentRole === 'doctor' && previousRole !== 'doctor') {
            console.log(`🔄 User role changed to doctor: ${user.firstName} ${user.lastName}`);
            await DoctorSyncService.syncNewDoctorFromUser(user.id);
          }
          
          // User role changed FROM doctor
          if (previousRole === 'doctor' && currentRole !== 'doctor') {
            console.log(`🗑️  User role changed from doctor: ${user.firstName} ${user.lastName}`);
            await DoctorSyncService.removeDoctorProfile(user.id);
          }
          
        } catch (error) {
          console.error('❌ Error handling doctor role change:', error);
          // Don't throw error to prevent user update failure
        }
      }
    });
    
    // After user is soft deleted
    User.addHook('afterUpdate', 'deactivateDoctor', async (user, options) => {
      if (options.fields.includes('isActive') && !user.isActive && user.role === 'doctor') {
        try {
          console.log(`🔒 Deactivating doctor profile: ${user.firstName} ${user.lastName}`);
          await DoctorSyncService.removeDoctorProfile(user.id);
        } catch (error) {
          console.error('❌ Error deactivating doctor:', error);
        }
      }
    });
    
    console.log('✅ User hooks for doctor sync setup complete');
  }
  
  // Express middleware to trigger sync after user operations
  static syncMiddleware() {
    return async (req, res, next) => {
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to check for doctor sync needs
      res.json = function(data) {
        // Check if this was a successful user creation/update with doctor role
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success && data.data) {
          const user = data.data;
          
          // If user has doctor role, trigger background sync
          if (user.role === 'doctor') {
            setImmediate(async () => {
              try {
                await DoctorSyncService.syncNewDoctorFromUser(user.id);
              } catch (error) {
                console.error('❌ Background doctor sync failed:', error);
              }
            });
          }
        }
        
        // Call original json method
        originalJson.call(this, data);
      };
      
      next();
    };
  }
  
  // Manual trigger for bulk sync
  static async triggerBulkSync() {
    try {
      console.log('🔄 Triggering bulk doctor sync...');
      const result = await DoctorSyncService.syncAllDoctorsFromUsers();
      console.log('✅ Bulk sync completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Bulk sync failed:', error);
      throw error;
    }
  }
}

module.exports = UserHooks;