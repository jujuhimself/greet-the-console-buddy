
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface HealthSummaryProps {
  totalOrders: number;
  recentOrders: any[];
}

const HealthSummary = ({ totalOrders, recentOrders }: HealthSummaryProps) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Health Summary</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/my-orders">View All Orders</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold text-lg">Total Orders</p>
                <p className="text-gray-600">Lifetime medication orders</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{totalOrders}</span>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent orders found</p>
                <Button asChild className="mt-4">
                  <Link to="/catalog">Browse Medicines</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 3).map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.order_number || order.id?.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        TZS {Number(order.total_amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthSummary;
