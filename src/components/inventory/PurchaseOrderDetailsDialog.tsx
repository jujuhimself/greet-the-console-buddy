
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  DollarSign, 
  Package, 
  Truck, 
  FileText,
  Building,
  User,
  Phone,
  Mail
} from "lucide-react";
import { usePurchaseOrderItems } from "@/hooks/useInventory";

interface PurchaseOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrderId: string;
}

const PurchaseOrderDetailsDialog = ({ open, onOpenChange, purchaseOrderId }: PurchaseOrderDetailsDialogProps) => {
  const { data: items = [], isLoading } = usePurchaseOrderItems(purchaseOrderId);

  // Mock purchase order data - in real app, you'd fetch this from the API
  const purchaseOrder = {
    id: purchaseOrderId,
    po_number: "PO-2024001",
    status: "pending",
    total_amount: 125000,
    order_date: "2024-01-15",
    expected_delivery: "2024-01-25",
    notes: "Urgent order for stock replenishment",
    supplier: {
      name: "MedSupply Ltd",
      contact_person: "John Doe",
      email: "john@medsupply.com",
      phone: "+255 123 456 789"
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'ordered': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              Purchase Order #{purchaseOrder.po_number}
            </DialogTitle>
            <Badge className={getStatusColor(purchaseOrder.status)}>
              {purchaseOrder.status.replace('-', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{new Date(purchaseOrder.order_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Delivery:</span>
                  <span className="font-medium">
                    {purchaseOrder.expected_delivery 
                      ? new Date(purchaseOrder.expected_delivery).toLocaleDateString()
                      : 'TBD'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">TZS {purchaseOrder.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(purchaseOrder.status)}>
                    {purchaseOrder.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{purchaseOrder.supplier.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>Contact: {purchaseOrder.supplier.contact_person}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{purchaseOrder.supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{purchaseOrder.supplier.phone}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{purchaseOrder.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading items...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items found for this purchase order.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                    <div className="col-span-4">Product</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Unit Price</div>
                    <div className="col-span-2 text-center">Total</div>
                    <div className="col-span-2 text-center">Status</div>
                  </div>
                  
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 last:border-0">
                      <div className="col-span-4">
                        <div className="font-medium">{item.product_name}</div>
                      </div>
                      <div className="col-span-2 text-center">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-center">
                        TZS {item.unit_price.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-center font-medium">
                        TZS {item.total_price.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge variant="secondary">
                          Ordered
                        </Badge>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>TZS {items.reduce((sum, item) => sum + item.total_price, 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <div className="flex gap-2">
              {purchaseOrder.status === 'pending' && (
                <Button variant="outline">
                  Approve Order
                </Button>
              )}
              {purchaseOrder.status === 'approved' && (
                <Button variant="outline">
                  Mark as Ordered
                </Button>
              )}
              {purchaseOrder.status === 'ordered' && (
                <Button variant="outline">
                  Receive Items
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                Print PO
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderDetailsDialog;
