import sendEmailNotification from './sendEmailNotification.js';
import handleTaskCreated from './handleTaskCreated.js';
import handleDocumentUpdated from './handleDocumentUpdated.js';
import handleChatMessage from './handleChatMessage.js';
import sendDeadlineReminder from './sendDeadlineReminder.js';

// Export all functions
export default [
  sendEmailNotification,
  handleTaskCreated,
  handleDocumentUpdated,
  handleChatMessage,
  sendDeadlineReminder
];