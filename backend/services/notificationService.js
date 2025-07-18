const { Notification } = require('../models');

const NotificationService = {
  async createAppointmentNotification({ appointmentId, recipientId, type, title, message }) {
    // You can expand this logic as needed
    return Notification.create({
      appointmentId,
      userId: recipientId,
      type: type || 'info',
      title: title || 'Notification',
      message: message || ''
    });
  }
};

module.exports = NotificationService;