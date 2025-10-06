// Test script for nodemailer with Gmail
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testNodemailer() {
  console.log('Testing Nodemailer with Gmail...\n');
  
  // Gmail SMTP configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER || 'your_email@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'your_app_password',
    },
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('✅ Server is ready to take our messages\n');
  } catch (error) {
    console.log('❌ Error with SMTP configuration:');
    console.log(error.message);
    return;
  }

  // Email options
  const mailOptions = {
    from: process.env.GMAIL_USER || 'your_email@gmail.com',
    to: process.env.TEST_EMAIL || 'recipient@example.com',
    subject: 'Test Email from Nodemailer',
    text: 'This is a test email sent using Nodemailer with Gmail SMTP!',
    html: '<h1>Test Email</h1><p>This is a <b>test email</b> sent using <i>Nodemailer</i> with Gmail SMTP!</p>'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log('❌ Error sending email:');
    console.log(error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔐 Authentication failed. Make sure you are using an App Password, not your regular Gmail password.');
      console.log('   Visit: https://myaccount.google.com/apppasswords to generate one');
    }
  }
}

testNodemailer();