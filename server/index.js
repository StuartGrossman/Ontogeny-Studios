require('dotenv').config();

const express = require('express');
const cors = require('cors');
const plansRoutes = require('./routes/plans');
const projectsRoutes = require('./routes/projects');
const paymentsRoutes = require('./routes/payments');
const subscriptionsRoutes = require('./routes/subscriptions');

// Debug: Check if environment variables are loaded
console.log('Stripe Key available:', !!process.env.STRIPE_SECRET_KEY);
console.log('Client URL:', process.env.CLIENT_URL);

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());

// Raw body parsing for Stripe webhooks
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());

// Routes
app.use('/api/plans', plansRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`Server is running on port ${actualPort}`);
  console.log(`Health check: http://localhost:${actualPort}/api/health`);
}); 