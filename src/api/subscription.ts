// src/api/subscription.ts
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_CONFIG } from '@/config/subscription';
import { SubscriptionPlan } from '@/types/subscription';

export async function createSubscriptionCheckout(plan: SubscriptionPlan) {
  try {
    // Get the current user and their profile
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('No user logged in');

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, subscription_status')
      .eq('id', session.user.id)
      .single();

    // Get plan configuration
    const planConfig = SUBSCRIPTION_CONFIG.plans[plan];
    if (!planConfig) throw new Error('Invalid subscription plan');

    // Calculate dates for the trial period
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + SUBSCRIPTION_CONFIG.trialPeriod);
    const nextBillingDate = new Date(trialEndDate);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    console.log('Creating checkout session with plan:', planConfig);

    // Create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          name: planConfig.name,
          description: planConfig.description,
          // Use test price in development, real price in production
          price: SUBSCRIPTION_CONFIG.isTestMode ? planConfig.testPrice : planConfig.price,
          quantity: 1,
        }],
        mode: 'subscription',
        isSubscription: true,
        metadata: {
          type: 'subscription',
          plan,
          userId: session.user.id,
          userEmail: profile?.email,
          trialEndDate: trialEndDate.toISOString(),
        },
        successUrl: `${window.location.origin}/subscription?success=true&plan=${plan}&trial=${SUBSCRIPTION_CONFIG.trialPeriod}`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create checkout session';
      try {
        const errorData = await response.json();
        console.error('Checkout session creation failed:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Checkout session created:', data);

    // Update the subscription status in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_status: 'trial',
        subscription_start_date: now.toISOString(),
        subscription_trial_end_date: trialEndDate.toISOString(),
        subscription_period_end: trialEndDate.toISOString(),
        subscription_cancel_at_period_end: false,
        subscription_next_billing_date: nextBillingDate.toISOString(),
        max_staff_accounts: planConfig.features.maxStaffAccounts === 'unlimited' ? -1 : planConfig.features.maxStaffAccounts,
        max_branches: planConfig.features.maxBranches === 'unlimited' ? -1 : planConfig.features.maxBranches,
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Failed to update subscription status:', updateError);
    }

    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}
