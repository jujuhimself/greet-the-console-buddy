const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, successUrl, cancelUrl } = req.body;

    // Map subscription plans to Stripe prices
    const planPrices = {
      basic: 10000, // 10,000 TZS
      medium: 25000, // 25,000 TZS
      premium: 40000, // 40,000 TZS
    };

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'tzs',
            product_data: {
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
              description: `Monthly subscription to the ${plan} plan`,
            },
            unit_amount: planPrices[plan], // Amount in TZS
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&plan=${plan}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        plan,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
}
