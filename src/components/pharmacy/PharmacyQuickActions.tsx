
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Clock, CreditCard } from "lucide-react";

interface PharmacyQuickActionsProps {
  cartItems: number;
}

const PharmacyQuickActions = ({ cartItems }: PharmacyQuickActionsProps) => {
  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-24 flex-col border-2 hover:bg-gray-50">
            <Link to="/cart">
              <ShoppingCart className="h-8 w-8 mb-2" />
              View Cart ({cartItems})
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col border-2 hover:bg-gray-50">
            <Link to="/orders">
              <Clock className="h-8 w-8 mb-2" />
              Order History
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col border-2 hover:bg-gray-50">
            <Link to="/credit-management">
              <CreditCard className="h-8 w-8 mb-2" />
              Credit Management
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyQuickActions;
