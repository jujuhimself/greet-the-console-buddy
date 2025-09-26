
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, FileText, Users, BarChart3, Plus, Eye } from "lucide-react";

const WholesaleQuickActions = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild className="h-20 flex flex-col gap-2">
            <Link to="/wholesale/inventory">
              <Package className="h-6 w-6" />
              <span>Manage Inventory</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
            <Link to="/wholesale/purchase-orders">
              <Plus className="h-6 w-6" />
              <span>New Purchase Order</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
            <Link to="/wholesale/retailer-orders">
              <Eye className="h-6 w-6" />
              <span>View Orders</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
            <Link to="/wholesale/analytics">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WholesaleQuickActions;
