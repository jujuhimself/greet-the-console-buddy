import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Star,
  Zap 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/use-subscription';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const SubscriptionStatusIndicator = () => {
  const { userSubscription } = useAuth();
  const { currentPlan, isActive, isTrial } = useSubscription();

  if (!userSubscription || !currentPlan) return null;

  const plan = SUBSCRIPTION_PLANS[currentPlan];
  
  // Compute remaining days based on status
  const now = new Date().getTime();
  const daysLeft = isTrial && userSubscription.trialEndDate
    ? Math.max(0, Math.ceil((new Date(userSubscription.trialEndDate).getTime() - now) / (1000 * 60 * 60 * 24)))
    : !isTrial && (userSubscription.subscriptionEnd || userSubscription.currentPeriodEnd)
    ? Math.max(0, Math.ceil(((userSubscription.subscriptionEnd ? new Date(userSubscription.subscriptionEnd) : new Date(userSubscription.currentPeriodEnd)).getTime() - now) / (1000 * 60 * 60 * 24)))
    : 0;

  const daysToRenewal = !isTrial && userSubscription.nextBillingDate
    ? Math.max(0, Math.ceil((new Date(userSubscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const getStatusIcon = () => {
    if (isTrial) return <Clock className="h-3 w-3" />;
    if (isActive) return <CheckCircle2 className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  const getPlanIcon = () => {
    switch (currentPlan) {
      case 'premium': return <Crown className="h-3 w-3" />;
      case 'medium': return <Star className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    if (isTrial) return 'border-amber-200 bg-amber-50 text-amber-700';
    if (!isActive) return 'border-red-200 bg-red-50 text-red-700';
    
    // Different colors for different plans when active
    switch (currentPlan) {
      case 'premium': return 'border-purple-200 bg-purple-50 text-purple-700';
      case 'medium': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`px-2 py-1 h-8 border ${getStatusColor()} hover:opacity-80`}
        >
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span className="text-xs font-medium">
              {isTrial
                ? `${daysLeft}d trial`
                : isActive
                ? `${plan.name} ${daysLeft > 0 ? daysLeft : daysToRenewal}d`
                : plan.name}
            </span>
            {getPlanIcon()}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {isTrial ? 'Free Trial' : 'Active'}
              </span>
            </div>
            <Badge 
              variant={isTrial ? 'secondary' : 'default'} 
              className={`text-xs ${
                currentPlan === 'premium' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                currentPlan === 'medium' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {plan.name}
            </Badge>
          </div>
          
          {(isTrial || isActive) && (
            <div className="text-xs text-muted-foreground">
              {isTrial
                ? `${daysLeft} days remaining in trial`
                : daysLeft > 0
                ? `${daysLeft} days remaining in subscription`
                : daysToRenewal === 0
                ? 'Renews today'
                : `Renews in ${daysToRenewal} days`}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Staff: </span>
              <span className="font-medium">
                {plan.features.maxStaffAccounts === 'unlimited' ? '∞' : plan.features.maxStaffAccounts}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Branches: </span>
              <span className="font-medium">
                {plan.features.maxBranches === 'unlimited' ? '∞' : plan.features.maxBranches}
              </span>
            </div>
          </div>
          
          <Button size="sm" className="w-full" asChild>
            <Link to="/subscription">
              {isTrial ? 'Upgrade Now' : 'Manage Plan'}
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SubscriptionStatusIndicator;