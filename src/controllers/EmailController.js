import { sendEmail } from '../utils/emailService.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';

// Send custom email
export const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, html, text, sendToAllUsers } = req.body;
    const sender = req.user;

    // Validate input
    if (!sendToAllUsers && (!to || !subject)) {
      return res.status(400).json({
        error: 'Either "to" and "subject" are required, or "sendToAllUsers" must be true',
      });
    }

    // Case 1: Send to all users
    if (sendToAllUsers) {
      const users = await User.find({}, 'email');
      const emailAddresses = users.map(u => u.email).filter(Boolean);

      if (emailAddresses.length === 0) {
        return res.status(400).json({ error: 'No users found to send emails to' });
      }

      const results = [];
      for (const email of emailAddresses) {
        try {
          const result = await sendEmail({ to: email, subject, html, text });
          results.push({ email, success: true, messageId: result.id });
        } catch (err) {
          logger.error(`Failed to send email to ${email}:`, err);
          results.push({ email, success: false, error: err.message });
        }
      }

      return res.json({
        message: `Email sent to ${results.filter(r => r.success).length} out of ${results.length} users`,
        results,
      });
    }

    // Case 2: Send to specific recipients
    const recipients = Array.isArray(to) ? to : [to];
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await sendEmail({ to: recipient, subject, html, text });
        results.push({ email: recipient, success: true, messageId: result.id });
      } catch (err) {
        logger.error(`Failed to send email to ${recipient}:`, err);
        results.push({ email: recipient, success: false, error: err.message });
      }
    }

    const successfulSends = results.filter(r => r.success).length;
    if (successfulSends === 0) {
      return res.status(500).json({
        error: 'Failed to send email to any recipients',
        results,
      });
    }

    res.json({
      message: `Email sent successfully to ${successfulSends} out of ${results.length} recipients`,
      results,
    });
  } catch (err) {
    logger.error('Error sending custom email:', err);
    res.status(500).json({ error: err.message });
  }
};

// Send email to a specific user by ID
export const sendEmailToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, html, text } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ error: 'User does not have an email address' });
    }

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });

    res.json({
      message: 'Email sent successfully',
      messageId: result.id,
      recipient: user.email,
    });
  } catch (err) {
    logger.error('Error sending email to user:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get email configuration status
export const getEmailConfigStatus = async (req, res) => {
  try {
    let configStatus = 'Not configured';
    let configType = null;

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      configStatus = 'Configured';
      configType = 'Gmail';
    } else if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD) {
      configStatus = 'Configured';
      configType = 'Outlook';
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      configStatus = 'Configured';
      configType = 'Custom SMTP';
    }

    res.json({
      status: configStatus,
      type: configType,
      fromEmail:
        process.env.FROM_EMAIL ||
        process.env.GMAIL_USER ||
        process.env.OUTLOOK_USER ||
        null,
    });
  } catch (err) {
    logger.error('Error getting email config status:', err);
    res.status(500).json({ error: err.message });
  }
};
