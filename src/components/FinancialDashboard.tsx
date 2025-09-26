import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Receipt,
  PieChart,
  Calendar,
  Download
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

// Placeholder default data for production: empty analytics and transactions.
// TODO: Replace with real API/service data retrieval
const placeholderAnalytics = {
  sales: {
    growth: 0,
    daily: [],
    totalOrders: 0,
    averageOrderValue: 0,
    monthly: 0,
  },
  customers: {
    total: 0,
    active: 0,
    retention: 0,
  },
  inventory: {
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
  },
  topProducts: [],
};
type FinancialTransaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  date: string;
  paymentMethod: string;
};

const FinancialDashboard = () => {
  // Use empty transactions list for now
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [timeFilter, setTimeFilter] = useState("week");

  useEffect(() => {
    // setTransactions(MockDataService.getFinancialTransactions());
    setTransactions([]); // No mock data
  }, []);

  // Use placeholder analytics for now
  const analytics = placeholderAnalytics;

  // Calculate financial metrics
  const totalRevenue = transactions
    .filter(t => t.type === 'sale' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Transaction type distribution
  const transactionTypeData = [
    { name: 'Sales', value: transactions.filter(t => t.type === 'sale').length, color: '#10B981' },
    { name: 'Purchases', value: transactions.filter(t => t.type === 'purchase').length, color: '#F59E0B' },
    { name: 'Refunds', value: transactions.filter(t => t.type === 'refund').length, color: '#EF4444' },
    { name: 'Credits', value: transactions.filter(t => t.type === 'credit').length, color: '#8B5CF6' }
  ];

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'purchase': return 'bg-orange-100 text-orange-800';
      case 'refund': return 'bg-red-100 text-red-800';
      case 'credit': return 'bg-purple-100 text-purple-800';
      case 'payment': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-green-100 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">+{analytics.sales.growth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {netProfit.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-blue-100 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">{profitMargin.toFixed(1)}% margin</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {totalExpenses.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-orange-100 mt-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Operating costs</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {pendingPayments.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-yellow-100 mt-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Outstanding</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.sales.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`TZS ${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="amount" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Transaction Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsPieChart data={transactionTypeData} cx="50%" cy="50%" outerRadius={80}>
                      {transactionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {transactionTypeData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Sales Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Orders:</span>
                  <span className="font-medium">{analytics.sales.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Order Value:</span>
                  <span className="font-medium">TZS {analytics.sales.averageOrderValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Revenue:</span>
                  <span className="font-medium">TZS {analytics.sales.monthly.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Customer Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Customers:</span>
                  <span className="font-medium">{analytics.customers.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Customers:</span>
                  <span className="font-medium">{analytics.customers.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Retention Rate:</span>
                  <span className="font-medium">{analytics.customers.retention}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Inventory Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Products:</span>
                  <span className="font-medium">{analytics.inventory.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inventory Value:</span>
                  <span className="font-medium">TZS {analytics.inventory.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Low Stock Items:</span>
                  <span className="font-medium text-orange-600">{analytics.inventory.lowStock}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {transaction.type === 'sale' && <TrendingUp className="h-5 w-5 text-green-600" />}
                        {transaction.type === 'purchase' && <TrendingDown className="h-5 w-5 text-orange-600" />}
                        {transaction.type === 'refund' && <TrendingDown className="h-5 w-5 text-red-600" />}
                        {transaction.type === 'credit' && <CreditCard className="h-5 w-5 text-purple-600" />}
                        {transaction.type === 'payment' && <DollarSign className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'sale' ? 'text-green-600' : 'text-orange-600'}`}>
                        {transaction.type === 'sale' ? '+' : '-'}TZS {transaction.amount.toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Badge className={getTransactionTypeColor(transaction.type)}>
                          {transaction.type.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">TZS {product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-green-600">{product.margin}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Mobile Money</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bank Transfer</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-sm">30%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Credit</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
