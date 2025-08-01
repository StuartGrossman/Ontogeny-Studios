# Stripe Test Payments Setup

This document explains how to test the Stripe payment integration with fake cards.

## Test Card Numbers

Use these test card numbers to test the payment flow:

### Successful Payments
- **4242 4242 4242 4242** (Visa)
- **5555 5555 5555 4444** (Mastercard)
- **2223 0031 2200 3222** (Mastercard)

### Failed Payments
- **4000 0000 0000 0002** (Visa) - Payment declined

### 3D Secure Authentication
- **4000 0025 0000 3155** (Visa) - Requires authentication

## How to Test

1. **Start the application:**
   ```bash
   # Terminal 1 - Start server
   cd server && npm start
   
   # Terminal 2 - Start client
   cd client && npm run dev
   ```

2. **Access the test payment helper:**
   - Open `http://localhost:5199`
   - The test payment helper will be visible in development mode
   - Copy any test card number

3. **Test the payment flow:**
   - Click on any payment button in the app
   - You'll be redirected to Stripe Checkout
   - Use one of the test card numbers above
   - For expiry date: use any future date (e.g., 12/25)
   - For CVC: use any 3 digits (e.g., 123)
   - For postal code: use any valid format (e.g., 12345)

4. **Verify payment status:**
   ```bash
   # Check payment session status
   curl http://localhost:3002/api/payments/verify-session/{session_id}
   ```

## Test Payment Helper Component

The app includes a `TestPaymentHelper` component that shows:
- All available test card numbers
- Copy-to-clipboard functionality
- Step-by-step testing instructions
- Important notes about test mode

## Server Endpoints

### Create Checkout Session
```bash
POST http://localhost:3002/api/payments/create-checkout-session
Content-Type: application/json

{
  "amount": 10,
  "currency": "usd",
  "projectId": "test-project",
  "projectName": "Test Project",
  "userId": "test-user",
  "userEmail": "test@example.com"
}
```

### Verify Payment Session
```bash
GET http://localhost:3002/api/payments/verify-session/{session_id}
```

### Webhook (for production)
```bash
POST http://localhost:3002/api/payments/webhook
```

## Important Notes

- **Test Mode Only:** These cards only work in Stripe test mode
- **No Real Charges:** No actual money will be charged
- **Development Only:** Test payment helper only shows in development
- **Webhook Setup:** For production, you'll need to set up webhook endpoints

## Stripe Dashboard

You can monitor test payments in the Stripe Dashboard:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to "Test mode" (toggle in top right)
3. View payments, customers, and sessions

## Troubleshooting

### Payment Declined
- Use `4000 0000 0000 0002` to test declined payments
- Check server logs for error details

### 3D Secure Authentication
- Use `4000 0025 0000 3155` to test authentication flow
- Follow the authentication prompts

### Session Verification
- Use the verify endpoint to check payment status
- Session status will be: `open`, `complete`, or `expired`

## Production Setup

For production deployment:
1. Replace test keys with live Stripe keys
2. Set up webhook endpoints
3. Configure proper success/cancel URLs
4. Remove test payment helper component
5. Set up proper error handling and logging 