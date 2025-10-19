// backend/controllers/passwordResetController.js
const { User, PasswordResetOTP } = require('../models');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Request password reset - sends OTP to email
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('🔐 Password reset requested for:', email);

    // Check if user exists
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive an OTP shortly.'
      });
    }

    // Check for recent OTP requests (rate limiting - 1 request per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOTP = await PasswordResetOTP.findOne({
      where: {
        email: email.toLowerCase(),
        createdAt: { [Op.gte]: oneMinuteAgo }
      }
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 1 minute before requesting another OTP'
      });
    }

    // Invalidate any existing unused OTPs for this email
    await PasswordResetOTP.update(
      { isUsed: true },
      {
        where: {
          email: email.toLowerCase(),
          isUsed: false
        }
      }
    );

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await PasswordResetOTP.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      isUsed: false,
      attempts: 0
    });

    console.log(`✅ OTP generated for ${email}: ${otp} (expires at ${expiresAt})`);

    // Send OTP via email
    const emailResult = await emailService.sendPasswordResetOTP({
      to: email,
      name: `${user.firstName} ${user.lastName}`,
      otp
    });

    if (!emailResult.success) {
      console.error('❌ Failed to send OTP email:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }

    console.log('✅ Password reset OTP sent successfully to:', email);

    res.json({
      success: true,
      message: 'OTP has been sent to your email. Please check your inbox.',
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('❌ Error in requestPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: error.message
    });
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    console.log('🔍 Verifying OTP for:', email);

    // Find the OTP record
    const otpRecord = await PasswordResetOTP.findOne({
      where: {
        email: email.toLowerCase(),
        otp: otp.toString(),
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) {
      // Check if OTP exists but is expired or used
      const expiredOTP = await PasswordResetOTP.findOne({
        where: {
          email: email.toLowerCase(),
          otp: otp.toString()
        },
        order: [['createdAt', 'DESC']]
      });

      if (expiredOTP) {
        if (expiredOTP.isUsed) {
          return res.status(400).json({
            success: false,
            message: 'This OTP has already been used. Please request a new one.'
          });
        }
        if (expiredOTP.expiresAt < new Date()) {
          return res.status(400).json({
            success: false,
            message: 'This OTP has expired. Please request a new one.'
          });
        }
      }

      // Increment failed attempts
      await PasswordResetOTP.increment('attempts', {
        where: {
          email: email.toLowerCase(),
          isUsed: false
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Check max attempts (5 attempts allowed)
    if (otpRecord.attempts >= 5) {
      await otpRecord.update({ isUsed: true });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    console.log('✅ OTP verified successfully for:', email);

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      resetToken: otpRecord.id // Use OTP record ID as reset token
    });

  } catch (error) {
    console.error('❌ Error in verifyOTP:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying OTP',
      error: error.message
    });
  }
};

/**
 * Reset password with verified OTP
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log('🔐 Resetting password for:', email);

    // Verify OTP one more time
    const otpRecord = await PasswordResetOTP.findOne({
      where: {
        email: email.toLowerCase(),
        otp: otp.toString(),
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user password (the User model hook will hash it automatically)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password updated in database for:', email);

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    // Invalidate all other OTPs for this email
    await PasswordResetOTP.update(
      { isUsed: true },
      {
        where: {
          email: email.toLowerCase(),
          id: { [Op.ne]: otpRecord.id },
          isUsed: false
        }
      }
    );

    console.log('✅ Password reset successfully for:', email);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Error in resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password',
      error: error.message
    });
  }
};

/**
 * Clean up expired OTPs (can be run as a cron job)
 */
const cleanupExpiredOTPs = async (req, res) => {
  try {
    const deleted = await PasswordResetOTP.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() }
      }
    });

    console.log(`🗑️ Cleaned up ${deleted} expired OTP records`);

    if (res) {
      res.json({
        success: true,
        message: `Cleaned up ${deleted} expired OTP records`
      });
    }

    return deleted;
  } catch (error) {
    console.error('❌ Error in cleanupExpiredOTPs:', error);
    if (res) {
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup expired OTPs',
        error: error.message
      });
    }
  }
};

module.exports = {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  cleanupExpiredOTPs
};
