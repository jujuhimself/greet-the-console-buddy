
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    activeRetailers: number;
    lowStockItems: number;
  };
}

const WholesaleStatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">TZS {stats.totalRevenue.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Total Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalOrders}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Retailers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.activeRetailers}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Low Stock Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.lowStockItems}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WholesaleStatsCards;
