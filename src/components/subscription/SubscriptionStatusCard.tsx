import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Calendar, 
  Users, 
  Building, 
  TrendingUp, 
  Zap,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/use-subscription';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const SubscriptionStatusCard = () => {
  const { userSubscription } = useAuth();
  const { currentPlan, isActive, isTrial, getMaxStaffAccounts, getMaxBranches } = useSubscription();

  if (!userSubscription || !currentPlan) return null;

  const plan = SUBSCRIPTION_PLANS[currentPlan];
  const maxStaffAccounts = getMaxStaffAccounts();
  const maxBranches = getMaxBranches();

  const daysLeft = userSubscription.trialEndDate
    ? Math.max(0, Math.ceil((new Date(userSubscription.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const progress = isTrial ? Math.max(0, (daysLeft / 30) * 100) : 100;

  const getStatusIcon = () => {
    if (isTrial) return <Clock className="h-5 w-5 text-amber-500" />;
    if (isActive) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isTrial) return 'from-amber-500/20 to-orange-500/20 border-amber-200';
    if (isActive) return 'from-emerald-500/20 to-green-500/20 border-emerald-200';
    return 'from-red-500/20 to-red-600/20 border-red-200';
  };

  const getPlanIcon = () => {
    switch (currentPlan) {
      case 'premium': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'medium': return <Star className="h-5 w-5 text-blue-500" />;
      default: return <Zap className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getStatusColor()} border-2 shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold">Subscription Status</h3>
              <Badge 
                variant={isTrial ? 'secondary' : isActive ? 'default' : 'destructive'}
                className="mt-1"
              >
                {isTrial ? 'Free Trial' : isActive ? 'Active' : 'Expired'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPlanIcon()}
            <span className="text-lg font-bold">{plan.name}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Trial Progress */}
        {isTrial && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trial Period</span>
              <span className="font-medium">{daysLeft} days left</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Staff</div>
              <div className="text-xs text-muted-foreground">
                {maxStaffAccounts === Infinity ? 'Unlimited' : maxStaffAccounts} accounts
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Building className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Branches</div>
              <div className="text-xs text-muted-foreground">
                {maxBranches === Infinity ? 'Unlimited' : maxBranches} locations
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Analytics</div>
              <div className="text-xs text-muted-foreground">
                {plan.features.auditReports !== 'none' ? 'Advanced' : 'Basic'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Billing</div>
              <div className="text-xs text-muted-foreground">
                {isTrial ? 'Trial Period' : 'Monthly'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="default" size="sm" asChild className="flex-1">
            <Link to="/subscription">
              {isTrial ? 'Upgrade Now' : isActive ? 'Manage Plan' : 'Renew'}
            </Link>
          </Button>
          {isActive && !isTrial && (
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20">
              Billing Portal
            </Button>
          )}
        </div>

        {/* Next Billing Date */}
        {userSubscription.nextBillingDate && !isTrial && (
          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-white/10">
            Next billing: {formatDistanceToNow(new Date(userSubscription.nextBillingDate), { addSuffix: true })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;