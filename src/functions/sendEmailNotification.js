import inngest from '../utils/inngest.js';
import { sendEmail } from '../utils/emailService.js';

// Inngest function for sending email notifications
const sendEmailNotification = inngest.createFunction(
  { id: 'send-email-notification' },
  { event: 'email/notification.send' },
  async ({ event, step }) => {
    const { userId, subject, content, email } = event.data;
    
    try {
      // Send the email using Nodemailer
      const result = await step.run('send-email', async () => {
        return await sendEmail({
          to: email,
          subject,
          html: content
        });
      });
      
      console.log(`Email sent successfully to user ${userId}`);
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error(`Failed to send email to user ${userId}:`, error);
      throw error;
    }
  }
);

export default sendEmailNotification;