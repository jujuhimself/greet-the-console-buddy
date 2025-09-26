const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata || {};
    try {
      // Create order in Supabase
      const { error: orderError } = await supabase.from('orders').insert({
        user_id: meta.userId,
        order_type: 'retail',
        order_number: session.id,
        total_amount: session.amount_total / 100,
        status: 'paid',
        payment_status: 'paid',
        payment_method: meta.paymentMethod,
        shipping_address: {
          name: meta.deliveryName,
          alias: meta.deliveryAlias,
          phone: meta.deliveryPhone,
          address: meta.deliveryAddress,
        },
        items: [{
          product_name: session.display_items ? session.display_items[0].custom.name : meta.productName,
          quantity: meta.quantity || 1,
          unit_price: session.amount_total / (meta.quantity || 1) / 100,
          total_price: session.amount_total / 100,
          pharmacy_id: meta.pharmacyId,
          pharmacy_name: meta.pharmacyName,
        }],
      });
      if (orderError) throw orderError;
      // Deduct stock (example: decrement by quantity)
      if (meta.pharmacyId && meta.quantity) {
        await supabase.rpc('decrement_stock', {
          pharmacy_id: meta.pharmacyId,
          product_name: meta.productName,
          quantity: meta.quantity,
        });
      }
    } catch (err) {
      console.error('Order creation or stock deduction failed:', err);
    }
  }
  res.status(200).json({ received: true });
}; 