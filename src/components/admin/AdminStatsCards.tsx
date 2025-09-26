import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, DollarSign, TrendingUp } from "lucide-react";

export interface Stats {
  totalUsers: number;
  pendingApprovals: number;
  totalRevenue: number;
  activeOrders: number;
}

const AdminStatsCards = ({ stats }: { stats: Stats }) => (
  <div className="grid md:grid-cols-4 gap-6 mb-8">
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.totalUsers}</div>
        <div className="flex items-center mt-2">
          <Users className="h-4 w-4 mr-1" />
          <span className="text-sm text-blue-100">All accounts</span>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-yellow-100">Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.pendingApprovals}</div>
        <div className="flex items-center mt-2">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm text-yellow-100">Awaiting review</span>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-green-100">Platform Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          TZS {stats.totalRevenue.toLocaleString()}
        </div>
        <div className="flex items-center mt-2">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="text-sm text-green-100">All completed orders</span>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-purple-100">Active Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.activeOrders}</div>
        <div className="flex items-center mt-2">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm text-purple-100">In progress</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminStatsCards;
