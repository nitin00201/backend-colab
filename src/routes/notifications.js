import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification
} from '../controllers/NotificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Notification routes
router.get('/', getUserNotifications);
router.post('/', createNotification);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:notificationId/read', markNotificationAsRead);
router.delete('/:notificationId', deleteNotification);

export default router;