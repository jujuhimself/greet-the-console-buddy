import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/use-subscription';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types/subscription';
import { createSubscriptionCheckout, manageSubscription } from '@/api/subscription';

function SubscriptionPage() {
  const { user } = useAuth();
  const { currentPlan, isActive, isTrial } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  
  const isCurrentPlan = (planId: SubscriptionPlan) => currentPlan === planId;

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage your subscription.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setLoadingPlan(plan);
    try {
      const checkoutSession = await createSubscriptionCheckout(plan);
      
      if (checkoutSession?.url) {
        // Open Stripe checkout in a new tab
        window.open(checkoutSession.url, '_blank');
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Error',
        description: error instanceof Error ? error.message : 'Failed to process subscription',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const portalSession = await manageSubscription();
      
      if (portalSession?.url) {
        window.open(portalSession.url, '_blank');
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (error) {
      console.error('Manage subscription error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open billing portal',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">Select the best plan for your business needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <Card key={plan.id} className={`relative ${
            isCurrentPlan(plan.id) ? 'border-primary border-2' : ''
          }`}>
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">
                  Current Plan
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">
                  TZS {plan.price.toLocaleString()}
                </span>
                /month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {Object.entries(plan.features).map(([key, value]) => (
                  <li key={key} className="flex items-center gap-2">
                    {value ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span>
                      {key === 'maxStaffAccounts' && (
                        `Staff Management (${value === 'unlimited' ? 'Unlimited' : value} accounts)`
                      )}
                      {key === 'maxBranches' && (
                        `Branch Management (${value === 'unlimited' ? 'Unlimited' : `up to ${value}`} branches)`
                      )}
                      {key === 'auditReports' && (
                        `${value === 'none' ? 'No ' : value === 'advanced' ? 'Advanced ' : ''}Audit Reports`
                      )}
                      {!['maxStaffAccounts', 'maxBranches', 'auditReports'].includes(key) && (
                        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 mt-6">
                <Button
                  className="w-full"
                  disabled={loadingPlan !== null}
                  onClick={() => isCurrentPlan(plan.id) && isActive ? handleManageSubscription() : handleSubscribe(plan.id)}
                  variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                >
                  {isCurrentPlan(plan.id) 
                    ? isActive 
                      ? 'Manage Plan' 
                      : 'Renew Plan'
                    : loadingPlan === plan.id
                      ? 'Processing...' 
                      : 'Subscribe'}
                </Button>
                {isTrial && (
                  <p className="text-center text-sm text-muted-foreground">
                    30-day free trial included
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
