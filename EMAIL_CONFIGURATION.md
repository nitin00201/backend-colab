# Email Configuration

This application now uses Nodemailer instead of Resend for sending emails. You need to configure one of the following email providers:

## Option 1: Gmail (Recommended)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password
3. Update your [.env](file:///d:/colab/backend/.env) file:
   ```
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=the_app_password_you_generated
   FROM_EMAIL=your_email@gmail.com
   ```

## Option 2: Outlook

1. Update your [.env](file:///d:/colab/backend/.env) file:
   ```
   OUTLOOK_USER=your_email@outlook.com
   OUTLOOK_PASSWORD=your_password
   FROM_EMAIL=your_email@outlook.com
   ```

## Option 3: Custom SMTP

1. Update your [.env](file:///d:/colab/backend/.env) file with your SMTP settings:
   ```
   SMTP_HOST=your_smtp_server.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   FROM_EMAIL=your_sender_email@example.com
   ```

## Testing

To test your email configuration:

1. Set the TEST_EMAIL variable in your [.env](file:///d:/colab/backend/.env) file to your email address
2. Run `node test-nodemailer-integration.js`

## Notes

- For Gmail, you MUST use an App Password, not your regular Google account password
- Make sure to restart your application after changing email configuration