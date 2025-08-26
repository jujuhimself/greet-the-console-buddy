// src/components/subscription/SubscriptionInit.tsx
import { PropsWithChildren } from 'react';
import { useInitialSubscription } from '@/hooks/useInitialSubscription';

export const SubscriptionInit = ({ children }: PropsWithChildren) => {
  useInitialSubscription();
  return <>{children}</>;
};
