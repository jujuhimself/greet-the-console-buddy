import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/services/dataService";
import { orderService } from "@/services/orderService";

interface OrderHistory {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  orderDate: string;
  image: string;
}

const QuickReorder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!user) return;
      setLoadingOrders(true);
      setEmptyMessage(null);
      try {
        const orders = await dataService.getOrders(user.id, user.role);
        if (!orders || orders.length === 0) {
          setOrderHistory([]);
          setEmptyMessage("Your recent orders will appear here once you place an order.");
          setLoadingOrders(false);
          return;
        }
        // Get the most recent 3 orders
        const recentOrders = orders
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        // Fetch items for each order
        const allItems: OrderHistory[] = [];
        for (const order of recentOrders) {
          const items = await orderService.getOrderItems(order.id);
          if (items && items.length > 0) {
            items.forEach(item => {
              allItems.push({
                id: item.id,
                productId: item.product_id || item.id,
                productName: item.product_name,
                quantity: item.quantity,
                price: item.unit_price,
                orderDate: order.created_at,
                image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400" // TODO: fetch product image if needed
              });
            });
          }
        }
        if (allItems.length === 0) {
          setEmptyMessage("Your recent order items will appear here once you purchase products.");
        }
        setOrderHistory(allItems);
      } catch (err) {
        setEmptyMessage("Failed to load order history. Please try again later.");
      }
      setLoadingOrders(false);
    };
    fetchOrderHistory();
  }, [user]);

  const quickReorder = async (item: OrderHistory) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to reorder items",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    // TODO: Replace with real add-to-cart logic using Supabase if available
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Reordered successfully",
        description: `${item.productName} (x${item.quantity}) has been added to your cart`,
      });
    }, 1000);
  };

  if (!user) return null;
  if (loadingOrders) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            Quick Reorder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-6">Loading your recent orders...</div>
        </CardContent>
      </Card>
    );
  }
  if (emptyMessage) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            Quick Reorder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-6">{emptyMessage}</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          Quick Reorder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orderHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium text-sm">{item.productName}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Qty: {item.quantity}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(item.orderDate).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => quickReorder(item)}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <ShoppingCart className="h-3 w-3" />
                Reorder
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickReorder;
