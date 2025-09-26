import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Package, Settings, Users, CheckCircle, AlertCircle, TrendingUp, UserPlus, ShoppingCart, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  systemStats: {
    pharmacies: number;
    wholesalers: number;
    labs: number;
    individuals: number;
  };
}

interface PlatformActivity {
  id: string;
  type: 'user_registration' | 'user_approval' | 'order_placed' | 'system_event';
  title: string;
  description: string;
  timestamp: string;
  user_id?: string;
  user_name?: string;
  business_name?: string;
  order_amount?: number;
}

const AdminOverviewTab = ({ systemStats }: Props) => {
  const [activities, setActivities] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch recent user registrations and approvals
      const { data: recentUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email, role, is_approved, business_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (usersError) throw usersError;

      // Fetch recent orders
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (ordersError) throw ordersError;

      // Fetch user names for orders
      const orderUserIds = recentOrders?.map(order => order.user_id).filter(Boolean) || [];
      const { data: orderUsers } = await supabase
        .from('profiles')
        .select('id, name, business_name')
        .in('id', orderUserIds);

      const userMap = new Map(orderUsers?.map(u => [u.id, u]) || []);

      // Combine and format activities
      const userActivities: PlatformActivity[] = (recentUsers || []).map(user => ({
        id: `user-${user.id}`,
        type: user.is_approved ? 'user_approval' : 'user_registration',
        title: user.is_approved ? 'New user approved' : 'New user registered',
        description: `${user.business_name || user.name || 'Unknown'} - ${user.role}`,
        timestamp: user.created_at,
        user_id: user.id,
        user_name: user.name,
        business_name: user.business_name,
      }));

      const orderActivities: PlatformActivity[] = (recentOrders || []).map(order => {
        const user = userMap.get(order.user_id);
        return {
          id: `order-${order.id}`,
          type: 'order_placed',
          title: 'Order placed',
          description: `TZS ${order.total_amount?.toLocaleString() || '0'} - ${user?.business_name || user?.name || 'Unknown'}`,
          timestamp: order.created_at,
          order_amount: order.total_amount,
        };
      });

      // Combine all activities and sort by timestamp
      const allActivities = [...userActivities, ...orderActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setActivities(allActivities);
    } catch (error: any) {
      console.error('Error fetching recent activities:', error);
      toast({
        title: "Error",
        description: "Failed to load recent platform activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-5 w-5 text-blue-600" />;
      case 'user_approval':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'order_placed':
        return <ShoppingCart className="h-5 w-5 text-purple-600" />;
      case 'system_event':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-50';
      case 'user_approval':
        return 'bg-green-50';
      case 'order_placed':
        return 'bg-purple-50';
      case 'system_event':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return activityTime.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pharmacies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.pharmacies}</div>
            <p className="text-xs text-muted-foreground">Retail partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wholesalers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.wholesalers}</div>
            <p className="text-xs text-muted-foreground">Distribution partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.labs}</div>
            <p className="text-xs text-muted-foreground">Laboratory partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Individuals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.individuals}</div>
            <p className="text-xs text-muted-foreground">Individual users</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading activities...</span>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className={`flex items-center justify-between p-3 ${getActivityBgColor(activity.type)} rounded-lg`}>
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{formatTimeAgo(activity.timestamp)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverviewTab; 