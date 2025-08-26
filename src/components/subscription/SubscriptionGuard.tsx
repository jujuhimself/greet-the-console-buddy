import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredPlan: SubscriptionPlan;
  feature?: string;
}

export const SubscriptionGuard = ({ children, requiredPlan, feature }: SubscriptionGuardProps) => {
  const { userSubscription } = useAuth();
  const { toast } = useToast();

  // If no subscription, redirect to subscription page
  if (!userSubscription) {
    toast({
      title: 'Subscription Required',
      description: `You need a subscription to access ${feature || 'this feature'}.`,
      variant: 'default',
    });
    return <Navigate to="/subscription" replace />;
  }

  const currentPlanLevel = {
    'basic': 1,
    'medium': 2,
    'premium': 3
  }[userSubscription.plan];

  const requiredPlanLevel = {
    'basic': 1,
    'medium': 2,
    'premium': 3
  }[requiredPlan];

  // Check if current plan is sufficient
  if (currentPlanLevel < requiredPlanLevel) {
    toast({
      title: 'Upgrade Required',
      description: `This feature requires the ${requiredPlan} plan or higher.`,
      variant: 'default',
    });
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

// Helper components for specific plan requirements
export const BasicFeature = ({ children }: { children: ReactNode }) => (
  <SubscriptionGuard requiredPlan="basic">{children}</SubscriptionGuard>
);

export const MediumFeature = ({ children, feature }: { children: ReactNode; feature?: string }) => (
  <SubscriptionGuard requiredPlan="medium" feature={feature}>{children}</SubscriptionGuard>
);

export const PremiumFeature = ({ children, feature }: { children: ReactNode; feature?: string }) => (
  <SubscriptionGuard requiredPlan="premium" feature={feature}>{children}</SubscriptionGuard>
);

export default SubscriptionGuard;
