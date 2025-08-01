const express = require('express');
const router = express.Router();

// Use test key if no environment variable is set
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51HrPUL5xqLYYSIey0m05hAdI';
const stripe = require('stripe')(stripeKey);

// Create a payment intent for subscription payments
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, projectId, projectName, userId, userEmail } = req.body;

    console.log('Creating payment intent with data:', {
      amount,
      currency,
      projectId,
      projectName,
      userId,
      userEmail
    });

    if (!amount || !projectId || !userId) {
      return res.status(400).json({ 
        error: 'Amount, project ID, and user ID are required' 
      });
    }

    // Create a payment intent with automatic payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        projectId,
        projectName: projectName || 'Unknown Project',
        userId,
        userEmail: userEmail || '',
      },
      description: `Subscription payment for ${projectName || 'project'}`,
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
});

// Create a Stripe Checkout session for subscription payments
router.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('Received checkout session request body:', req.body);
    
    const { amount, currency, projectId, projectName, userId, userEmail } = req.body;

    console.log('Creating checkout session with data:', {
      amount,
      currency,
      projectId,
      projectName,
      userId,
      userEmail
    });

    if (!amount || !projectId || !userId) {
      console.error('Missing required fields:', { amount, projectId, userId });
      return res.status(400).json({ 
        error: 'Amount, project ID, and user ID are required',
        received: req.body
      });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (currency || 'usd').toLowerCase(),
            product_data: {
              name: projectName || 'Project Subscription',
              description: `Subscription payment for ${projectName || 'project'}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5199'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5199'}/dashboard?payment=cancelled`,
      metadata: {
        projectId,
        projectName: projectName || 'Unknown Project',
        userId,
        userEmail: userEmail || '',
      },
    });

    console.log('Checkout session created successfully:', session.id);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Create a Stripe Checkout session
router.post('/create-payment-session', async (req, res) => {
  try {
    const { projectId, amount } = req.body;

    if (!projectId || !amount) {
      return res.status(400).json({ message: 'Project ID and amount are required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Project Payment',
              description: `Payment for project ${projectId}`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        projectId,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ message: 'Failed to create payment session' });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { projectId, userId, projectName, userEmail } = session.metadata;

      console.log(`Payment completed for project ${projectId} by user ${userId}`);
      
      // Here you would update your database to mark the payment as successful
      // For now, we'll just log the success
      console.log('Payment details:', {
        sessionId: session.id,
        amount: session.amount_total / 100, // Convert from cents
        currency: session.currency,
        projectId,
        userId,
        projectName,
        userEmail
      });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { projectId, userId, projectName } = paymentIntent.metadata;

      console.log(`Payment intent succeeded for project ${projectId} by user ${userId}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Verify payment session (for testing)
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amount: session.amount_total / 100,
      currency: session.currency,
      metadata: session.metadata
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve session',
      details: error.message 
    });
  }
});

module.exports = router; 