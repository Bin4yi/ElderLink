const { User, Elder, Subscription } = require('../models'); // FIXED: Import from models directory
const bcrypt = require('bcryptjs');

class ElderAuthService {
  // Create login credentials for an elder
  static async createElderLogin(elderId, username, password) {
    try {
      const elder = await Elder.findByPk(elderId);
      if (!elder) {
        throw new Error('Elder not found');
      }

      // Check if username already exists
      const existingUser = await User.findOne({ where: { email: username } });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Create user account for elder
      const user = await User.create({
        firstName: elder.firstName,
        lastName: elder.lastName,
        email: username, // Use username as email
        password: password,
        phone: elder.phone,
        role: 'elder',
        isActive: true
      });

      // Update elder with user association and username
      await elder.update({
        userId: user.id,
        username: username,
        hasLoginAccess: true
      });

      return { user, elder };
    } catch (error) {
      throw error;
    }
  }

  // Enable/disable elder login access
  static async toggleElderAccess(elderId, hasAccess) {
    try {
      const elder = await Elder.findByPk(elderId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!elder) {
        throw new Error('Elder not found');
      }

      await elder.update({ hasLoginAccess: hasAccess });

      if (elder.user) {
        await elder.user.update({ isActive: hasAccess });
      }

      return elder;
    } catch (error) {
      throw error;
    }
  }

  // Get elder by user ID
  static async getElderByUserId(userId) {
    try {
      console.log('🔍 ElderAuthService: Getting elder for userId:', userId);
      
      const elder = await Elder.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive']
          },
          {
            model: Subscription, // FIXED: Now properly imported
            as: 'subscription',
            attributes: ['id', 'plan', 'status', 'startDate', 'endDate', 'amount']
          }
        ]
      });

      console.log('🔍 ElderAuthService: Found elder:', elder ? 'Yes' : 'No');
      if (elder) {
        console.log('🔍 Elder details:', {
          id: elder.id,
          name: `${elder.firstName} ${elder.lastName}`,
          hasUser: !!elder.user,
          hasSubscription: !!elder.subscription
        });
      }

      return elder;
    } catch (error) {
      console.error('❌ ElderAuthService getElderByUserId error:', error);
      throw error;
    }
  }
}

module.exports = ElderAuthService;