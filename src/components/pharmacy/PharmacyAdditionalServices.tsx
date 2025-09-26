
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Package, User } from "lucide-react";

const PharmacyAdditionalServices = () => {
  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Additional Services</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-20 flex-col border-2 hover:bg-gray-50">
            <Link to="/prescription-management">
              <FileText className="h-6 w-6 mb-2" />
              Prescription Management
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col border-2 hover:bg-gray-50">
            <Link to="/inventory-management">
              <Package className="h-6 w-6 mb-2" />
              Inventory Management
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col border-2 hover:bg-gray-50">
            <Link to="/business-tools">
              <User className="h-6 w-6 mb-2" />
              Business Tools
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyAdditionalServices;
