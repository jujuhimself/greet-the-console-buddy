import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Search, 
  Eye, 
  Truck,
  Clock,
  CheckCircle,
  Filter,
  Download,
  MapPin
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useWholesaleOrders } from "@/hooks/useOrders";

const WholesaleOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: orders = [], isLoading, isError } = useWholesaleOrders();

  if (!user || user.role !== 'wholesale') {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return <div className="p-8 text-center text-lg">Loading orders...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load orders. Please try again later.</div>;
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.pharmacyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Stats
  const stats = {
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['confirmed', 'packed', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    urgentOrders: orders.filter(o => o.priority === 'urgent').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600 text-lg">Track and manage wholesale orders</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-5 w-5 mr-2" />
              Export Orders
            </Button>
            <Button variant="outline">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-100">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.urgentOrders}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-indigo-100">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">TZS {(stats.totalRevenue / 1000000).toFixed(1)}M</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by order number or pharmacy name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="packed">Packed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No orders found.</div>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{order.order_number}</h3>
                              {order.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-1">{order.pharmacyName || order.pharmacy_id}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {order.pharmacyLocation || ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            TZS {order.total_amount?.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Order Date</p>
                          <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Expected Delivery</p>
                          <p className="font-medium">{order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Order Status</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Payment</p>
                          <Badge className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Truck className="h-4 w-4 mr-1" />
                            Track Order
                          </Button>
                        </div>
                        {/* Status update actions can be added here if needed */}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WholesaleOrders;
