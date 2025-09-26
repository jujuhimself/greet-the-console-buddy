
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Clock } from "lucide-react";

interface PharmacyStatsCardsProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    cartItems: number;
  };
}

const PharmacyStatsCards = ({ stats }: PharmacyStatsCardsProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-blue-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalOrders}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-100">Pending Orders</CardTitle>
          <Clock className="h-4 w-4 text-yellow-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.pendingOrders}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-100">Cart Items</CardTitle>
          <ShoppingCart className="h-4 w-4 text-green-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.cartItems}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyStatsCards;
