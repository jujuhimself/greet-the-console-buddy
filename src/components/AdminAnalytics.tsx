
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const AdminAnalytics = () => {
  const salesData = [
    { month: 'Jan', sales: 45000, orders: 120 },
    { month: 'Feb', sales: 52000, orders: 145 },
    { month: 'Mar', sales: 48000, orders: 135 },
    { month: 'Apr', sales: 61000, orders: 170 },
    { month: 'May', sales: 58000, orders: 160 },
    { month: 'Jun', sales: 67000, orders: 185 }
  ];

  const categoryData = [
    { name: 'Painkillers', value: 35, color: '#0f766e' },
    { name: 'Antibiotics', value: 25, color: '#ea580c' },
    { name: 'Equipment', value: 20, color: '#059669' },
    { name: 'Vitamins', value: 12, color: '#7c3aed' },
    { name: 'Others', value: 8, color: '#dc2626' }
  ];

  const metrics = [
    {
      title: "Total Revenue",
      value: "TZS 67M",
      change: "+12.5%",
      trending: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Pharmacies",
      value: "2,847",
      change: "+8.2%",
      trending: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Products Sold",
      value: "45,238",
      change: "+15.3%",
      trending: "up",
      icon: Package,
      color: "text-purple-600"
    },
    {
      title: "Pending Orders",
      value: "234",
      change: "-5.1%",
      trending: "down",
      icon: ShoppingCart,
      color: "text-orange-600"
    }
  ];

  const alerts = [
    {
      type: "warning",
      message: "Low stock alert: 15 products below threshold",
      time: "2 hours ago"
    },
    {
      type: "success",
      message: "New pharmacy registration approved",
      time: "4 hours ago"
    },
    {
      type: "info",
      message: "Monthly report generated successfully",
      time: "6 hours ago"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.trending === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.trending === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`TZS ${value.toLocaleString()}`, "Sales"]} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0f766e" 
                  strokeWidth={3}
                  dot={{ fill: '#0f766e', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {alert.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  )}
                  {alert.type === "success" && (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  {alert.type === "info" && (
                    <Package className="h-5 w-5 text-blue-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
