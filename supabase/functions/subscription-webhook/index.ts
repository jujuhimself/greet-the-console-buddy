import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    console.log('Processing event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)

        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await updateUserSubscription(session, subscription)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await handlePaymentSuccess(subscription, invoice)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        // Handle payment failure (notify user, etc.)
        break
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 500 })
  }
})

async function updateUserSubscription(session: Stripe.Checkout.Session, subscription: Stripe.Subscription) {
  try {
    const customerId = session.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

    if (!userId) {
      console.error('No user ID found in customer metadata')
      return
    }

    const plan = session.metadata?.plan || 'basic'
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const nextBillingDate = new Date(subscription.current_period_end * 1000)

    await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_plan: plan,
        subscription_start_date: new Date(subscription.created * 1000).toISOString(),
        subscription_period_end: currentPeriodEnd.toISOString(),
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
        subscription_next_billing_date: nextBillingDate.toISOString(),
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    console.log('Updated subscription for user:', userId)
  } catch (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

    if (!userId) {
      console.error('No user ID found in customer metadata')
      return
    }

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const status = subscription.status === 'canceled' ? 'expired' : subscription.status

    await supabase
      .from('profiles')
      .update({
        subscription_status: status,
        subscription_period_end: currentPeriodEnd.toISOString(),
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    console.log('Updated subscription status for user:', userId)
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

async function handlePaymentSuccess(subscription: Stripe.Subscription, invoice: Stripe.Invoice) {
  try {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    const userId = (customer as Stripe.Customer).metadata?.supabase_user_id

    if (!userId) {
      console.error('No user ID found in customer metadata')
      return
    }

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const nextBillingDate = new Date(subscription.current_period_end * 1000)

    await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_period_end: currentPeriodEnd.toISOString(),
        subscription_next_billing_date: nextBillingDate.toISOString(),
        subscription_last_payment_date: new Date(invoice.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    console.log('Payment successful for user:', userId)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}