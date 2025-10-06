import express from 'express';
import { authenticate  } from '../middleware/auth.js';
import { getEmailConfigStatus, sendCustomEmail, sendEmailToUser } from '../controllers/EmailController.js';
import { sendDocumentUpdateNotification, sendInvitationEmail, sendTaskReminder, sendTeamMemberAdditionNotification } from '../utils/emailService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.post('/send',  sendCustomEmail);
router.post('/send/:userId',  sendEmailToUser);
router.post('/send/invite',sendInvitationEmail)
router.post('/send/new-addition',sendTeamMemberAdditionNotification)
router.post('/send/document-update',sendDocumentUpdateNotification)
router.post('/send/task-reminder',sendTaskReminder)



// Public routes (for checking email configuration)
router.get('/config', getEmailConfigStatus);

export default router;