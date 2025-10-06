import redis from 'redis';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/emailService.js';
import Notification from '../models/Notification.js'; // Import the Notification model

// Notification service instance
let notificationService = null;

// Initialize Notification service
const initializeNotificationService = () => {
  if (notificationService) {
    return notificationService;
  }
  
  // Initialize Redis client
  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  });
  
  // Initialize the service
  const initialize = async () => {
    try {
      await redisClient.connect();
      logger.info('Connected to Redis for Notification service');
    } catch (error) {
      logger.error('Failed to initialize Notification service:', error);
    }
  };
  
  // Create a new notification and store in both Redis and MongoDB
  const createNotification = async (userId, type, message, data = {}, title = null, link = null) => {
    const notificationData = {
      userId,
      type,
      message,
      data,
      title,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Store notification in MongoDB for persistence
      const mongoNotification = new Notification(notificationData);
      await mongoNotification.save();
      
      // Also store in Redis for fast access
      try {
        // Ensure Redis client is connected
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }
        
        // Store notification in Redis
        await redisClient.lPush(`notifications:${userId}`, JSON.stringify({
          id: mongoNotification._id.toString(),
          ...notificationData
        }));
        
        // Publish event for real-time delivery
        await redisClient.publish('notifications', JSON.stringify({
          userId,
          notification: {
            id: mongoNotification._id.toString(),
            ...notificationData
          }
        }));
      } catch (redisError) {
        logger.error('Error storing notification in Redis:', redisError);
        // Don't fail the entire operation if Redis fails, MongoDB storage is the priority
      }
      
      return {
        id: mongoNotification._id.toString(),
        ...notificationData
      };
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  };
  
  // Get user notifications from MongoDB (with Redis as fallback)
  const getUserNotifications = async (userId, limit = 10) => {
    try {
      // Try to get notifications from MongoDB first
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
      
      // Convert to the expected format
      return notifications.map(notification => ({
        id: notification._id.toString(),
        userId: notification.userId.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        link: notification.link,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString()
      }));
    } catch (error) {
      logger.error('Error fetching notifications from MongoDB:', error);
      
      // Fallback to Redis if MongoDB fails
      try {
        // Ensure Redis client is connected
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }
        
        const redisNotifications = await redisClient.lRange(`notifications:${userId}`, 0, limit - 1);
        return redisNotifications.map(notification => JSON.parse(notification));
      } catch (redisError) {
        logger.error('Error fetching notifications from Redis:', redisError);
        throw error;
      }
    }
  };
  
  // Mark notification as read in both Redis and MongoDB
  const markAsRead = async (userId, notificationId) => {
    try {
      // Update in MongoDB
      const result = await Notification.updateOne(
        { _id: notificationId, userId: userId },
        { $set: { isRead: true, updatedAt: new Date() } }
      );
      
      if (result.modifiedCount === 0) {
        throw new Error('Notification not found or not owned by user');
      }
      
      // Also update in Redis if available
      try {
        // Ensure Redis client is connected
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }
        
        const notifications = await getUserNotifications(userId, 100);
        const updatedNotifications = notifications.map(notification => {
          if (notification.id === notificationId) {
            return { ...notification, isRead: true, updatedAt: new Date().toISOString() };
          }
          return notification;
        });
        
        // Clear and re-add notifications in Redis
        await redisClient.del(`notifications:${userId}`);
        for (const notification of updatedNotifications) {
          await redisClient.lPush(`notifications:${userId}`, JSON.stringify(notification));
        }
      } catch (redisError) {
        logger.error('Error updating notification in Redis:', redisError);
        // Don't fail the entire operation if Redis fails
      }
      
      return true;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  };
  
  // Delete notification from both Redis and MongoDB
  const deleteNotification = async (userId, notificationId) => {
    try {
      // Delete from MongoDB
      const result = await Notification.deleteOne({
        _id: notificationId,
        userId: userId
      });
      
      if (result.deletedCount === 0) {
        throw new Error('Notification not found or not owned by user');
      }
      
      // Also delete from Redis if available
      try {
        // Ensure Redis client is connected
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }
        
        const notifications = await getUserNotifications(userId, 100);
        const filteredNotifications = notifications.filter(
          notification => notification.id !== notificationId
        );
        
        // Clear and re-add notifications in Redis
        await redisClient.del(`notifications:${userId}`);
        for (const notification of filteredNotifications) {
          await redisClient.lPush(`notifications:${userId}`, JSON.stringify(notification));
        }
      } catch (redisError) {
        logger.error('Error deleting notification from Redis:', redisError);
        // Don't fail the entire operation if Redis fails
      }
      
      return true;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  };
  
  // Send email notification directly
  const sendEmailNotification = async (userId, email, subject, content) => {
    logger.info(`Sending email notification to user ${userId}: ${subject}`);
    
    try {
      // Send email directly using the email service
      await sendEmail({
        to: email,
        subject,
        html: content
      });
      
      return {
        userId,
        email,
        subject,
        content,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error sending email notification:', error);
      throw error;
    }
  };
  
  // Create the service object
  notificationService = {
    initialize,
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
    sendEmailNotification
  };
  
  return notificationService;
};

export { initializeNotificationService };