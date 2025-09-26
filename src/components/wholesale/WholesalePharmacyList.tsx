
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pharmacy {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: any[];
}

interface WholesalePharmacyListProps {
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const WholesalePharmacyList = ({ 
  pharmacies, 
  selectedPharmacy, 
  onSelectPharmacy, 
  loading, 
  error,
  onRetry 
}: WholesalePharmacyListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Pharmacy Partners ({pharmacies.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-gray-600">Loading pharmacy partners...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-red-600 text-center">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Try Again
              </Button>
            )}
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Building className="h-12 w-12 text-gray-400" />
            <p className="text-gray-600 text-center">No pharmacy partners found.</p>
            <p className="text-sm text-gray-500 text-center">
              Partners will appear here once they place orders with you.
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4 max-h-96 overflow-y-auto">
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedPharmacy?.id === pharmacy.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onSelectPharmacy(pharmacy)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectPharmacy(pharmacy);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {pharmacy.totalOrders} orders
                  </Badge>
                </div>
                {pharmacy.contactPerson && (
                  <p className="text-sm text-gray-600 mb-1">{pharmacy.contactPerson}</p>
                )}
                {pharmacy.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3" />
                    {pharmacy.location}
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    TZS {(pharmacy.totalSpent / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-gray-500">
                    Last: {pharmacy.lastOrderDate ? new Date(pharmacy.lastOrderDate).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WholesalePharmacyList;
