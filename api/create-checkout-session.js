const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  module.exports = (req, res) => {
    res.status(500).json({ error: 'Stripe secret key not set in environment.' });
  };
  return;
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  console.log('Stripe Checkout Request Body:', req.body);
  const { amount, currency, productName, success_url, cancel_url, ...metadata } = req.body;
  if (!amount) {
    console.error('Missing amount in request');
    res.status(400).json({ error: 'Missing amount in request' });
    return;
  }
  if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
    console.error('Invalid amount:', amount);
    res.status(400).json({ error: 'Invalid amount. Must be a positive integer (in cents).' });
    return;
  }
  if (!success_url || !cancel_url) {
    console.error('Missing success_url or cancel_url');
    res.status(400).json({ error: 'Missing success_url or cancel_url' });
    return;
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
          product_data: { name: productName || 'Checkout' },
          unit_amount: amount, // in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url,
      cancel_url,
      metadata,
    });
    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: err && err.message ? err.message : 'Internal server error' });
  }
}; 