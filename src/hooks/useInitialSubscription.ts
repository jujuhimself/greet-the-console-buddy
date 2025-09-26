// src/hooks/useInitialSubscription.ts
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useInitialSubscription() {
  useEffect(() => {
    const initializeSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Check if user already has a subscription record
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_trial_end_date')
        .eq('id', session.user.id)
        .single();

      // If no subscription status, initialize complimentary month
      if (!profile?.subscription_status) {
        const now = new Date();
        const complimentaryEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'trial',
            subscription_plan: 'premium', // Give access to all features during trial
            subscription_start_date: now.toISOString(),
            subscription_trial_end_date: complimentaryEndDate.toISOString(),
            subscription_period_end: complimentaryEndDate.toISOString(),
            subscription_cancel_at_period_end: false,
            subscription_next_billing_date: complimentaryEndDate.toISOString(),
          })
          .eq('id', session.user.id);
      }
    };

    initializeSubscription();
  }, []);
}
