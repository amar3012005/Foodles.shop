# Foodles.shop

A modern food ordering platform for North Campus restaurants with integrated payment processing and automated notification system.

## Architecture Overview

### User Flow
1. **Homepage** → Select campus and browse features
2. **Campus Selection** → Choose North Campus
3. **Restaurant Listing (AboutSection)** → Browse available restaurants
4. **Menu** → Select items and customize order
5. **Checkout** → Review order summary and pricing
6. **Personal Info** → Enter delivery details and payment method
7. **Waiting Room** → Order preparation and payment processing
8. **Cashfree Payment Gateway** → Complete payment
9. **Order Confirmation** → View order details and notifications
10. **Backend Processing** → Email and missed call notifications sent

### Tech Stack

**Frontend:**
- React 18
- Tailwind CSS (cyber-themed with black background and green accents)
- Axios for API communication
- React Router for navigation

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- Nodemailer for email notifications
- Twilio for missed call alerts (8 restaurant-specific configurations)
- Cashfree payment integration

**Payment:**
- Cashfree payment forms
- Pre-order payment with remaining balance on delivery/at restaurant
- Pre-reservation orders (₹20 advance with 10% discount)

## Environment Setup

### Frontend Environment Variables

Create `.env.development` for local development:
```bash
# Backend API URL for development
REACT_APP_BACKEND_URL=http://localhost:5000
```

Create `.env.production` for production deployment:
```bash
# Backend API URL for production
REACT_APP_BACKEND_URL=https://foodles-backend-lpzp.onrender.com
```

### Backend Environment Variables

Required in `foodles-backend/.env`:
```bash
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password

# Twilio Configuration (per restaurant)
# Restaurant 1 - BABA_JI FOOD-POINT
TWILIO_ACCOUNT_SID_1=your-account-sid
TWILIO_AUTH_TOKEN_1=your-auth-token
TWILIO_PHONE_NUMBER_1=your-twilio-number

# Restaurant 2 - HIMALAYAN_CAFE
TWILIO_ACCOUNT_SID_2=your-account-sid
TWILIO_AUTH_TOKEN_2=your-auth-token
TWILIO_PHONE_NUMBER_2=your-twilio-number

# ... (Repeat for restaurants 3-8)

# MongoDB
MONGODB_URI=your-mongodb-connection-string

# Server Configuration
PORT=5000
NODE_ENV=production
```

## Installation & Running

### Frontend
```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

### Backend
```bash
cd foodles-backend

# Install dependencies
npm install

# Run server
npm start
```

## Theme & Design Guidelines

### Color Palette
- **Primary Background:** `#000000` (cyber-black)
- **Card Background:** `#111111` (cyber-gray)
- **Primary Accent:** `#4ADE80` (cyber-green / green-400)
- **Text:** White with varying opacity
- **Borders:** White with 10-30% opacity

### Typography
- **Font Family:** `font-mono` (monospace for futuristic aesthetic)
- **Headings:** Uppercase with green accents
- **Body Text:** White/gray with opacity variations

### Grid Patterns
All pages use consistent background grid:
```jsx
<div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_1px),linear-gradient(transparent_24px,rgba(255,255,255,0.05)_1px)] bg-[size:25px_25px]" />
```

### Animation Timing
- **Page Transitions:** 1000ms
- **Hover Effects:** 300ms
- **Loading Indicators:** Infinite pulse animation

## Data Flow

### Order Creation (WaitingRoom.jsx)
```javascript
const orderData = {
  orderId,
  userDetails: { fullName, email, phoneNumber },
  orderDetails: {
    items: [...],
    subtotal, deliveryFee, convenienceFee, dogDonation,
    grandTotal, remainingPayment, deliveryTime, ...
  },
  vendorEmail, vendorPhone,
  restaurantId, restaurantName,
  amount: remainingPayment,
  totalOrderValue: amount,
  paymentBreakdown: { total, preOrderPayment, remainingPayment },
  timestamp, paymentStatus: 'PENDING'
};

// Store in localStorage with key: order_{orderId}
localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));

// Also send to backend /payment/prepare-order (30min expiration)
await api.post('/payment/prepare-order', orderData);
```

### Order Confirmation (FuturisticOrderConfirmation.jsx)
```javascript
// Read from localStorage
const storedData = localStorage.getItem(`order_${orderId}`);
const parsedData = JSON.parse(storedData);

// Store in ref for retry resilience
parsedOrderDataRef.current = parsedData;

// Send to backend with cached data
await api.post('/payment/cashfree-success', {
  orderId, paymentId, status,
  orderData: parsedOrderDataRef.current
});

// Cleanup localStorage AFTER notifications complete (2s delay)
setTimeout(() => {
  localStorage.removeItem(localStorageKeyRef.current);
}, 2000);
```

### Backend Processing (server.js)
```javascript
// /payment/cashfree-success endpoint

// 1. Validate payment status and check idempotency
// 2. Try multiple data sources: frontend localStorage → server memory
// 3. Normalize orderDetails (guard against null/undefined)
// 4. Send emails: customer, vendor, admin
// 5. Trigger missed call to restaurant via Twilio
// 6. Store in processedOrders Map to prevent duplicates
// 7. Update global.emailStatus for polling
```

## Notification System

### Email Notifications
- **Customer Email:** Order confirmation with itemized list, payment breakdown
- **Vendor Email:** Order details with customer contact information
- **Admin Email:** Combined view with both customer and vendor templates

### Missed Call Alerts
- Twilio missed call to restaurant's vendor phone
- Restaurant-specific Twilio configurations (8 separate accounts)
- Fallback mechanism if primary Twilio fails

## Common Issues & Troubleshooting

### Issue: ₹0 displayed on order confirmation
**Cause:** localStorage cleared before backend could read order data  
**Solution:** 
- Implemented deferred cleanup (2s delay in `finally` block)
- Data stored in `parsedOrderDataRef` for retry resilience
- Fixed extraction paths to match stored structure

### Issue: Emails and missed calls not sent
**Cause:** 
- localStorage removed immediately after reading
- Backend received null `orderData`

**Solution:**
- Order data sent explicitly in POST request body
- Ref-based caching prevents data loss
- Multiple retry mechanisms with fallback

### Issue: Payment preparation fails
**Cause:** Backend connection issues or validation errors  
**Solution:**
- Added try-catch around `/payment/prepare-order`
- Shows vendor contact information on failure
- Aborts payment redirect to prevent orphaned orders

### Issue: Template generation crashes
**Cause:** Null/undefined values in `.toFixed()` or `.map()` calls  
**Solution:**
- Normalize all orderDetails data before processing
- Safe helpers like `safeFixed()` function
- Fallback template in catch block

### Debugging Steps

1. **Check backend connectivity:**
   ```bash
   curl https://foodles-backend-lpzp.onrender.com/health
   ```

2. **View health diagnostics:**
   - Email service status
   - Twilio configuration per restaurant
   - Environment variables status

3. **Check browser console:**
   - Look for localStorage data: `localStorage.getItem('order_XXX')`
   - API call logs (axios interceptors log all requests)
   - Order processing flow logs

4. **Check backend logs:**
   - Email send attempts
   - Twilio API calls
   - Order data validation
   - Notification processing results

5. **Poll email status:**
   ```
   GET /email-status/{orderId}
   ```
   Returns:
   ```json
   {
     "emailsSent": 3,
     "emailErrors": [],
     "missedCallStatus": "success",
     "status": "completed",
     "timestamp": 1234567890
   }
   ```

## Payment Integration

### Cashfree Payment Forms
- Pre-configured payment forms for specific amounts
- Return URL includes order metadata: `{payment_id}` and `{status}`
- Order preparation before payment redirect (30min expiration)

### Payment Validation
**Current:** Client-provided `paymentSuccess` flag  
**TODO:** Implement server-side payment verification via Cashfree webhook

### Security Considerations
- Idempotency checks prevent duplicate processing
- Payment verification should be added for production
- Sensitive data sanitization in logs

## Development Guidelines

### Adding New Restaurants
1. Create menu CSV in `build/data/menu_{id}.csv` and `public/data/menu_{id}.csv`
2. Update `restaurants` array in `foodles-backend/server.js`
3. Add Twilio configuration (optional)
4. Update restaurant listings in frontend

### Code Quality
- Use Tailwind classes for styling (avoid custom CSS)
- Follow existing naming conventions
- Add console logs for debugging
- Handle errors gracefully with user-friendly messages
- Test payment flow end-to-end before deployment

### Error Handling Best Practices
- Wrap external API calls in try-catch
- Provide fallback templates/data
- Log detailed diagnostics
- Show vendor contact on critical failures
- Never throw errors that crash the app

## API Endpoints

### Frontend → Backend

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Backend health check with service diagnostics |
| `/payment/prepare-order` | POST | Store order data before payment (30min TTL) |
| `/payment/cashfree-success` | POST | Process payment callback and send notifications |
| `/email-status/:orderId` | GET | Poll notification status |
| `/api/payment-form/:amount` | GET | Get Cashfree payment form URL |

### Response Formats

**`/payment/cashfree-success` Success:**
```json
{
  "success": true,
  "orderId": "FDL123...",
  "emailsSent": 3,
  "emailErrors": [],
  "missedCallStatus": "success",
  "dataSource": "frontend-localStorage"
}
```

**`/health` Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-31...",
  "services": {
    "email": "connected",
    "payment": "cashfree",
    "twilio": {
      "restaurant_1": { "configured": true, "hasPhone": true, "ready": true },
      ...
    }
  }
}
```

## Deployment

### Frontend (Netlify/Vercel)
1. Build: `npm run build`
2. Deploy `build/` directory
3. Set environment variable: `REACT_APP_BACKEND_URL`
4. Configure redirects for SPA routing

### Backend (Render)
1. Deploy from GitHub repository
2. Set all environment variables
3. Start command: `npm start`
4. Monitor logs for email/Twilio connectivity

## License

This project is proprietary and confidential.

---

**Note:** This documentation reflects the production-ready state after implementing all 17 critical bug fixes. Always test thoroughly before deploying changes.
