# 🚀 Foodles Production Deployment Instructions

## Step 1: Backend Deployment (Render)

### Manual Deployment Steps:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Connect Repository**:
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select repository: `amar3012005/fb`
   - Branch: `main`
   - Root Directory: `foodles-backend`

3. **Configure Service**:
   - **Name**: `foodles-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

4. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CASHFREE_APP_ID=your_cashfree_app_id
   CASHFREE_SECRET_KEY=your_cashfree_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   ```

5. **Custom Domain**:
   - In service settings, add custom domain: `api.foodles.shop`

6. **Deploy**: Click "Create Web Service"

## Step 2: Frontend Deployment (Vercel)

### Manual Deployment Steps:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import GitHub repository: `amar3012005/fb`
   - Configure project:
     - **Framework Preset**: `Create React App`
     - **Root Directory**: `./` (root directory)
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Install Command**: `npm install`

3. **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL=https://api.foodles.shop
   ```

4. **Deploy**: Click "Deploy"

## Step 3: Domain Configuration

### Vercel Domain Setup:
1. Go to project settings in Vercel
2. Add custom domain: `foodles.shop`
3. Follow DNS configuration instructions
4. Update nameservers if required

## Step 4: Production Testing

### Test Checklist:
- [ ] Frontend loads: https://foodles.shop
- [ ] Backend health: https://api.foodles.shop/health
- [ ] Restaurant status: POST https://api.foodles.shop/api/restaurants/status
- [ ] Payment creation: POST https://api.foodles.shop/payment/razorpay/create-order
- [ ] Phone sync works silently
- [ ] Order history displays correctly

### Required Environment Variables:
**MongoDB**: Get from MongoDB Atlas
**Razorpay**: Get from Razorpay Dashboard
**Twilio**: Get from Twilio Console
**Email**: Configure SMTP credentials

---
**Note**: Replace placeholder values with actual credentials before deploying!</content>
<parameter name="filePath">c:\Users\AMAR\Music\Foodles\PRODUCTION_DEPLOYMENT.md