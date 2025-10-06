// Test script for new Nodemailer integration
import { sendEmail } from './src/utils/emailService.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function testNodemailerIntegration() {
  console.log('Testing Nodemailer Integration...\n');
  
  // Check if .env file exists
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('   Please create a .env file based on .env.example');
    return;
  }
  
  // Check which email configuration is being used
  console.log('Checking email configuration...');
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('✅ Gmail configuration detected');
  } else if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD) {
    console.log('✅ Outlook configuration detected');
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('✅ Custom SMTP configuration detected');
  } else {
    console.log('⚠️  No email configuration found');
    console.log('   Please configure one of the following in your .env file:');
    console.log('   1. Gmail: Set GMAIL_USER and GMAIL_APP_PASSWORD');
    console.log('   2. Outlook: Set OUTLOOK_USER and OUTLOOK_PASSWORD');
    console.log('   3. Custom SMTP: Set SMTP_HOST, SMTP_USER, and SMTP_PASS');
    console.log('\n   See EMAIL_CONFIGURATION.md for detailed instructions.');
    return;
  }
  
  try {
    // Test sending a simple email
    console.log('\nSending test email...');
    
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    console.log(`Sending test email to: ${testEmail}`);
    
    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email from Your Application (Nodemailer)',
      html: `
        <h2>Nodemailer Test</h2>
        <p>This is a test email to verify that Nodemailer is working correctly.</p>
        <p>If you received this email, Nodemailer is configured correctly!</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`📧 Message ID: ${result.id}`);
    console.log('\n🎉 Nodemailer integration is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Nodemailer:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔐 Authentication failed. Check your credentials.');
      if (process.env.GMAIL_USER) {
        console.log('   For Gmail, make sure you are using an App Password, not your regular password.');
        console.log('   Visit: https://myaccount.google.com/apppasswords to generate one');
      }
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 Network error. Check your SMTP host settings.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔌 Connection refused. Check your SMTP host and port settings.');
    }
    
    console.log('\n💡 For configuration help, see EMAIL_CONFIGURATION.md');
  }
}

// Run the test
testNodemailerIntegration();