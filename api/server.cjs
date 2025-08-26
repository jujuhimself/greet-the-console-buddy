const express = require('express');
const cors = require('cors');
const { stripe } = require('./config/stripe');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('Starting checkout session creation...');
    console.log('Request body:', req.body);

    const { items, mode, isSubscription, metadata, successUrl, cancelUrl } = req.body;

    if (!items || !items.length) {
      console.error('Missing items in request');
      return res.status(400).json({ error: 'Missing items in request' });
    }

    if (!successUrl || !cancelUrl) {
      console.error('Missing successUrl or cancelUrl');
      return res.status(400).json({ error: 'Missing success_url or cancel_url' });
    }

    const line_items = items.map(item => ({
      price_data: {
        currency: 'tzs',
        product_data: {
          name: item.name,
          description: item.description || undefined,
        },
        unit_amount: parseInt(item.price), // Price should already be in cents
        ...(isSubscription ? { 
          recurring: { 
            interval: 'month',
            interval_count: 1
          } 
        } : {}),
      },
      quantity: item.quantity || 1,
    }));

    console.log('Creating session with config:', {
      line_items,
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        ...metadata,
        isSubscription: isSubscription ? 'true' : 'false',
      },
      customer_email: metadata?.userEmail,
      subscription_data: isSubscription ? {
        trial_period_days: 30,
        metadata: metadata
      } : undefined
    });

    console.log('Session created successfully:', {
      sessionId: session.id,
      url: session.url
    });
    
    res.status(200).json({ 
      id: session.id, 
      url: session.url,
      isLive: session.livemode
    });
  } catch (err) {
    console.error('Stripe Checkout Error:', {
      error: err,
      message: err.message,
      type: err.type,
      code: err.code,
      param: err.param,
    });
    
    res.status(500).json({ 
      error: true,
      message: err.message || 'Failed to create checkout session',
      code: err.code,
      type: err.type
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
