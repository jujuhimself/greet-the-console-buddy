const { stripe } = require('./config/stripe');
const setupMiddleware = require('./middleware');

function handleError(res, error) {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    type: error.type,
    raw: error.raw
  });

  const errorResponse = {
    error: true,
    message: error.message || 'Failed to create checkout session',
    code: error.code,
    type: error.type
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(500).json(errorResponse);
}

module.exports = async (req, res) => {
  // Enable CORS for all responses, including errors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    console.log('Starting checkout session creation...');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: true, message: 'Method not allowed' });
      return;
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = req.body;
      console.log('Raw request body:', requestBody);
      
      if (typeof requestBody === 'string') {
        requestBody = JSON.parse(requestBody);
      }
    } catch (err) {
      handleError(res, new Error('Invalid request body: ' + err.message));
      return;
    }

    console.log('Parsed request body:', requestBody);
    const { items, mode, isSubscription, metadata, successUrl, cancelUrl } = requestBody;

  if (!items || !items.length) {
    console.error('Missing items in request');
    res.status(400).json({ error: 'Missing items in request' });
    return;
  }

  if (!successUrl || !cancelUrl) {
    console.error('Missing successUrl or cancelUrl');
    res.status(400).json({ error: 'Missing success_url or cancel_url' });
    return;
  }
  try {
    console.log('Creating checkout session with items:', items);
    
    // Create line items from the items array
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

    console.log('Prepared line items:', line_items);

    // Create Stripe checkout session
    console.log('Creating Stripe session with config:', {
      line_items,
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      customer_email: metadata?.userEmail,
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
    handleError(res, err);
  }
};

// Wrap the handler with middleware
module.exports = setupMiddleware(module.exports); 