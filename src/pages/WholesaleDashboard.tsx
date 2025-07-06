import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, DollarSign, Users, TrendingUp, FileText, BarChart3, Calendar, FileSearch } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BackupScheduleManager from "@/components/BackupScheduleManager";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useReportTemplates, useGenerateReport, useGeneratedReports } from "@/hooks/useReporting";
import ReportModal from "@/components/ReportModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import InventoryForecasting from '@/components/inventory/InventoryForecasting';
import BarcodeScanner from '@/components/BarcodeScanner';

// Add the missing Button import here
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define type for orders
type WholesaleOrder = {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  pharmacy_id?: string;
  pharmacy_name?: string;
};

// Type for retail profile
type RetailerProfile = {
  id: string;
  name: string;
  business_name: string;
};

// Analytics data types
type AnalyticsData = {
  monthlyRevenue: any[];
  topProducts: any[];
  orderTrends: any[];
  retailerDistribution: any[];
};

// Import new components
import WholesaleStatsCards from "@/components/wholesale/WholesaleStatsCards";
import WholesaleQuickActions from "@/components/wholesale/WholesaleQuickActions";
import WholesaleRecentOrders from "@/components/wholesale/WholesaleRecentOrders";
import WholesalePendingApprovalNotice from "@/components/wholesale/WholesalePendingApprovalNotice";

const WholesaleDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeRetailers: 0,
    lowStockItems: 0
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    monthlyRevenue: [],
    topProducts: [],
    orderTrends: [],
    retailerDistribution: []
  });

  // Automated Reporting
  const { data: reportTemplates } = useReportTemplates();
  const { mutate: generateReport, isPending } = useGenerateReport();
  const { data: generatedReports, isLoading: loadingReports } = useGeneratedReports();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { toast } = useToast();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Helper: load orders, stats, retailers
  useEffect(() => {
    if (!user || user.role !== 'wholesale') {
      navigate('/login');
      return;
    }

    if (!user.isApproved) {
      return;
    }

    // Fetch orders from Supabase by wholesaler_id
    async function fetchWholesaleData() {
      // 1. Orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total_amount, status, pharmacy_id')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (orderError) {
        setOrders([]); // fallback
        return;
      }

      // Fetch pharmacy names for display (batch query)
      const pharmacyIds = orderData?.map((o: any) => o.pharmacy_id).filter(Boolean);
      let pharmacies: Record<string, string> = {};
      if (pharmacyIds && pharmacyIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, business_name, name')
          .in('id', pharmacyIds);

        profileData?.forEach((profile: any) => {
          pharmacies[profile.id] = profile.business_name || profile.name;
        });
      }

      const enhancedOrders = (orderData || []).map((order: any) => ({
        ...order,
        pharmacy_name: pharmacies[order.pharmacy_id] || ""
      }));

      setOrders(enhancedOrders);

      // 2. Stats - aggregate from all orders for this wholesaler
      const { data: allOrders } = await supabase
        .from('orders')
        .select('id, total_amount, pharmacy_id')
        .eq('wholesaler_id', user.id);

      const totalRevenue = (allOrders || []).reduce((sum: number, ord: any) => sum + Number(ord.total_amount || 0), 0);
      const totalOrders = (allOrders || []).length || 0;
      const activeRetailers = new Set((allOrders || []).map((o: any) => o.pharmacy_id)).size;

      // Count low stock items (mock, or fetch products if you want)
      let lowStockItems = 0;
      const { data: productData } = await supabase
        .from('products')
        .select('id, stock, min_stock')
        .eq('wholesaler_id', user.id);

      if (productData) {
        lowStockItems = productData.filter((prod: any) => Number(prod.stock) <= Number(prod.min_stock)).length;
      }

      setStats({
        totalRevenue,
        totalOrders,
        activeRetailers,
        lowStockItems
      });

      // 3. Generate analytics data from real data
      const monthlyRevenue = await generateMonthlyRevenueData(allOrders || []);
      const topProducts = await generateTopProductsData(user.id);
      const orderTrends = await generateOrderTrendsData(allOrders || []);
      const retailerDistribution = await generateRetailerDistributionData(allOrders || []);

      setAnalyticsData({
        monthlyRevenue,
        topProducts,
        orderTrends,
        retailerDistribution
      });
    }

    fetchWholesaleData();
  }, [user, navigate]);

  // Helper functions to generate real analytics data
  const generateMonthlyRevenueData = async (orders: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = months.map((month, index) => {
      const monthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate.getFullYear() === currentYear && orderDate.getMonth() === index;
      });
      
      const revenue = monthOrders.reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0);
      
      return {
        month,
        revenue: revenue / 1000000, // Convert to millions
        orders: monthOrders.length
      };
    });

    return monthlyData;
  };

  const generateTopProductsData = async (wholesalerId: string) => {
    // Fetch order items with product information
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        product_name,
        quantity,
        unit_price,
        total_price,
        orders!inner(wholesaler_id)
      `)
      .eq('orders.wholesaler_id', wholesalerId);

    if (!orderItems) return [];

    // Aggregate by product
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orderItems.forEach((item: any) => {
      const productName = item.product_name;
      if (!productStats[productName]) {
        productStats[productName] = { name: productName, quantity: 0, revenue: 0 };
      }
      productStats[productName].quantity += Number(item.quantity || 0);
      productStats[productName].revenue += Number(item.total_price || 0);
    });

    // Convert to array and sort by revenue
    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product, index) => ({
        ...product,
        revenue: product.revenue / 1000000, // Convert to millions
        fill: COLORS[index % COLORS.length]
      }));
  };

  const generateOrderTrendsData = async (orders: any[]) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return weeks.map((week, index) => {
      const weekStart = new Date(currentYear, currentMonth, index * 7 + 1);
      const weekEnd = new Date(currentYear, currentMonth, (index + 1) * 7);
      
      const weekOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });
      
      return {
        week,
        orders: weekOrders.length,
        revenue: weekOrders.reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0) / 1000000
      };
    });
  };

  const generateRetailerDistributionData = async (orders: any[]) => {
    // Get unique pharmacy IDs
    const pharmacyIds = [...new Set(orders.map((order: any) => order.pharmacy_id).filter(Boolean))];
    
    if (pharmacyIds.length === 0) return [];

    // Fetch pharmacy profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, business_name, name')
      .in('id', pharmacyIds);

    if (!profiles) return [];

    // Count orders per pharmacy
    const pharmacyStats: Record<string, { name: string; orders: number; revenue: number }> = {};
    
    orders.forEach((order: any) => {
      const pharmacyId = order.pharmacy_id;
      if (!pharmacyId) return;
      
      const profile = profiles.find((p: any) => p.id === pharmacyId);
      const pharmacyName = profile?.business_name || profile?.name || 'Unknown';
      
      if (!pharmacyStats[pharmacyId]) {
        pharmacyStats[pharmacyId] = { name: pharmacyName, orders: 0, revenue: 0 };
      }
      
      pharmacyStats[pharmacyId].orders += 1;
      pharmacyStats[pharmacyId].revenue += Number(order.total_amount || 0);
    });

    // Convert to array and sort by orders
    return Object.values(pharmacyStats)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)
      .map((pharmacy, index) => ({
        ...pharmacy,
        revenue: pharmacy.revenue / 1000000, // Convert to millions
        fill: COLORS[index % COLORS.length]
      }));
  };

  // Download generated report
  const handleDownload = async (file_path: string) => {
    try {
      const res = await fetch(`https://frgblvloxhcnwrgvjazk.supabase.co/storage/v1/object/public/reports/${file_path}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file_path.split("/").pop() || "report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast({ title: "Report download started", description: "Check your downloads." });
    } catch (e) {
      toast({ title: "Download failed", description: "Could not download the report.", variant: "destructive" });
    }
  };

  if (!user || user.role !== 'wholesale') {
    return <div>Loading...</div>;
  }

  if (!user.isApproved) {
    return <WholesalePendingApprovalNotice logout={logout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wholesale Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your wholesale operations, analytics, and business tools</p>
        </div>

        {/* Quick Access Cards for Forecasting and Barcode Scanner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/wholesale/forecast">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <span role="img" aria-label="Forecast">📈</span> Inventory Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Predict demand, plan stock, and optimize reordering for your wholesale business.</p>
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
        </div>

        <BackupScheduleManager />
        <WholesaleStatsCards stats={stats} />
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button asChild className="h-20 flex-col items-center justify-center text-base font-medium">
              <Link to="/wholesale/inventory">Manage Inventory</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col items-center justify-center text-base font-medium">
              <Link to="/wholesale/purchase-orders">New Purchase Order</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col items-center justify-center text-base font-medium">
              <Link to="/wholesale/orders">View Orders</Link>
            </Button>
            {/* New Quick Actions for Staff, CRM, Adjustments, Audit */}
            <Button asChild variant="outline" className="h-20 flex-col items-center justify-center text-base font-medium">
              <Link to="/wholesale/staff">Staff Management</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col items-center justify-center text-base font-medium">
              <Link to="/wholesale/credit-crm">Credit / CRM</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col items-center justify-center text-base font-medium">
              <Link to="/wholesale/adjustments">Inventory Adjustments</Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col items-center justify-center text-base font-medium">
              <Link to="/wholesale/audit-reports">Audit Reports</Link>
            </Button>
          </div>
        </div>
        <WholesaleRecentOrders orders={orders} />

        {/* Business Analytics Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
              <p className="text-gray-600">Comprehensive insights into your wholesale operations</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setReportModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" asChild>
                <Link to="/wholesale/orders">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Full Analytics
                </Link>
              </Button>
            </div>
          </div>

          {/* Analytics Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Revenue</p>
                    <p className="text-2xl font-bold">TZS {(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                    <p className="text-xs opacity-75">+12% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-75" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    <p className="text-xs opacity-75">+8% from last month</p>
                  </div>
                  <Package className="h-8 w-8 opacity-75" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Avg Order Value</p>
                    <p className="text-2xl font-bold">TZS {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders / 1000).toFixed(0) : 0}K</p>
                    <p className="text-xs opacity-75">+3% from last month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-75" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Active Retailers</p>
                    <p className="text-2xl font-bold">{stats.activeRetailers}</p>
                    <p className="text-xs opacity-75">+2 new this month</p>
                  </div>
                  <Users className="h-8 w-8 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`TZS ${value}M`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, revenue }) => `${name}: TZS ${revenue.toFixed(1)}M`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {analyticsData.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`TZS ${value}M`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Order Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.orderTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Retailer Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Retailer Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.retailerDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value} orders`, 'Orders']} />
                    <Bar dataKey="orders" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Automated Reports Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="text-gray-500">Loading reports...</div>
              ) : !generatedReports || generatedReports.length === 0 ? (
                <div className="text-gray-400">No reports generated yet. Generate your first report to get started.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Name</th>
                        <th className="px-3 py-2 text-left font-semibold">Created</th>
                        <th className="px-3 py-2 text-left font-semibold">Status</th>
                        <th className="px-3 py-2 text-left font-semibold">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReports.slice(0, 3).map((report) => (
                        <tr key={report.id} className="border-t">
                          <td className="px-3 py-2">{report.file_path.split("/").pop()}</td>
                          <td className="px-3 py-2">{new Date(report.created_at).toLocaleString()}</td>
                          <td className="px-3 py-2 capitalize">
                            <span className={
                              report.status === "completed"
                                ? "text-green-700"
                                : report.status === "failed"
                                ? "text-red-700"
                                : "text-blue-700"
                            }>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {report.status === "completed" ? (
                              <Button size="sm" onClick={() => handleDownload(report.file_path)}>Download</Button>
                            ) : (
                              <span className="text-xs text-gray-500">Not ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Generation Modal */}
        <ReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          templates={reportTemplates || []}
          onGenerateReport={({ templateId, parameters }) => {
            generateReport(
              { templateId, parameters },
              {
                onSuccess: () => setReportModalOpen(false),
              }
            );
          }}
          isLoading={isPending}
        />
      </div>
    </div>
  );
};

export default WholesaleDashboard;
