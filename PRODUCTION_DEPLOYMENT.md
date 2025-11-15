# Production Deployment Guide

## Overview
This guide covers the deployment process for Foodles, a food ordering application with a React frontend and Node.js/Express backend.

## Architecture
- **Frontend**: React application deployed on Netlify (foodles.shop)
- **Backend**: Node.js/Express API deployed on Render (foodles-backend.onrender.com)
- **Database**: MongoDB for order storage
- **Payment Processing**: Razorpay and Cashfree integration
- **Notifications**: Nodemailer for emails, Twilio for missed calls

## Prerequisites
- Node.js 16+ and npm
- Git repository access
- Netlify account for frontend deployment
- Render account for backend deployment
- MongoDB database (MongoDB Atlas recommended)
- Payment gateway accounts (Razorpay, Cashfree)
- Email service (Gmail SMTP recommended)
- Twilio account for SMS/missed calls

## Environment Variables

### Backend (.env)
```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodles

# Payment Gateways
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
CASHFREE_APP_ID=xxx
CASHFREE_SECRET_KEY=xxx

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SECURE=false

# Twilio (for missed calls)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Server Configuration
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://foodles-backend.onrender.com
```

## Backend Deployment (Render)

### 1. Prepare Backend for Deployment
```bash
cd foodles-backend

# Ensure package.json has correct scripts
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}

# Ensure render.yaml is configured
services:
  - type: web
    name: foodles-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        fromSecret: mongo_uri
      # Add other environment variables as secrets
```

### 2. Deploy to Render
1. Connect GitHub repository to Render
2. Create new Web Service
3. Configure environment variables as secrets
4. Set build and start commands
5. Deploy

### 3. Health Check
```bash
curl https://foodles-backend.onrender.com/health
```

## Frontend Deployment (Netlify)

### 1. Prepare Frontend for Deployment
```bash
cd foodles

# Ensure package.json has correct build script
"scripts": {
  "build": "react-scripts build"
}

# Configure _redirects for SPA routing
/*    /index.html   200
```

### 2. Deploy to Netlify
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables
5. Deploy

### 3. Configure Domain
1. Add custom domain (foodles.shop)
2. Configure DNS settings
3. Enable HTTPS

## Payment Gateway Configuration

### Razorpay
1. Create account at razorpay.com
2. Generate API keys (test/production)
3. Configure webhook endpoints:
   - `https://foodles-backend.onrender.com/payment/razorpay/webhook`

### Cashfree
1. Create account at cashfree.com
2. Generate API credentials
3. Configure webhook endpoints:
   - `https://foodles-backend.onrender.com/cashfree-webhook`

## Email Configuration

### Gmail SMTP Setup
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in EMAIL_PASS environment variable

## Monitoring and Logging

### Backend Logging
- Structured logging implemented with environment-based verbosity
- Production mode: Only errors and critical info logged
- Development mode: Debug logging enabled

### Health Checks
- `/health` endpoint provides service status
- Monitor MongoDB, email, and Twilio connectivity

## Troubleshooting

### Common Issues

#### Payment Verification Failures
- Check payment gateway API keys
- Verify webhook endpoints are accessible
- Check server logs for verification errors

#### Email Delivery Issues
- Verify SMTP credentials
- Check email service quotas
- Review spam folders

#### Database Connection Issues
- Verify MongoDB connection string
- Check network connectivity
- Review MongoDB Atlas IP whitelist

#### Frontend Routing Issues
- Ensure _redirects file is in build directory
- Verify Netlify deployment settings
- Check browser console for routing errors

### Debug Commands
```bash
# Check backend health
curl https://foodles-backend.onrender.com/health

# Test payment verification
curl -X POST https://foodles-backend.onrender.com/payment/status/orderId

# Check MongoDB connection
curl https://foodles-backend.onrender.com/health | jq .services.mongodb
```

## Rollback Procedures

### Backend Rollback
1. Access Render dashboard
2. Select previous deployment
3. Click "Promote to production"

### Frontend Rollback
1. Access Netlify dashboard
2. Go to Deploys tab
3. Find previous deploy and click "Publish deploy"

## Security Considerations

### Environment Variables
- Never commit secrets to version control
- Use Render/Netlify environment variable management
- Rotate API keys regularly

### API Security
- Implement rate limiting
- Validate all input data
- Use HTTPS for all communications

### Database Security
- Enable MongoDB authentication
- Configure IP whitelisting
- Regular backup procedures

## Performance Optimization

### Frontend
- Enable gzip compression in Netlify
- Optimize bundle size
- Implement code splitting

### Backend
- Enable connection pooling
- Implement caching where appropriate
- Monitor response times

## Maintenance Tasks

### Weekly
- Review server logs for errors
- Check payment gateway status
- Monitor database performance

### Monthly
- Update dependencies
- Review security settings
- Check backup integrity

### Quarterly
- Rotate API keys
- Update SSL certificates
- Review access controls

## Support Contacts

- Development Team: [team@foodles.com]
- Payment Support: [payments@foodles.com]
- Infrastructure: [infra@foodles.com]

---

*Last updated: $(date)*
