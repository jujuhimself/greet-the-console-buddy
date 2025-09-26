import { supabase } from '@/integrations/supabase/client';
import type { SubscriptionPlan } from '@/types/subscription';

export const createSubscriptionCheckout = async (plan: SubscriptionPlan) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
      body: { plan }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
};

export const manageSubscription = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('manage-subscription');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error managing subscription:', error);
    throw error;
  }
};
