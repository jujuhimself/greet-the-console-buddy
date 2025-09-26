
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

interface PharmacyRecentOrdersProps {
  recentOrders: any[];
}

const PharmacyRecentOrders = ({ recentOrders }: PharmacyRecentOrdersProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'packed': return 'bg-blue-500';
      case 'out-for-delivery': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No orders yet</p>
            <Button asChild size="lg">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center p-6 border rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-lg">Order #{order.order_number || order.id}</p>
                  <p className="text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-blue-600">TZS {order.total_amount?.toLocaleString ? order.total_amount.toLocaleString() : order.total_amount}</p>
                </div>
                <Badge className={`${getStatusColor(order.status)} text-white px-3 py-1`}>
                  {order.status?.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full mt-4" size="lg">
              <Link to="/orders">View All Orders</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PharmacyRecentOrders;
