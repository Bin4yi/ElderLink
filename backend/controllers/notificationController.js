const { Notification } = require('../models');

const createNotification = async (userId, title, message, type = 'info', metadata = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      metadata
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      notifications: notifications.rows,
      totalCount: notifications.count,
      unreadCount: await Notification.count({
        where: { userId: req.user.id, isRead: false }
      })
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    await notification.update({ isRead: true });

    res.json({ 
      success: true,
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ 
      success: true,
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    await notification.destroy();

    res.json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({ 
      success: true,
      unreadCount 
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

module.exports = { 
  createNotification, 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};