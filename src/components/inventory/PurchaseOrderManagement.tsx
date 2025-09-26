
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign,
  Truck,
  Package,
  AlertCircle,
  Eye,
  Edit,
  Check,
  X
} from "lucide-react";
import { usePurchaseOrders, useCreatePurchaseOrder } from "@/hooks/useInventory";
import CreatePurchaseOrderDialog from "./CreatePurchaseOrderDialog";
import PurchaseOrderDetailsDialog from "./PurchaseOrderDetailsDialog";

const PurchaseOrderManagement = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();

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

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailsDialogOpen(true);
  };

  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending');
  const activeOrders = purchaseOrders.filter(order => ['approved', 'ordered'].includes(order.status));
  const completedOrders = purchaseOrders.filter(order => ['received', 'cancelled'].includes(order.status));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{purchaseOrders.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  TZS {purchaseOrders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
        <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Orders List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders ({purchaseOrders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PurchaseOrdersList orders={purchaseOrders} onViewDetails={handleViewDetails} getStatusColor={getStatusColor} />
        </TabsContent>

        <TabsContent value="pending">
          <PurchaseOrdersList orders={pendingOrders} onViewDetails={handleViewDetails} getStatusColor={getStatusColor} />
        </TabsContent>

        <TabsContent value="active">
          <PurchaseOrdersList orders={activeOrders} onViewDetails={handleViewDetails} getStatusColor={getStatusColor} />
        </TabsContent>

        <TabsContent value="completed">
          <PurchaseOrdersList orders={completedOrders} onViewDetails={handleViewDetails} getStatusColor={getStatusColor} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreatePurchaseOrderDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      <PurchaseOrderDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        purchaseOrderId={selectedOrderId}
      />
    </div>
  );
};

interface PurchaseOrdersListProps {
  orders: any[];
  onViewDetails: (orderId: string) => void;
  getStatusColor: (status: string) => string;
}

const PurchaseOrdersList = ({ orders, onViewDetails, getStatusColor }: PurchaseOrdersListProps) => {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
          <p className="text-gray-600">Create your first purchase order to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    PO #{order.po_number}
                  </h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Order: {new Date(order.order_date).toLocaleDateString()}</span>
                  </div>
                  {order.expected_delivery && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>Expected: {new Date(order.expected_delivery).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>TZS {order.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Supplier: {order.supplier_id ? 'Assigned' : 'TBD'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(order.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {order.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PurchaseOrderManagement;
