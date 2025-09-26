
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Mail, Phone, MapPin, FileText, Calendar, Eye, Package } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: any[];
  total: number;
  status: string;
  paymentStatus: string;
}

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
  orders: Order[];
}

interface WholesalePharmacyDetailsProps {
  pharmacy: Pharmacy | null;
}

const WholesalePharmacyDetails = ({ pharmacy }: WholesalePharmacyDetailsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!pharmacy) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Pharmacy</h3>
          <p className="text-gray-500">Choose a pharmacy from the list to view their order details</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pharmacy Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {pharmacy.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{pharmacy.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{pharmacy.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{pharmacy.location}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{pharmacy.totalOrders}</div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  TZS {(pharmacy.totalSpent / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-gray-500">Total Spent</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order History ({pharmacy.orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pharmacy.orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{order.orderNumber}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      TZS {order.total.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Order Items:</h5>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{item.productName}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>TZS {item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Package className="h-4 w-4 mr-1" />
                    Process Order
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WholesalePharmacyDetails;
