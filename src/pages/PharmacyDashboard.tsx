import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import QuickReorder from "@/components/QuickReorder";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { NotificationService } from "@/components/NotificationSystem";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationSubscription } from "@/hooks/useNotifications";
import PharmacyStatsCards from "@/components/pharmacy/PharmacyStatsCards";
import PharmacyQuickActions from "@/components/pharmacy/PharmacyQuickActions";
import PharmacyAdditionalServices from "@/components/pharmacy/PharmacyAdditionalServices";
import PharmacyRecentOrders from "@/components/pharmacy/PharmacyRecentOrders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logError } from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import BusinessTools from '@/components/BusinessTools';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import InventoryForecasting from '@/components/inventory/InventoryForecasting';
import BarcodeScanner from '@/components/BarcodeScanner';
import BranchManagement from './BranchManagement';

const PharmacyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Ensure real-time notifications are enabled for pharmacy users
  useNotificationSubscription();
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pharmacyDashboardData', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated.");

      // Fetch orders for current pharmacy
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ordersError) {
        logError(ordersError, 'PharmacyDashboard fetch orders');
        throw ordersError;
      }

      // For cart, still use localStorage
      const cart = JSON.parse(localStorage.getItem(`bepawa_cart_${user.id}`) || '[]');

      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: (orders || []).filter((o: any) => o.status === 'pending').length,
        cartItems: cart.length
      };
      
      const recentOrders = (orders || []).slice(0, 5);
      
      return { stats, recentOrders };
    },
    enabled: !!user && user.role === 'retail',
  });

  useEffect(() => {
    if (data && user?.pharmacyName) {
        NotificationService.addSystemNotification(`Welcome back, ${user.pharmacyName}! Your dashboard has been updated.`);
    }
  }, [data, user?.pharmacyName]);

  const stats = data?.stats || { totalOrders: 0, pendingOrders: 0, cartItems: 0 };
  const recentOrders = data?.recentOrders || [];

  useEffect(() => {
    if (!user || user.role !== 'retail') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'retail') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-lg">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <div className="text-red-600 text-lg mb-4">Error loading dashboard: {(error as Error)?.message || "An unknown error occurred."}</div>
            <Button onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <BreadcrumbNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.pharmacyName}
            </h1>
            <p className="text-gray-600 text-lg">Manage your orders and browse our medical product catalog</p>
          </div>

          {/* Quick Access Cards for Forecasting and Barcode Scanner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/pharmacy/forecast">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <span role="img" aria-label="Forecast">📈</span> Inventory Forecasting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Predict demand, plan stock, and optimize reordering for your pharmacy.</p>
                </CardContent>
              </Card>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <span role="img" aria-label="Barcode">🔍</span> Barcode Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Scan product barcodes to quickly find and manage inventory items.</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-full">
                <BarcodeScanner />
              </DialogContent>
            </Dialog>
            <Link to="/retail/branches">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <span role="img" aria-label="Branches">🏢</span> Branch Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage your branches, add new locations, and assign staff.</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/retail/branch-inventory">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <span role="img" aria-label="Inventory">📦</span> Branch Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage inventory for your selected branch.</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <PharmacyStatsCards stats={stats} />
          <QuickReorder />

          {/* Analytics Dashboard */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Business Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>

          <PharmacyQuickActions cartItems={stats.cartItems} />
          <PharmacyAdditionalServices />
          <PharmacyRecentOrders recentOrders={recentOrders} />
          <BusinessTools />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PharmacyDashboard;
