const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get available subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    // You can either fetch these from Stripe or define them statically
    const plans = [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 49,
        billingPeriod: 'monthly',
        features: [
          'Basic project management',
          'Up to 3 team members',
          'Email support',
          'Basic analytics'
        ]
      },
      {
        id: 'professional',
        name: 'Professional Plan',
        price: 99,
        billingPeriod: 'monthly',
        features: [
          'Advanced project management',
          'Up to 10 team members',
          'Priority support',
          'Advanced analytics',
          'Custom branding'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 199,
        billingPeriod: 'monthly',
        features: [
          'Enterprise project management',
          'Unlimited team members',
          '24/7 dedicated support',
          'Custom analytics',
          'White labeling',
          'API access'
        ]
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
});

// Create a subscription
router.post('/create-subscription', async (req, res) => {
  try {
    const { projectId, planId } = req.body;

    if (!projectId || !planId) {
      return res.status(400).json({ message: 'Project ID and plan ID are required' });
    }

    // Create a Stripe Customer if not exists
    // const customer = await createOrGetCustomer(userId);

    // Get the price ID for the selected plan
    const priceId = await getPriceIdForPlan(planId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
      metadata: {
        projectId,
        planId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// Webhook to handle subscription events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Helper function to get Stripe Price ID for a plan
async function getPriceIdForPlan(planId) {
  // This should be replaced with your actual price IDs from Stripe
  const priceMap = {
    'basic': 'price_basic123',
    'professional': 'price_pro123',
    'enterprise': 'price_enterprise123'
  };

  return priceMap[planId];
}

// Subscription event handlers
async function handleSubscriptionCreated(subscription) {
  const { projectId, planId } = subscription.metadata;
  // Update project subscription status in your database
  // await updateProjectSubscription(projectId, {
  //   status: 'active',
  //   planId,
  //   subscriptionId: subscription.id,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  // });
}

async function handleSubscriptionUpdated(subscription) {
  const { projectId } = subscription.metadata;
  // Update subscription details in your database
  // await updateProjectSubscription(projectId, {
  //   status: subscription.status,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  // });
}

async function handleSubscriptionCanceled(subscription) {
  const { projectId } = subscription.metadata;
  // Update subscription status in your database
  // await updateProjectSubscription(projectId, {
  //   status: 'canceled',
  //   canceledAt: new Date()
  // });
}

module.exports = router; 