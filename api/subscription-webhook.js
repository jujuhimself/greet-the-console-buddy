const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const updateSubscription = async (userId, plan, subscriptionId) => {
  const now = new Date();
  const complimentaryEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextBillingDate = new Date(complimentaryEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'trial',
      subscription_plan: plan,
      subscription_start_date: now.toISOString(),
      subscription_trial_end_date: complimentaryEndDate.toISOString(),
      subscription_period_end: complimentaryEndDate.toISOString(),
      subscription_cancel_at_period_end: false,
      subscription_next_billing_date: nextBillingDate.toISOString(),
      stripe_subscription_id: subscriptionId
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Get the subscription details from the session
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Update the user's subscription in the database
        await updateSubscription(
          session.client_reference_id, // This should be the user ID
          session.metadata.plan,
          subscription.id
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
