import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminOverviewTab from "@/components/admin/AdminOverviewTab";
import AdminApprovalsTab from "@/components/admin/AdminApprovalsTab";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminAnalyticsTab from "@/components/admin/AdminAnalyticsTab";
import SystemAlertsTab from "@/components/admin/SystemAlertsTab";
import AuditLogsTab from "@/components/admin/AuditLogsTab";
import BackupsExportTab from "@/components/admin/BackupsExportTab";
import ImpersonateUserTab from "@/components/admin/ImpersonateUserTab";
import WhatsAppMessages from "@/pages/admin/WhatsAppMessages";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import { logError } from "@/utils/logger";
import { Badge } from "@/components/ui/badge";
import { useAdminPolicyAction } from "@/hooks/useAdminPolicy";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import { UserAccount } from "@/types/userAccount";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingUsers, setPendingUsers] = useState<UserAccount[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const adminPolicyAction = useAdminPolicyAction();
  
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    activeOrders: 0,
    pharmacies: 0,
    wholesalers: 0,
    labs: 0,
    individuals: 0,
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchUsersWithErrorHandling();
    fetchPlatformRevenue();
  }, [user, navigate]);

  const fetchPlatformRevenue = async () => {
    try {
      let totalRevenue = 0;
      let activeOrders = 0;

      // Check if orders table exists and fetch from it
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .in('status', ['completed', 'delivered', 'paid']);

      if (!ordersError && ordersData) {
        totalRevenue += ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        activeOrders += ordersData.length;
      }

      // Fetch from lab_orders table
      const { data: labOrdersData, error: labOrdersError } = await supabase
        .from('lab_orders')
        .select('total_amount, status')
        .in('status', ['completed'])
        .eq('payment_status', 'paid');

      if (!labOrdersError && labOrdersData) {
        totalRevenue += labOrdersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        activeOrders += labOrdersData.length;
      }

      // Fetch from prescriptions table (if they have payment amounts)
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('status')
        .in('status', ['completed', 'dispensed']);

      if (!prescriptionsError && prescriptionsData) {
        activeOrders += prescriptionsData.length;
        // Note: Prescriptions might not have total_amount field, so we're just counting them
      }

      // Update system stats with real revenue
      setSystemStats(prev => ({
        ...prev,
        totalRevenue,
        activeOrders,
      }));

    } catch (err: any) {
      logError(err, "AdminDashboard fetch platform revenue");
      console.error("Error fetching platform revenue:", err);
    }
  };

  const fetchUsersWithErrorHandling = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, name, email, role, is_approved, business_name, created_at")
        .order("created_at", { ascending: false });
        
      if (fetchError) {
        throw fetchError;
      }

      const users: UserAccount[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name || "Unknown User",
        email: u.email || "No Email",
        role: u.role || "individual",
        status: u.is_approved === null || u.is_approved === false ? "pending" : "approved",
        businessName: u.business_name || "",
        registeredAt: u.created_at ? u.created_at.substring(0, 10) : "",
      }));

      setAllUsers(users);
      setPendingUsers(users.filter((u) => u.status === "pending"));

      setSystemStats(prev => ({
        ...prev,
        totalUsers: users.length,
        pendingApprovals: users.filter((u) => u.status === "pending").length,
        pharmacies: users.filter((u) => u.role === "retail").length,
        wholesalers: users.filter((u) => u.role === "wholesale").length,
        labs: users.filter((u) => u.role === "lab").length,
        individuals: users.filter((u) => u.role === "individual").length,
      }));
    } catch (err: any) {
      logError(err, "AdminDashboard fetch profiles");
      setError(err.message || "Failed to load user data");
      toast({
        title: "Error loading users",
        description: err.message || "Could not load user accounts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const result = await adminPolicyAction.mutateAsync({
        action: 'approve_user',
        targetUserId: userId,
        reason: 'Admin approval from dashboard'
      });

      if (result.success) {
        // Send notification
        try {
          await notificationService.createNotification({
            user_id: userId,
            title: "Account Approved",
            message: "Your account has been approved by the BEPAWA admin. You can now access all features on the platform.",
            type: "success",
          });
        } catch (notifyErr) {
          logError(notifyErr, "Failed to send approval notification");
        }

        // Update local state
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "approved" as const } : u))
        );
        setSystemStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (err: any) {
      logError(err, "Admin approve user exception");
      toast({
        title: "Approval failed",
        description: err.message || "Could not approve account.",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const result = await adminPolicyAction.mutateAsync({
        action: 'reject_user',
        targetUserId: userId,
        reason: 'Admin rejection from dashboard'
      });

      if (result.success) {
        // Send notification
        try {
          await notificationService.createNotification({
            user_id: userId,
            title: "Account Rejected",
            message: "Unfortunately, your BEPAWA account was rejected by the admin. Please contact support@bepawa.com for more info.",
            type: "error",
          });
        } catch (notifyErr) {
          logError(notifyErr, "Failed to send rejection notification");
        }

        // Update local state
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "rejected" as const } : u))
        );
        setSystemStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (err: any) {
      logError(err, "Admin reject user exception");
      toast({
        title: "User Rejection Failed",
        description: err.message || "Could not reject account.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      retail: <span className="h-4 w-4" />,
      wholesale: <span className="h-4 w-4" />,
      lab: <span className="h-4 w-4" />,
      individual: <span className="h-4 w-4" />,
    };
    return iconMap[role] || <span className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-lg">Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="text-red-600 text-lg mb-4">Error loading dashboard: {error}</div>
            <button 
              onClick={fetchUsersWithErrorHandling}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">
              Manage the BEPAWA healthcare platform
            </p>
          </div>
          <AdminStatsCards
            stats={{
              totalUsers: systemStats.totalUsers,
              pendingApprovals: systemStats.pendingApprovals,
              totalRevenue: systemStats.totalRevenue,
              activeOrders: systemStats.activeOrders,
            }}
          />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="alerts">System Alerts</TabsTrigger>
              <TabsTrigger value="logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="tools">Platform Tools</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <AdminOverviewTab systemStats={systemStats} />
            </TabsContent>
            <TabsContent value="users" className="space-y-6">
              <AdminUsersTab
                allUsers={allUsers}
                getRoleIcon={getRoleIcon}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            <TabsContent value="approvals" className="space-y-6">
              <AdminApprovalsTab
                pendingUsers={pendingUsers}
                onApprove={handleApproveUser}
                onReject={handleRejectUser}
                getRoleIcon={getRoleIcon}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-6">
              <AdminAnalyticsTab />
            </TabsContent>
            <TabsContent value="alerts" className="space-y-6">
              <SystemAlertsTab />
            </TabsContent>
            <TabsContent value="logs" className="space-y-6">
              <AuditLogsTab />
            </TabsContent>
            <TabsContent value="whatsapp" className="space-y-6">
              <WhatsAppMessages />
            </TabsContent>
            <TabsContent value="tools" className="space-y-6">
              <BackupsExportTab />
              <ImpersonateUserTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
