// backend/routes/webhook.js - NEW FILE
const express = require('express');
const router = express.Router();

// QStash webhook handler for emergency alerts
router.post('/emergency', async (req, res) => {
  try {
    const alertData = req.body;
    
    console.log('🚨 EMERGENCY ALERT RECEIVED:', alertData);
    
    // Process the emergency alert
    const {
      alertId,
      timestamp,
      elder,
      location,
      assignedStaff
    } = alertData;
    
    // 1. Save to database (optional)
    // await EmergencyAlert.create(alertData);
    
    // 2. Send notifications to staff
    if (assignedStaff && assignedStaff.length > 0) {
      for (const staff of assignedStaff) {
        console.log(`📞 Notifying staff: ${staff.name} - ${staff.phone}`);
        
        // Send SMS, email, or push notification
        // await sendSMS(staff.phone, `EMERGENCY: ${elder.name} needs help!`);
        // await sendEmail(staff.email, 'Emergency Alert', alertData);
      }
    }
    
    // 3. Log the alert
    console.log(`✅ Emergency alert ${alertId} processed successfully`);
    
    // Respond to QStash
    res.status(200).json({
      success: true,
      message: 'Emergency alert processed',
      alertId: alertId
    });
    
  } catch (error) {
    console.error('❌ Emergency webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process emergency alert'
    });
  }
});

module.exports = router;