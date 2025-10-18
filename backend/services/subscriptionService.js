// backend/services/subscriptionService.js
const { Subscription, User, Elder } = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer').default || require('nodemailer');

// Configure email transporter - only if EMAIL_USER is configured
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/**
 * Check for expiring subscriptions and send reminder emails
 */
const checkExpiringSubscriptions = async () => {
  try {
    console.log('🔍 Checking for expiring subscriptions...');
    
    const today = new Date();
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    
    // Find subscriptions expiring in 5 days
    const expiringSubscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        endDate: {
          [Op.between]: [
            new Date(fiveDaysFromNow.setHours(0, 0, 0, 0)),
            new Date(fiveDaysFromNow.setHours(23, 59, 59, 999))
          ]
        },
        reminderSent: {
          [Op.or]: [null, false]
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    console.log(`📧 Found ${expiringSubscriptions.length} subscriptions expiring in 5 days`);

    for (const subscription of expiringSubscriptions) {
      await sendExpirationReminderEmail(subscription);
      
      // Mark reminder as sent
      await subscription.update({ reminderSent: true });
    }

    return {
      success: true,
      count: expiringSubscriptions.length
    };
  } catch (error) {
    console.error('❌ Error checking expiring subscriptions:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send expiration reminder email
 */
const sendExpirationReminderEmail = async (subscription) => {
  try {
    const user = subscription.user;
    const elder = subscription.elder;
    const daysRemaining = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    const elderName = elder 
      ? `${elder.firstName} ${elder.lastName}` 
      : 'your assigned elder';

    const mailOptions = {
      from: `"ElderLink" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '⚠️ Your ElderLink Subscription is Expiring Soon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%); 
                     color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
            .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; 
                          padding: 15px; margin: 20px 0; border-radius: 5px; }
            .info-row { display: flex; justify-content: space-between; 
                       padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .btn { display: inline-block; background: #ef4444; color: white; 
                  padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                  margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⚠️ Subscription Expiring Soon</h1>
            </div>
            <div class="content">
              <p>Dear ${user.firstName},</p>
              
              <div class="warning-box">
                <strong>Your ElderLink subscription will expire in ${daysRemaining} days!</strong>
              </div>

              <p>Your subscription for caring for <strong>${elderName}</strong> is set to expire soon.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Subscription Details:</h3>
                <div class="info-row">
                  <span>Plan:</span>
                  <strong>${subscription.plan.toUpperCase()}</strong>
                </div>
                <div class="info-row">
                  <span>Expiration Date:</span>
                  <strong>${new Date(subscription.endDate).toLocaleDateString()}</strong>
                </div>
                <div class="info-row">
                  <span>Days Remaining:</span>
                  <strong style="color: #f59e0b;">${daysRemaining} days</strong>
                </div>
                ${elder ? `
                <div class="info-row">
                  <span>Elder:</span>
                  <strong>${elder.firstName} ${elder.lastName}</strong>
                </div>
                ` : ''}
              </div>

              <p><strong>What happens when your subscription expires?</strong></p>
              <ul>
                <li>❌ Health monitoring will be paused</li>
                <li>❌ Emergency alerts will be disabled</li>
                <li>❌ Access to health reports will be restricted</li>
                <li>❌ Medication reminders will stop</li>
              </ul>

              <p><strong>Don't let your care be interrupted!</strong></p>
              <p>Renew your subscription today to ensure continuous care for your loved one.</p>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/family/subscriptions" class="btn">
                  Renew Subscription Now
                </a>
              </div>

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </div>
            <div class="footer">
              <p>ElderLink - Caring for Your Loved Ones</p>
              <p style="font-size: 12px;">
                This is an automated reminder. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    if (!transporter) {
      console.log('⚠️ Email not configured. Skipping reminder email to', user.email);
      return { success: true, skipped: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Expiration reminder sent to ${user.email}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending reminder email to ${subscription.user.email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Expire subscriptions that have passed their end date
 */
const expireSubscriptions = async () => {
  try {
    console.log('🔍 Checking for expired subscriptions...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredSubscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        endDate: {
          [Op.lt]: today
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    console.log(`❌ Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const subscription of expiredSubscriptions) {
      await subscription.update({ status: 'expired' });
      await sendExpirationNotificationEmail(subscription);
      console.log(`❌ Subscription ${subscription.id} marked as expired`);
    }

    return {
      success: true,
      count: expiredSubscriptions.length
    };
  } catch (error) {
    console.error('❌ Error expiring subscriptions:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send expiration notification email
 */
const sendExpirationNotificationEmail = async (subscription) => {
  try {
    const user = subscription.user;
    const elder = subscription.elder;

    const elderName = elder 
      ? `${elder.firstName} ${elder.lastName}` 
      : 'your assigned elder';

    const mailOptions = {
      from: `"ElderLink" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '❌ Your ElderLink Subscription Has Expired',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
                     color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
            .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; 
                        padding: 15px; margin: 20px 0; border-radius: 5px; }
            .btn { display: inline-block; background: #ef4444; color: white; 
                  padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                  margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">❌ Subscription Expired</h1>
            </div>
            <div class="content">
              <p>Dear ${user.firstName},</p>
              
              <div class="alert-box">
                <strong>Your ElderLink subscription has expired.</strong>
              </div>

              <p>Your subscription for caring for <strong>${elderName}</strong> expired on 
              <strong>${new Date(subscription.endDate).toLocaleDateString()}</strong>.</p>

              <p><strong>Services Currently Paused:</strong></p>
              <ul>
                <li>❌ Health monitoring</li>
                <li>❌ Emergency alerts</li>
                <li>❌ Health reports access</li>
                <li>❌ Medication reminders</li>
                <li>❌ Video consultations</li>
              </ul>

              <p><strong>Renew now to restore full access and continue caring for your loved one.</strong></p>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/family/subscriptions" class="btn">
                  Renew Subscription
                </a>
              </div>

              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Need help? Contact our support team at support@elderlink.com
              </p>
            </div>
            <div class="footer">
              <p>ElderLink - Caring for Your Loved Ones</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    if (!transporter) {
      console.log('⚠️ Email not configured. Skipping expiration notification to', user.email);
      return { success: true, skipped: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Expiration notification sent to ${user.email}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending expiration email to ${subscription.user.email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get subscription statistics
 */
const getSubscriptionStats = async (userId) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId },
      include: [{ model: Elder, as: 'elder' }]
    });

    const active = subscriptions.filter(s => s.status === 'active').length;
    const expired = subscriptions.filter(s => s.status === 'expired').length;
    const expiringSoon = subscriptions.filter(s => {
      if (s.status !== 'active') return false;
      const daysRemaining = Math.ceil((new Date(s.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 5 && daysRemaining > 0;
    }).length;

    return {
      total: subscriptions.length,
      active,
      expired,
      expiringSoon,
      subscriptions
    };
  } catch (error) {
    console.error('❌ Error getting subscription stats:', error);
    throw error;
  }
};

module.exports = {
  checkExpiringSubscriptions,
  expireSubscriptions,
  sendExpirationReminderEmail,
  sendExpirationNotificationEmail,
  getSubscriptionStats
};
