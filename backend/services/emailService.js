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
      console.error('❌ Email service connection failed:', error.message);
      console.warn('⚠️  Email functionality will be disabled. Server will continue without email service.');
      // Don't throw error - allow server to start without email
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
   * Send appointment confirmation email to family member
   */
  async sendAppointmentConfirmationEmail(appointmentDetails) {
    console.log('📧 Attempting to send appointment confirmation email');
    
    const {
      familyMemberEmail,
      familyMemberName,
      elderName,
      doctorName,
      appointmentDate,
      appointmentTime,
      reason,
      type,
      duration,
      zoomJoinUrl
    } = appointmentDetails;

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Appointment Confirmation - ElderLink</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-card { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-label { font-weight: bold; color: #667eea; width: 40%; }
        .detail-value { width: 60%; }
        .zoom-button { display: inline-block; background: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Appointment Confirmed!</h1>
        <p>Your appointment has been successfully scheduled</p>
    </div>
    
    <div class="content">
        <h2>Hello ${familyMemberName}!</h2>
        
        <p>Great news! An appointment has been scheduled for <strong>${elderName}</strong>.</p>
        
        <div class="appointment-card">
            <h3 style="color: #667eea; margin-top: 0;">📅 Appointment Details</h3>
            
            <div class="detail-row">
                <div class="detail-label">👤 Patient:</div>
                <div class="detail-value">${elderName}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">👨‍⚕️ Doctor:</div>
                <div class="detail-value">Dr. ${doctorName}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">📅 Date:</div>
                <div class="detail-value">${appointmentDate}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">🕐 Time:</div>
                <div class="detail-value">${appointmentTime}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">⏱️ Duration:</div>
                <div class="detail-value">${duration} minutes</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">📋 Type:</div>
                <div class="detail-value" style="text-transform: capitalize;">${type}</div>
            </div>
            
            <div class="detail-row" style="border-bottom: none;">
                <div class="detail-label">💬 Reason:</div>
                <div class="detail-value">${reason}</div>
            </div>
        </div>
        
        ${zoomJoinUrl ? `
        <div style="text-align: center; margin: 30px 0;">
            <p><strong>🎥 This is a Virtual Appointment</strong></p>
            <a href="${zoomJoinUrl}" class="zoom-button">
                Join Video Call
            </a>
            <p style="font-size: 12px; color: #666;">Click the button above to join the video consultation at the scheduled time</p>
        </div>
        ` : `
        <div class="info-box">
            <strong>📍 In-Person Appointment</strong><br>
            Please arrive 10 minutes before your scheduled time.
        </div>
        `}
        
        <div class="info-box">
            <strong>⚠️ Important Reminders:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Your appointment is currently <strong>pending approval</strong> by the doctor</li>
                <li>You will receive a notification once the doctor confirms</li>
                <li>Please keep this email for your records</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            </ul>
        </div>
        
        <h3>📱 What's Next?</h3>
        <ol>
            <li>Wait for doctor confirmation (you'll receive an email)</li>
            <li>Prepare any medical records or questions</li>
            <li>Join the consultation at the scheduled time</li>
        </ol>
        
        <p>You can view and manage your appointments in the ElderLink app.</p>
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br><strong>ElderLink Health Team</strong></p>
    </div>
    
    <div class="footer">
        <p>© 2025 ElderLink System. All rights reserved.</p>
        <p>This email was sent to ${familyMemberEmail}</p>
        <p>If you didn't book this appointment, please contact support immediately.</p>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: familyMemberEmail,
      subject: `✅ Appointment Confirmed for ${elderName} - ${appointmentDate}`,
      html: emailTemplate
    };

    try {
      console.log('📤 Sending appointment confirmation email to:', familyMemberEmail);

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Appointment confirmation email sent successfully:', {
        messageId: info.messageId,
        to: familyMemberEmail
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Appointment confirmation email failed:', {
        error: error.message,
        to: familyMemberEmail
      });
      // Don't throw error - appointment should still be created even if email fails
      return { success: false, error: error.message };
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
   * Send health alert email to family members
   */
  async sendHealthAlertEmail(options) {
    try {
      const {
        to,
        recipientName,
        elderName,
        alertType,
        severity,
        message,
        triggerValue,
        normalRange,
        timestamp
      } = options;

      const formattedTime = new Date(timestamp).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Severity colors and icons
      const severityConfig = {
        critical: { color: '#dc3545', icon: '🚨', bgColor: '#f8d7da', label: 'CRITICAL' },
        high: { color: '#fd7e14', icon: '⚠️', bgColor: '#ffe5d0', label: 'HIGH' },
        medium: { color: '#ffc107', icon: '⚡', bgColor: '#fff3cd', label: 'MEDIUM' },
        low: { color: '#17a2b8', icon: 'ℹ️', bgColor: '#d1ecf1', label: 'LOW' }
      };

      const config = severityConfig[severity] || severityConfig.medium;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@elderlink.com',
        to: to,
        subject: `${config.icon} Health Alert - ${elderName} [${config.label}]`,
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
                background-color: ${config.color};
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .severity-badge {
                display: inline-block;
                padding: 8px 16px;
                background-color: rgba(255,255,255,0.2);
                border-radius: 20px;
                margin-top: 10px;
                font-weight: bold;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 5px 5px;
              }
              .alert-box {
                background-color: ${config.bgColor};
                border-left: 4px solid ${config.color};
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
              }
              .alert-box h3 {
                margin-top: 0;
                color: ${config.color};
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #e9ecef;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                font-weight: bold;
                color: #6c757d;
              }
              .info-value {
                color: #495057;
                text-align: right;
              }
              .vital-reading {
                background-color: #f8f9fa;
                border: 2px solid ${config.color};
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
              }
              .vital-reading .value {
                font-size: 32px;
                font-weight: bold;
                color: ${config.color};
                margin: 10px 0;
              }
              .vital-reading .normal {
                color: #6c757d;
                font-size: 14px;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: ${config.color};
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
              .action-required {
                background-color: #fff3cd;
                border: 2px solid #ffc107;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${config.icon} Health Alert</h1>
                <div class="severity-badge">${config.label} PRIORITY</div>
              </div>
              <div class="content">
                <h2>Dear ${recipientName},</h2>
                
                <p style="font-size: 16px;">This is an automated health alert regarding <strong>${elderName}</strong>.</p>
                
                <div class="alert-box">
                  <h3>${message}</h3>
                  <div class="info-row">
                    <span class="info-label">Alert Time:</span>
                    <span class="info-value">${formattedTime}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Alert Type:</span>
                    <span class="info-value">${alertType.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                
                <div class="vital-reading">
                  <h3 style="margin-top: 0; color: #495057;">Current Reading</h3>
                  <div class="value">${triggerValue}</div>
                  <div class="normal">Normal Range: ${normalRange}</div>
                </div>
                
                ${severity === 'critical' || severity === 'high' ? `
                  <div class="action-required">
                    <strong>⚠️ IMMEDIATE ATTENTION RECOMMENDED</strong>
                    <p style="margin: 10px 0;">Please contact ${elderName} or their caregiver immediately to ensure they receive appropriate care.</p>
                  </div>
                ` : ''}
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h4 style="margin-top: 0;">📋 Recommended Actions:</h4>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    ${severity === 'critical' ? `
                      <li>Contact ${elderName} immediately</li>
                      <li>Consider calling emergency services if needed</li>
                      <li>Notify the assigned healthcare provider</li>
                    ` : severity === 'high' ? `
                      <li>Check in with ${elderName} as soon as possible</li>
                      <li>Monitor their condition closely</li>
                      <li>Contact healthcare provider if condition worsens</li>
                    ` : `
                      <li>Keep monitoring the situation</li>
                      <li>Check in with ${elderName} when convenient</li>
                      <li>Note any changes in their condition</li>
                    `}
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/family/health-monitoring" class="button">
                    View Health Records →
                  </a>
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  You are receiving this alert as a family member of ${elderName}. The assigned healthcare team has also been notified.
                </p>
              </div>
              <div class="footer">
                <p>This is an automated health monitoring alert from ElderLink.</p>
                <p style="margin-top: 10px; color: #999;">
                  ElderLink Health Monitoring System | ${new Date().getFullYear()}
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Health alert email sent to ${to}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending health alert email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send prescription bill email to family member
   */
  async sendPrescriptionBillEmail({ to, familyMemberName, elderName, prescriptionNumber, doctorName, items, totalAmount, status }) {
    console.log('📧 Attempting to send prescription bill email to:', to);
    
    // Generate items list HTML
    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong>
          ${item.status === 'out_of_stock' ? '<br><span style="color: #ef4444; font-size: 12px;">⚠️ Out of Stock</span>' : ''}
          ${item.status === 'partially_filled' ? '<br><span style="color: #f59e0b; font-size: 12px;">⚠️ Partially Filled</span>' : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 0}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">LKR ${parseFloat(item.unitPrice || 0).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>LKR ${parseFloat(item.total || 0).toFixed(2)}</strong></td>
      </tr>
    `).join('');

    const statusBadge = status === 'filled' 
      ? '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Filled</span>'
      : '<span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Partially Filled</span>';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
          .total-row { background: #f9fafb; font-size: 18px; }
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">💊 Prescription Bill Ready</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Prescription #${prescriptionNumber}</p>
          </div>
          
          <div class="content">
            <p>Dear ${familyMemberName},</p>
            
            <p>The prescription for <strong>${elderName}</strong> has been processed by our pharmacy. Below are the details and total bill amount:</p>
            
            <div class="info-box">
              <p style="margin: 5px 0;"><strong>Prescription Number:</strong> ${prescriptionNumber}</p>
              <p style="margin: 5px 0;"><strong>Prescribed By:</strong> ${doctorName}</p>
              <p style="margin: 5px 0;"><strong>Patient:</strong> ${elderName}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${statusBadge}</p>
            </div>

            <h2 style="color: #667eea; margin-top: 30px;">Itemized Bill</h2>
            
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right;"><strong>Total Amount:</strong></td>
                  <td style="padding: 15px; text-align: right;"><strong style="color: #667eea; font-size: 20px;">LKR ${parseFloat(totalAmount).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>

            ${status === 'partially_filled' ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e;"><strong>⚠️ Note:</strong> Some medications were out of stock or partially filled. Please contact the pharmacy for alternatives or to arrange a later pickup for remaining items.</p>
              </div>
            ` : ''}

            <p style="margin-top: 30px;">Please contact us if you have any questions about this bill or would like to arrange for home delivery.</p>

            <p style="margin-top: 20px;">
              <strong>Thank you for choosing ElderLink!</strong><br>
              Your loved one's health is our priority.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">This is an automated email from ElderLink Pharmacy Services</p>
            <p style="margin: 5px 0;">If you have questions, please contact our support team</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ElderLink. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `Prescription Bill Ready - ${prescriptionNumber} for ${elderName}`;

    try {
      if (!this.transporter) {
        console.error('❌ Email transporter not initialized');
        return { success: false, error: 'Email transporter not initialized' };
      }

      const mailOptions = {
        from: `"ElderLink Pharmacy" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Prescription bill email sent to ${to} for ${elderName}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending prescription bill email:', error);
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

  /**
   * Send Zoom meeting link to family member
   * @param {Object} emailData - Email configuration
   */
  async sendZoomLinkToFamily(emailData) {
    try {
      const {
        to, // Family member email
        familyMemberName,
        elderName,
        doctorName,
        sessionDate,
        sessionTime,
        zoomJoinUrl,
        zoomPassword,
        duration
      } = emailData;

      const html = this.getZoomEmailTemplate({
        familyMemberName,
        elderName,
        doctorName,
        sessionDate,
        sessionTime,
        zoomJoinUrl,
        zoomPassword,
        duration
      });

      const result = await this.sendEmail({
        to,
        subject: `Monthly Health Session Scheduled - ${elderName}`,
        html
      });

      console.log('✅ Zoom link email sent successfully to:', to);
      return result;
    } catch (error) {
      console.error('❌ Error sending Zoom link email:', error.message);
      throw new Error('Failed to send Zoom link email: ' + error.message);
    }
  }

  /**
   * Send session completion notification with prescription details
   * @param {Object} emailData - Completion email data
   */
  async sendSessionCompletionEmail(emailData) {
    try {
      const {
        to,
        familyMemberName,
        elderName,
        doctorName,
        sessionDate,
        doctorNotes,
        prescriptionDetails,
        pharmacyName,
        nextSessionDate
      } = emailData;

      const html = this.getCompletionEmailTemplate({
        familyMemberName,
        elderName,
        doctorName,
        sessionDate,
        doctorNotes,
        prescriptionDetails,
        pharmacyName,
        nextSessionDate
      });

      const result = await this.sendEmail({
        to,
        subject: `Session Completed - ${elderName}`,
        html
      });

      console.log('✅ Completion email sent:', to);
      return result;
    } catch (error) {
      console.error('❌ Error sending completion email:', error.message);
      throw error;
    }
  }

  /**
   * HTML template for Zoom meeting invitation
   */
  getZoomEmailTemplate(data) {
    const {
      familyMemberName,
      elderName,
      doctorName,
      sessionDate,
      sessionTime,
      zoomJoinUrl,
      zoomPassword,
      duration
    } = data;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .session-details {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .detail-row {
      margin: 10px 0;
      display: flex;
      align-items: center;
    }
    .detail-label {
      font-weight: bold;
      color: #555;
      min-width: 120px;
    }
    .detail-value {
      color: #333;
    }
    .zoom-button {
      display: inline-block;
      background: #2d8cff;
      color: white !important;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .zoom-button:hover {
      background: #1a73e8;
    }
    .password-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      text-align: center;
    }
    .password-value {
      font-size: 24px;
      font-weight: bold;
      color: #856404;
      letter-spacing: 3px;
    }
    .instructions {
      background: #e7f3ff;
      border-left: 4px solid #2d8cff;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Monthly Health Session</h1>
      <p>Video Meeting Scheduled</p>
    </div>
    
    <div class="content">
      <p>Dear ${familyMemberName},</p>
      
      <p>A monthly health monitoring session has been scheduled for <strong>${elderName}</strong>.</p>
      
      <div class="session-details">
        <div class="detail-row">
          <span class="detail-label">👨‍⚕️ Doctor:</span>
          <span class="detail-value">Dr. ${doctorName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👴 Patient:</span>
          <span class="detail-value">${elderName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Date:</span>
          <span class="detail-value">${sessionDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏰ Time:</span>
          <span class="detail-value">${sessionTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏱️ Duration:</span>
          <span class="detail-value">${duration} minutes</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${zoomJoinUrl}" class="zoom-button">
          📹 Join Zoom Meeting
        </a>
      </div>

      <div class="password-box">
        <p style="margin: 0 0 10px 0; font-weight: bold;">🔐 Meeting Password:</p>
        <div class="password-value">${zoomPassword}</div>
      </div>

      <div class="instructions">
        <h3 style="margin-top: 0;">📝 Instructions:</h3>
        <ol style="padding-left: 20px;">
          <li>Click the "Join Zoom Meeting" button 5-10 minutes before the scheduled time</li>
          <li>Enter the meeting password when prompted: <strong>${zoomPassword}</strong></li>
          <li>Make sure ${elderName} is comfortable and in a quiet environment</li>
          <li>Have a list of any questions or concerns ready to discuss</li>
          <li>Ensure good lighting and internet connection</li>
        </ol>
      </div>

      <p><strong>💡 Tips for a successful session:</strong></p>
      <ul>
        <li>Test your camera and microphone before the meeting</li>
        <li>Have ${elderName}'s medications list ready</li>
        <li>Note any recent health changes or concerns</li>
        <li>Keep a pen and paper to take notes</li>
      </ul>

      <p style="margin-top: 30px;">If you need to reschedule or have any questions, please contact us through the ElderLink app.</p>

      <p>Best regards,<br><strong>ElderLink Health Team</strong></p>
    </div>

    <div class="footer">
      <p>This is an automated message from ElderLink Health System</p>
      <p>📱 Download the ElderLink app for easier access to meetings</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * HTML template for session completion email
   */
  getCompletionEmailTemplate(data) {
    const {
      familyMemberName,
      elderName,
      doctorName,
      sessionDate,
      doctorNotes,
      prescriptionDetails,
      pharmacyName,
      nextSessionDate
    } = data;

    const prescriptionHTML = prescriptionDetails ? `
      <div class="session-details">
        <h3>💊 Prescription Details:</h3>
        <p><strong>Pharmacy:</strong> ${pharmacyName}</p>
        <p>${prescriptionDetails}</p>
        <p style="color: #856404; background: #fff3cd; padding: 10px; border-radius: 4px;">
          📋 Your prescription has been sent to ${pharmacyName}. They will notify you when it's ready for pickup or delivery.
        </p>
      </div>
    ` : '';

    const nextSessionHTML = nextSessionDate ? `
      <div style="background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📅 Next Monthly Session:</strong> ${nextSessionDate}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px;">You will receive a Zoom link 24 hours before the session.</p>
      </div>
    ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; }
    .session-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Session Completed</h1>
    </div>
    <div class="content">
      <p>Dear ${familyMemberName},</p>
      <p>The monthly health session for <strong>${elderName}</strong> with Dr. ${doctorName} has been completed successfully.</p>
      
      <div class="session-details">
        <p><strong>📅 Session Date:</strong> ${sessionDate}</p>
        <p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
        ${doctorNotes ? `<p><strong>📝 Doctor's Notes:</strong><br>${doctorNotes}</p>` : ''}
      </div>

      ${prescriptionHTML}
      ${nextSessionHTML}

      <p>You can view the full session details and records in your ElderLink app.</p>
      <p>Best regards,<br><strong>ElderLink Health Team</strong></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send password reset OTP email
   */
  async sendPasswordResetOTP({ to, name, otp }) {
    console.log('📧 Attempting to send password reset OTP to:', to);
    
    try {
      const mailOptions = {
        from: `"ElderLink Support" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '🔐 Password Reset OTP - ElderLink',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: #f4f4f4; }
        .container { background: white; margin: 20px; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; padding: 30px; margin: 30px 0; text-align: center; }
        .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        ul { padding-left: 20px; }
        ul li { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>ElderLink Security</p>
        </div>
        
        <div class="content">
            <h2>Hello ${name || 'User'}!</h2>
            
            <p>We received a request to reset your password for your ElderLink account. Use the OTP code below to proceed with resetting your password.</p>
            
            <div class="otp-box">
                <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your One-Time Password</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 14px; opacity: 0.8;">⏱️ Valid for 10 minutes</p>
            </div>
            
            <div class="info-box">
                <strong>📝 How to use this OTP:</strong>
                <ol>
                    <li>Go to the password reset page</li>
                    <li>Enter this 6-digit OTP code</li>
                    <li>Create your new password</li>
                    <li>Login with your new credentials</li>
                </ol>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This OTP is valid for only <strong>10 minutes</strong></li>
                    <li>Never share this OTP with anyone</li>
                    <li>ElderLink staff will never ask for your OTP</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>
            
            <p style="margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>ElderLink Security Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>ElderLink - Comprehensive Elder Care Platform</strong></p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p style="margin-top: 10px; color: #999;">
                © ${new Date().getFullYear()} ElderLink. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset OTP email sent successfully to ${to}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending password reset OTP email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();