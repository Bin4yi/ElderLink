// backend/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    console.log('🔧 Initializing email transporter...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🌐 SMTP Host:', process.env.SMTP_HOST);

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify the connection
      this.verifyConnection();
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  /**
   * Send welcome email with temporary password
   */
  async sendWelcomeEmail(userDetails, tempPassword) {
    console.log('📧 Attempting to send welcome email to:', userDetails.email);
    
    const { firstName, lastName, email, role } = userDetails;
    
    const roleDisplayNames = {
      'doctor': '👨‍⚕️ Doctor',
      'staff': '👥 Care Staff',
      'elder': '👴 Elder',
      'pharmacist': '💊 Pharmacist',
      'mental_health_consultant': '🧠 Mental Health Consultant'
    };

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to ElderLink</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .password-box { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .password { font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace; letter-spacing: 2px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Welcome to ElderLink</h1>
        <p>Your account has been created</p>
    </div>
    
    <div class="content">
        <h2>Hello ${firstName} ${lastName}!</h2>
        
        <p>Welcome to the ElderLink system! Your account has been created with the role of <strong>${roleDisplayNames[role] || role}</strong>.</p>
        
        <h3>📧 Login Details:</h3>
        <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Role:</strong> ${roleDisplayNames[role] || role}</li>
            <li><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-portal">ElderLink Login</a></li>
        </ul>
        
        <div class="password-box">
            <h3>🔐 Your Temporary Password</h3>
            <div class="password">${tempPassword}</div>
        </div>
        
        <div class="warning">
            <h4>⚠️ Important Security Notice:</h4>
            <ul>
                <li>This is a temporary password that expires in 7 days</li>
                <li>You will be required to change your password on first login</li>
                <li>Please keep this password secure and do not share it</li>
                <li>If you don't login within 7 days, contact the administrator</li>
            </ul>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-portal" class="button">
                🚀 Login to ElderLink
            </a>
        </div>
        
        <h3>📋 What's Next?</h3>
        <ol>
            <li>Click the login button above or visit our website</li>
            <li>Enter your email and temporary password</li>
            <li>Set up your new secure password</li>
            <li>Complete your profile information</li>
            <li>Start using ElderLink to provide excellent care!</li>
        </ol>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
    </div>
    
    <div class="footer">
        <p>© 2025 ElderLink System. All rights reserved.</p>
        <p>This email was sent to ${email}. If you received this in error, please contact support.</p>
    </div>
</body>
</html>`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `🏥 Welcome to ElderLink - Your Account is Ready!`,
      html: emailTemplate
    };

    try {
      console.log('📤 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        envelope: info.envelope
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userDetails, resetToken) {
    const { firstName, lastName, email } = userDetails;
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset - ElderLink</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div class="content">
            <h2>Hello ${firstName} ${lastName}!</h2>
            
            <p>We received a request to reset your password for your ElderLink account.</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                    🔄 Reset Your Password
                </a>
            </div>
            
            <div class="warning">
                <h4>⚠️ Security Notice:</h4>
                <ul>
                    <li>This reset link expires in 1 hour</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your current password remains unchanged until you complete the reset</li>
                </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                ${resetUrl}
            </p>
        </div>
    </div>
</body>
</html>`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@elderlink.com',
      to: email,
      subject: '🔐 ElderLink Password Reset Request',
      html: emailTemplate
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Password reset email failed:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(recipientEmail) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'ElderLink Email Test',
      html: `
        <h2>🧪 Email Test Successful!</h2>
        <p>This is a test email from ElderLink system.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you received this email, the email configuration is working correctly!</p>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Test email failed:', error);
      throw error;
    }
  }

  /**
   * Send emergency alert email
   */
  async sendEmergencyAlert(options) {
    try {
      const {
        to,
        recipientName,
        elderName,
        elderPhone,
        location,
        timestamp,
        alertType,
        recipientRole
      } = options;

      const formattedTime = new Date(timestamp).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Format location
      let locationText = 'Location unavailable';
      if (location && location.available) {
        if (location.address && location.address.formattedAddress) {
          locationText = location.address.formattedAddress;
        } else if (location.latitude && location.longitude) {
          locationText = `Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
        }
      } else if (typeof location === 'string') {
        locationText = location;
      }

      // FIXED: Handle both 'family_member' and other roles
      const roleMessage = recipientRole === 'family_member' 
        ? 'You are receiving this alert as a family member.'
        : 'You are receiving this alert as an assigned caregiver.';

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@elderlink.com',
        to: to,
        subject: `🚨 EMERGENCY ALERT - ${elderName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background-color: #e74c3c;
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 5px 5px;
              }
              .alert-box {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                font-weight: bold;
                font-size: 16px;
              }
              .info-box {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
              }
              .info-box h3 {
                margin-top: 0;
                color: #495057;
              }
              .info-box ul {
                list-style: none;
                padding: 0;
                margin: 10px 0;
              }
              .info-box li {
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
              }
              .info-box li:last-child {
                border-bottom: none;
              }
              .info-box strong {
                display: inline-block;
                width: 120px;
                color: #6c757d;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #e74c3c;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
                padding: 20px;
              }
              .emergency-number {
                background-color: #d4edda;
                border: 2px solid #28a745;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
              }
              .emergency-number strong {
                color: #155724;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 EMERGENCY ALERT</h1>
              </div>
              <div class="content">
                <h2>Hello ${recipientName},</h2>
                
                <div class="alert-box">
                  ⚠️ IMMEDIATE ATTENTION REQUIRED
                </div>
                
                <p style="font-size: 16px;"><strong>${elderName}</strong> has triggered an emergency alert and needs immediate assistance.</p>
                
                <div class="info-box">
                  <h3>📋 Alert Details:</h3>
                  <ul>
                    <li><strong>Alert Type:</strong> ${alertType || 'SOS Button'}</li>
                    <li><strong>Time:</strong> ${formattedTime}</li>
                    <li><strong>Location:</strong> ${locationText}</li>
                    <li><strong>Elder Phone:</strong> ${elderPhone || 'Not available'}</li>
                  </ul>
                </div>
                
                <div class="emergency-number">
                  <strong>📞 If needed, call emergency services immediately: 911</strong>
                </div>
                
                <p style="color: #666; margin-top: 20px; font-size: 14px;">
                  ${roleMessage}
                </p>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
                    View Dashboard →
                  </a>
                </div>
                
                <p style="margin-top: 30px; color: #e74c3c; font-weight: bold; text-align: center;">
                  Please respond immediately or contact emergency services if needed.
                </p>
              </div>
              <div class="footer">
                <p>This is an automated emergency alert from ElderLink.</p>
                <p>For immediate assistance, call emergency services.</p>
                <p style="margin-top: 10px; color: #999;">
                  ElderLink Emergency System | ${new Date().getFullYear()}
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Emergency alert email sent to ${to}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending emergency alert email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generic send email method
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        console.error('❌ Email transporter not initialized');
        return { success: false, error: 'Email transporter not initialized' };
      }

      const mailOptions = {
        from: `"ElderLink" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: html || text,
        text: text || html?.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${subject}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();