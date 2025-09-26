import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';

interface FeatureGuardProps {
  feature: keyof typeof SUBSCRIPTION_PLANS.premium.features;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGuard = ({ feature, children, fallback }: FeatureGuardProps) => {
  const { userSubscription } = useAuth();

  if (!userSubscription) {
    return fallback ?? null;
  }

  const currentPlan = SUBSCRIPTION_PLANS[userSubscription.plan];
  const hasAccess = currentPlan.features[feature];

  if (!hasAccess) {
    return fallback ?? null;
  }

  return <>{children}</>;
};

export default FeatureGuard;
