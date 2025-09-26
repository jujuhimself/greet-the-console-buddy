import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/use-subscription';
import { Link } from 'react-router-dom';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionStatus = () => {
  const { 
    currentPlan, 
    isActive, 
    isTrial,
    subscription,
    getMaxStaffAccounts,
    getMaxBranches,
    getCurrentCounts
  } = useSubscription();
  const { toast } = useToast();
  const [counts, setCounts] = useState({ staffCount: 0, branchCount: 0 });
  const [daysLeft, setDaysLeft] = useState<number>(30);
  const [progress, setProgress] = useState<number>(100);

  // Get current usage counts
  useEffect(() => {
    let isMounted = true;
    const updateCounts = async () => {
      try {
        const currentCounts = await getCurrentCounts();
        if (isMounted) {
          setCounts({
            staffCount: Number(currentCounts.staffCount || 0),
            branchCount: Number(currentCounts.branchCount || 0)
          });
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    updateCounts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Only update subscription status if we have subscription data
    if (subscription) {
      const endDate = isTrial 
        ? new Date(subscription.trialEndDate) 
        : new Date(subscription.currentPeriodEnd);
      const now = new Date();
      const totalDays = isTrial ? 30 : 31;
      const remaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, remaining);
      
      setDaysLeft(daysRemaining);
      setProgress((daysRemaining / totalDays) * 100);

      // Show expiration notification only when the status changes
      if (daysRemaining <= 7 && daysRemaining > 0) {
        const toastKey = `subscription-expiry-${daysRemaining}`;
        const lastToast = localStorage.getItem(toastKey);
        if (!lastToast) {
          toast({
            title: "Subscription Expiring Soon",
            description: `Your ${isTrial ? 'trial' : 'subscription'} will expire in ${daysRemaining} days.`,
            variant: "destructive",
            duration: 7000,
          });
          localStorage.setItem(toastKey, Date.now().toString());
        }
      }
    }
  }, [subscription, isTrial]);

  // Separate effect for usage notifications to prevent unnecessary re-renders
  useEffect(() => {
    const maxStaff = getMaxStaffAccounts();
    const maxBranches = getMaxBranches();
    
    if (!maxStaff || !maxBranches) return;

    const staffUsagePercent = (counts.staffCount / maxStaff) * 100;
    const branchUsagePercent = (counts.branchCount / maxBranches) * 100;

    // Use localStorage to prevent duplicate notifications
    const checkAndNotify = (key: string, percent: number, title: string, description: string) => {
      if (percent > 90) {
        const lastNotification = localStorage.getItem(key);
        const now = Date.now();
        if (!lastNotification || now - Number(lastNotification) > 24 * 60 * 60 * 1000) {
          toast({
            title,
            description,
            variant: "destructive",
            duration: 7000,
          });
          localStorage.setItem(key, now.toString());
        }
      }
    };

    checkAndNotify(
      'staff-limit-notification',
      staffUsagePercent,
      "Staff Limit Almost Reached",
      "You're approaching your staff account limit. Consider upgrading your plan."
    );

    checkAndNotify(
      'branch-limit-notification',
      branchUsagePercent,
      "Branch Limit Almost Reached",
      "You're approaching your branch location limit. Consider upgrading your plan."
    );
  }, [counts]);

  if (!currentPlan) return null;

  const plan = SUBSCRIPTION_PLANS[currentPlan];
  const statusVariant = isTrial ? 'secondary' : isActive ? 'default' : 'destructive';
  const statusText = isTrial ? 'Trial' : isActive ? plan.name : 'Expired';

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTrial ? (
                <Clock className="h-5 w-5 text-orange-500" />
              ) : isActive ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <Badge 
                variant={statusVariant}
                className="text-sm font-semibold px-3 py-1"
              >
                {statusText}
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/subscription" className="font-semibold">
                {isTrial ? 'Upgrade Now' : isActive ? 'Manage Plan' : 'Renew Plan'}
              </Link>
            </Button>
          </div>

          {(isTrial || isActive) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Time Remaining</span>
                <span>{daysLeft} days left</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm mt-1">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Staff:</span>
              <span className="font-medium">
                {getMaxStaffAccounts() === Infinity ? 'Unlimited' : getMaxStaffAccounts()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Branches:</span>
              <span className="font-medium">
                {getMaxBranches() === Infinity ? 'Unlimited' : getMaxBranches()}
              </span>
            </div>
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-amber-600 mt-1">
              <AlertCircle className="h-4 w-4" />
              <span>Cancels at period end</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
