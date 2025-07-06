import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { inventoryService } from '@/services/inventoryService';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService } from '@/services/analyticsService';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  revenue: { period: string; amount: number; }[];
  orders: { period: string; count: number; }[];
  topProducts: { name: string; sales: number; revenue: number; }[];
  customerMetrics: { newCustomers: number; returningCustomers: number; totalCustomers: number; };
  inventoryTurnover: { product: string; turnoverRate: number; daysInStock: number; }[];
}

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [customerMetrics, setCustomerMetrics] = useState<any>({ newCustomers: 0, returningCustomers: 0, totalCustomers: 0 });
  const [inventoryTurnover, setInventoryTurnover] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // Date range for analytics
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        // Fetch real-time sales/orders from orders table
        let orderQuery = supabase.from('orders').select('*');
        if (user.role === 'retail') {
          orderQuery = orderQuery.eq('pharmacy_id', user.id);
        } else if (user.role === 'wholesale') {
          orderQuery = orderQuery.eq('wholesaler_id', user.id);
        }
        orderQuery = orderQuery.gte('created_at', start).lte('created_at', end).in('status', ['completed', 'paid']);
        const { data: orders, error: ordersError } = await orderQuery;
        if (ordersError) throw ordersError;
        const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const totalOrders = (orders || []).length;
        setRevenueData([{ period: `${start} - ${end}`, amount: totalRevenue }]);
        setOrdersData([{ period: `${start} - ${end}`, count: totalOrders }]);
        // Top products (by items sold)
        // If you want to show real top products, fetch from product_analytics or join with products
        setTopProducts([]); // No real top products logic yet
        // Customer metrics
        setCustomerMetrics({
          newCustomers: 0, // Not available in current schema
          returningCustomers: 0, // Not available in current schema
          totalCustomers: 0 // Will be set below
        });
        // Inventory turnover (not available, show message)
        setInventoryTurnover([]);
        // Fetch customer count
        const customers = await analyticsService.getCustomerAnalytics();
        setCustomerMetrics(metrics => ({ ...metrics, totalCustomers: customers.length }));
      } catch (err) {
        setError('Failed to load analytics. Please try again later.');
      }
      setLoading(false);
    })();
  }, [user, timeframe]);

  const revenueGrowth = revenueData.length > 1 ? (((revenueData[revenueData.length - 1].amount - revenueData[revenueData.length - 2].amount) / (revenueData[revenueData.length - 2].amount || 1)) * 100).toFixed(1) : '0';
  const orderGrowth = ordersData.length > 1 ? (((ordersData[ordersData.length - 1].count - ordersData[ordersData.length - 2].count) / (ordersData[ordersData.length - 2].count || 1)) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  TZS {revenueData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {parseFloat(revenueGrowth) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${parseFloat(revenueGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {revenueGrowth}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">
                  {ordersData.reduce((sum, item) => sum + item.count, 0)}
                </p>
                <div className="flex items-center mt-1">
                  {parseFloat(orderGrowth) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${parseFloat(orderGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {orderGrowth}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">{customerMetrics.totalCustomers}</p>
                <p className="text-sm text-gray-500">
                  {customerMetrics.newCustomers} new this period
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold">
                  {/* Not available in current analytics, show 0 or message */}
                  0
                </p>
                <p className="text-sm text-gray-500">
                  0 unique products
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-500 py-6">Loading revenue trend...</div>
              ) : revenueData.length === 0 ? (
                <div className="text-center text-gray-500 py-6">Revenue trend will appear here once you have sales data.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`TZS ${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-500 py-6">Loading order volume...</div>
              ) : ordersData.length === 0 ? (
                <div className="text-center text-gray-500 py-6">Order volume will appear here once you have order data.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-500 py-6">Loading top products...</div>
              ) : topProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-6">Top products will appear here once you have product sales data.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`TZS ${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-500 py-6">Loading inventory turnover...</div>
              ) : inventoryTurnover.length === 0 ? (
                <div className="text-center text-gray-500 py-6">Inventory turnover will appear here once you have inventory movement data.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryTurnover}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="turnoverRate" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {error && <div className="text-center text-red-500 py-4">{error}</div>}
    </div>
  );
};
