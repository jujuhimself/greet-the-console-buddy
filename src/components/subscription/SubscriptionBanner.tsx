import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { differenceInDays } from "date-fns";

export const SubscriptionBanner = () => {
  const { userSubscription } = useAuth();

  if (!userSubscription) return null;

  const daysLeft = userSubscription.trialEndDate
    ? differenceInDays(new Date(userSubscription.trialEndDate), new Date())
    : 0;

  const isInTrial = userSubscription.status === 'trial';
  const isExpired = userSubscription.status === 'expired';

  return (
    <Card className={`${isExpired ? 'border-destructive' : isInTrial ? 'border-yellow-400' : 'border-green-500'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          {isInTrial ? 'Trial Period' : isExpired ? 'Subscription Expired' : 'Active Subscription'}
        </CardTitle>
        <CardDescription>
          {isInTrial 
            ? `${daysLeft} days left in your trial`
            : isExpired 
              ? 'Your subscription has expired. Upgrade now to restore access to all features.'
              : 'Your subscription is active.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CreditCard className={`w-5 h-5 ${
              isExpired ? 'text-destructive' : isInTrial ? 'text-yellow-500' : 'text-green-500'
            }`} />
            <div>
              <p className="text-sm font-medium">
                {isInTrial 
                  ? 'Free Trial'
                  : userSubscription.plan.charAt(0).toUpperCase() + userSubscription.plan.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                {isInTrial && 'All features included'}
              </p>
            </div>
          </div>
          <Button variant={isExpired || isInTrial ? "default" : "outline"} asChild>
            <Link to="/subscription">
              {isExpired ? 'Renew Now' : isInTrial ? 'Subscribe Now' : 'Manage Plan'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
