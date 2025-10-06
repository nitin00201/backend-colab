import inngest from '../utils/inngest.js';

// Inngest function for deadline reminders
const sendDeadlineReminder = inngest.createFunction(
  { id: 'send-deadline-reminder' },
  { event: 'task.deadline.reminder' },
  async ({ event, step }) => {
    const { taskId, taskTitle, dueDate, userId, recipientEmail } = event.data;
    
    // Send reminder email
    const result = await step.run('send-reminder-email', async () => {
      // In a real implementation, you would send an actual email
      console.log(`Sending deadline reminder for task ${taskTitle} to user ${userId}`);
      return { success: true, messageId: `msg_${Date.now()}` };
    });
    
    return result;
  }
);

export default sendDeadlineReminder;