import { initializeNotificationService } from '../services/NotificationService.js';
import User from '../models/User.js';

// Initialize notification service
const notificationService = initializeNotificationService();

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;
    
    const notifications = await notificationService.getUserNotifications(userId, parseInt(limit));
    
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;
    
    await notificationService.markAsRead(userId, notificationId);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all notifications for the user
    const notifications = await notificationService.getUserNotifications(userId, 100);
    
    // Mark each notification as read
    for (const notification of notifications) {
      if (!notification.isRead) {
        await notificationService.markAsRead(userId, notification.id);
      }
    }
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;
    
    await notificationService.deleteNotification(userId, notificationId);
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create notification
const createNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, title, message, data, link, sendEmail } = req.body;
    
    const notification = await notificationService.createNotification(userId, type, message, data, title, link);
    
    // If sendEmail is true, also send an email notification
    if (sendEmail) {
      const user = await User.findById(userId);
      if (user && user.email) {
        await notificationService.sendEmailNotification(
          userId,
          user.email,
          `Notification: ${message}`,
          `<p>You have a new notification:</p><p>${message}</p>`
        );
      }
    }
    
    res.status(201).json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification
};