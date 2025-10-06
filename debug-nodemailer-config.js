// Debug script to check Nodemailer configuration
// This script helps diagnose why emails are not being sent

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

console.log('=== Nodemailer Configuration Debug ===\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
console.log(`Looking for .env file at: ${envPath}`);
console.log(`.env file exists: ${fs.existsSync(envPath)}\n`);

// Display environment variables
console.log('Environment Variables:');
console.log('---------------------');
console.log(`GMAIL_USER: ${process.env.GMAIL_USER}`);
console.log(`GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '****' : 'NOT SET'}`);
console.log(`OUTLOOK_USER: ${process.env.OUTLOOK_USER}`);
console.log(`OUTLOOK_PASSWORD: ${process.env.OUTLOOK_PASSWORD ? '****' : 'NOT SET'}`);
console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL}`);
console.log(`TEST_EMAIL: ${process.env.TEST_EMAIL}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}\n`);

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
}

// Check if FROM_EMAIL is properly set
if (!process.env.FROM_EMAIL) {
  console.log('⚠️  FROM_EMAIL is not set');
  console.log('   This is recommended for setting the sender address\n');
} else {
  console.log(`✅ FROM_EMAIL is set to: ${process.env.FROM_EMAIL}\n`);
}

// Check if TEST_EMAIL is properly set
if (!process.env.TEST_EMAIL) {
  console.log('ℹ️  TEST_EMAIL is not set');
  console.log('   Consider setting this for testing purposes\n');
} else {
  console.log(`✅ TEST_EMAIL is set to: ${process.env.TEST_EMAIL}\n`);
}

console.log('=== How to fix ===');
console.log('1. Choose your email provider (Gmail, Outlook, or custom SMTP)');
console.log('2. Update your .env file with the appropriate configuration');
console.log('3. For Gmail, make sure to use an App Password instead of your regular password');
console.log('4. Set TEST_EMAIL to your email address for testing');
console.log('5. Restart your application');
console.log('6. Run the test-nodemailer-integration.js script to verify');