const express = require('express');
const router = express.Router();

// Use test key if no environment variable is set
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51HrPUL5xqLYYSIey0m05hAdI';
const stripe = require('stripe')(stripeKey);

// Initialize Firebase Admin
let admin;
try {
  admin = require('firebase-admin');
  
  // Check if already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'your-service-account@your-project-id.iam.gserviceaccount.com',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n').replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-project-id.firebaseio.com'
    });
  }
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
  console.log('Continuing without Firebase Admin - subscriptions will not be created');
}

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

// Temporary endpoint to manually create subscription (for testing)
router.post('/create-subscription-manual', async (req, res) => {
  try {
    const { projectId, userId, projectName, userEmail, sessionId } = req.body;
    
    console.log('=== MANUAL SUBSCRIPTION CREATION ===');
    console.log('Request body:', req.body);
    
    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required' });
    }
    
    if (admin) {
      const db = admin.firestore();
      const subscriptionData = {
        projectId: projectId,
        userId: userId,
        projectName: projectName || 'Manual Test Project',
        userEmail: userEmail || 'test@example.com',
        amount: 60,
        currency: 'USD',
        status: 'active',
        sessionId: sessionId || 'manual-session-' + Date.now(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      console.log('Creating manual subscription:', subscriptionData);
      
      const subscriptionRef = await db.collection('subscriptions').add(subscriptionData);
      console.log('✅ Manual subscription created with ID:', subscriptionRef.id);
      
      // Verify the subscription was created
      const createdDoc = await subscriptionRef.get();
      console.log('✅ Created subscription data:', createdDoc.data());
      
      res.json({
        success: true,
        subscriptionId: subscriptionRef.id,
        message: 'Manual subscription created successfully',
        data: createdDoc.data()
      });
    } else {
      console.log('❌ Firebase Admin not available');
      res.status(500).json({ error: 'Firebase Admin not available' });
    }
  } catch (error) {
    console.error('❌ Error creating manual subscription:', error);
    res.status(500).json({ 
      error: 'Failed to create manual subscription',
      details: error.message 
    });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Headers:', req.headers);
  console.log('Body length:', req.body.length);
  console.log('Webhook secret available:', !!process.env.STRIPE_WEBHOOK_SECRET);

  try {
    // Check if webhook secret is available
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('❌ STRIPE_WEBHOOK_SECRET not set - webhook will not work');
      console.log('Please set up webhook in Stripe dashboard and add the secret to .env file');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('=== WEBHOOK EVENT ===');
    console.log('Event type:', event.type);
    console.log('Event ID:', event.id);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { projectId, userId, projectName, userEmail } = session.metadata;

      console.log('=== CHECKOUT SESSION COMPLETED ===');
      console.log('Session ID:', session.id);
      console.log('Payment status:', session.payment_status);
      console.log('Amount total:', session.amount_total);
      console.log('Currency:', session.currency);
      console.log('Metadata:', session.metadata);
      console.log(`Payment completed for project ${projectId} by user ${userId}`);
      
      // Create subscription record in Firestore
      if (admin) {
        try {
          console.log('=== CREATING FIRESTORE SUBSCRIPTION ===');
          const db = admin.firestore();
          const subscriptionData = {
            projectId: projectId,
            userId: userId,
            projectName: projectName || 'Unknown Project',
            userEmail: userEmail || '',
            amount: session.amount_total / 100, // Convert from cents
            currency: session.currency,
            status: 'active',
            sessionId: session.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          console.log('Subscription data to create:', JSON.stringify(subscriptionData, null, 2));
          
          const subscriptionRef = await db.collection('subscriptions').add(subscriptionData);
          console.log('✅ Subscription created successfully with ID:', subscriptionRef.id);
          
          // Verify the subscription was created
          const createdDoc = await subscriptionRef.get();
          console.log('✅ Created subscription data:', createdDoc.data());
          
        } catch (error) {
          console.error('❌ Error creating subscription in Firestore:', error);
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
      } else {
        console.log('❌ Firebase Admin not available - subscription not created');
        console.log('Admin object:', admin);
      }
      
      console.log('=== PAYMENT DETAILS ===');
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

      console.log('=== PAYMENT INTENT SUCCEEDED ===');
      console.log(`Payment intent succeeded for project ${projectId} by user ${userId}`);
    }

    console.log('=== WEBHOOK RESPONSE ===');
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
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

// Create test subscription (for debugging)
router.post('/create-test-subscription', async (req, res) => {
  try {
    const { projectId, userId, projectName, userEmail } = req.body;
    
    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required' });
    }
    
    if (admin) {
      const db = admin.firestore();
      const subscriptionData = {
        projectId: projectId,
        userId: userId,
        projectName: projectName || 'Test Project',
        userEmail: userEmail || 'test@example.com',
        amount: 60,
        currency: 'USD',
        status: 'active',
        sessionId: 'test-session-' + Date.now(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      console.log('Creating test subscription:', subscriptionData);
      
      const subscriptionRef = await db.collection('subscriptions').add(subscriptionData);
      console.log('Test subscription created with ID:', subscriptionRef.id);
      
      res.json({
        success: true,
        subscriptionId: subscriptionRef.id,
        message: 'Test subscription created successfully'
      });
    } else {
      res.status(500).json({ error: 'Firebase Admin not available' });
    }
  } catch (error) {
    console.error('Error creating test subscription:', error);
    res.status(500).json({ 
      error: 'Failed to create test subscription',
      details: error.message 
    });
  }
});

module.exports = router; 