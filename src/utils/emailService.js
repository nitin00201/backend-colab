import nodemailer from 'nodemailer';

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Create transporter for each email send to ensure fresh configuration
    let transporter;
    
    // Check if we should use Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    }
    // Check if we should use Outlook
    else if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD) {
      transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.OUTLOOK_USER,
          pass: process.env.OUTLOOK_PASSWORD,
        },
      });
    }
    // Default to a basic SMTP configuration if available
    else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      throw new Error('No email configuration found. Please set up Gmail, Outlook, or SMTP environment variables.');
    }
    
    const fromEmail = process.env.FROM_EMAIL || process.env.GMAIL_USER || process.env.OUTLOOK_USER || 'no-reply@example.com';
    
    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      html,
      text,
    };
    
    // Verify connection configuration
    await transporter.verify();
    
    const info = await transporter.sendMail(mailOptions);
    return {
      id: info.messageId,
      data: info,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send task reminder email
export const sendTaskReminder = async ({ userId, taskId, taskTitle, dueDate, recipientEmail }) => {
  const subject = `Task Reminder: ${taskTitle}`;
  const html = `
    <h2>Task Reminder</h2>
    <p>This is a reminder for your task:</p>
    <ul>
      <li><strong>Task:</strong> ${taskTitle}</li>
      <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleString()}</li>
      <li><strong>Task ID:</strong> ${taskId}</li>
    </ul>
    <p>Please complete this task before the deadline.</p>
  `;
  
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
};

// Send document update notification
export const sendDocumentUpdateNotification = async ({ userId, documentId, documentTitle, updaterName, recipientEmail }) => {
  const subject = `Document Updated: ${documentTitle}`;
  const html = `
    <h2>Document Updated</h2>
    <p>A document you're collaborating on has been updated:</p>
    <ul>
      <li><strong>Document:</strong> ${documentTitle}</li>
      <li><strong>Updated by:</strong> ${updaterName}</li>
      <li><strong>Document ID:</strong> ${documentId}</li>
    </ul>
    <p>Please review the changes.</p>
  `;
  
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
};

// Send chat message notification
export const sendChatMessageNotification = async ({ userId, roomId, message, senderName, recipientEmail }) => {
  const subject = `New Chat Message from ${senderName}`;
  const html = `
    <h2>New Chat Message</h2>
    <p>You have a new message in chat:</p>
    <ul>
      <li><strong>From:</strong> ${senderName}</li>
      <li><strong>Message:</strong> ${message}</li>
      <li><strong>Room ID:</strong> ${roomId}</li>
    </ul>
  `;
  
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
};

// Send team member addition notification
export const sendTeamMemberAdditionNotification = async ({ userId, teamId, teamName, addedByName, recipientEmail, role }) => {
  const subject = `You've been added to team: ${teamName}`;
  const html = `
    <h2>Team Membership Notification</h2>
    <p>You have been added to a team:</p>
    <ul>
      <li><strong>Team:</strong> ${teamName}</li>
      <li><strong>Added by:</strong> ${addedByName}</li>
      <li><strong>Role:</strong> ${role}</li>
      <li><strong>Team ID:</strong> ${teamId}</li>
    </ul>
    <p>You can now collaborate with your team members on projects and tasks.</p>
  `;
  
  return await sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
};

// Send invitation email to user not in the system
export const sendInvitationEmail = async ({ inviteeEmail, inviterName, organizationName, teamName, role, registerUrl }) => {
  const subject = `You've been invited to join ${organizationName}${teamName ? ` team ${teamName}` : ''}`;
  const html = `
    <h2>Team Invitation</h2>
    <p>${inviterName} has invited you to join ${organizationName}${teamName ? ` team ${teamName}` : ''}.</p>
    <ul>
      <li><strong>Organization:</strong> ${organizationName}</li>
      ${teamName ? `<li><strong>Team:</strong> ${teamName}</li>` : ''}
      <li><strong>Role:</strong> ${role}</li>
    </ul>
    <p>To accept this invitation, please click the button below to register:</p>
    <p><a href="${registerUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a></p>
    <p>Or copy and paste this link into your browser: <a href="${registerUrl}">${registerUrl}</a></p>
    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
  `;
  
  return await sendEmail({
    to: inviteeEmail,
    subject,
    html,
  });
};