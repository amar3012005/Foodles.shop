# Email Configuration Guide

## Current Issue
Your Gmail SMTP is timing out because Gmail blocks connections from cloud hosting platforms like Render. This is causing payment verification to fail even though payments are successful.

## Solution: Switch to SendGrid

### Step 1: Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Generate API Key
1. In SendGrid dashboard, go to "Settings" → "API Keys"
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access" (with Mail Send permission)
4. Copy the API key (it starts with "SG...")

### Step 3: Update Environment Variables
Update your Render environment variables:

```bash
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key-here
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Step 4: Verify Domain (Optional but Recommended)
1. In SendGrid, go to "Settings" → "Sender Authentication"
2. Choose "Verify a Single Sender" or "Authenticate Your Domain"
3. Follow the instructions to verify your domain

### Step 5: Deploy and Test
1. Deploy your backend changes
2. Test a payment to see if emails are sent successfully

## Alternative: Use Gmail App Password

If you prefer to stick with Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password instead of your regular password
4. Update EMAIL_PASS with the App Password

## Benefits of SendGrid
- ✅ Reliable delivery from cloud platforms
- ✅ Better deliverability rates
- ✅ Professional email service
- ✅ Free tier allows 100 emails/day
- ✅ Detailed analytics and tracking

## Testing Email Delivery
After setup, you can test email delivery using the `/test-email` endpoint:

```bash
curl -X POST https://your-backend-url/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```