
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, FileText, Heart } from "lucide-react";

interface IndividualStats {
  totalOrders: number;
  pendingOrders: number;
  savedItems: number;
  activePrescriptions: number;
}

interface IndividualStatsCardsProps {
  stats: IndividualStats;
}

const IndividualStatsCards = ({ stats }: IndividualStatsCardsProps) => {
  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <Package className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Pending Orders", 
      value: stats.pendingOrders,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Saved Items",
      value: stats.savedItems,
      icon: <Heart className="h-6 w-6" />,
      color: "text-red-600", 
      bgColor: "bg-red-100"
    },
    {
      title: "Active Prescriptions",
      value: stats.activePrescriptions,
      icon: <FileText className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IndividualStatsCards;
