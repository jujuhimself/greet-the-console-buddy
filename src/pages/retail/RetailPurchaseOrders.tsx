
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ShoppingBag, Truck, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProducts, useSuppliers } from "@/hooks/useInventory";

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  order_date: string;
  expected_delivery?: string;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  items?: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const RetailPurchaseOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<Omit<PurchaseOrderItem, 'id'>[]>([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    expected_delivery: '',
    notes: ''
  });
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0
  });

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          purchase_order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with supplier names
      const enrichedOrders = await Promise.all(
        (data || []).map(async (order) => {
          const supplier = suppliers.find(s => s.id === order.supplier_id);
          return {
            ...order,
            supplier_name: supplier?.name || 'Unknown Supplier',
            items: order.purchase_order_items || []
          };
        })
      );

      setPurchaseOrders(enrichedOrders);
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase orders",
        variant: "destructive",
      });
    }
  };

  const addItemToOrder = () => {
    if (!newItem.product_id || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      toast({
        title: "Invalid Item",
        description: "Please fill all item fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === newItem.product_id);
    if (!product) return;

    const item = {
      product_id: newItem.product_id,
      product_name: product.name,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      total_price: newItem.quantity * newItem.unit_price
    };

    setOrderItems([...orderItems, item]);
    setNewItem({ product_id: '', quantity: 1, unit_price: 0 });
  };

  const removeItemFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const createPurchaseOrder = async () => {
    if (!user || !formData.supplier_id || orderItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier and add at least one item",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate PO number
      const poNumber = `PO-${Date.now()}`;

      // Create purchase order
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
          user_id: user.id,
          po_number: poNumber,
          supplier_id: formData.supplier_id,
          order_date: new Date().toISOString().split('T')[0],
          expected_delivery: formData.expected_delivery || null,
          total_amount: getTotalAmount(),
          status: 'pending',
          notes: formData.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const itemsToInsert = orderItems.map(item => ({
        purchase_order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Purchase Order Created",
        description: `Purchase order ${poNumber} has been created successfully`,
      });

      // Reset form
      setFormData({ supplier_id: '', expected_delivery: '', notes: '' });
      setOrderItems([]);
      setIsCreateDialogOpen(false);
      fetchPurchaseOrders();

    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Purchase order status updated to ${newStatus}`,
      });

      fetchPurchaseOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      'approved': { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      'ordered': { variant: 'outline' as const, label: 'Ordered', icon: ShoppingBag },
      'received': { variant: 'default' as const, label: 'Received', icon: Truck },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelled', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const pendingOrders = purchaseOrders.filter(order => ['pending', 'approved', 'ordered'].includes(order.status));
  const completedOrders = purchaseOrders.filter(order => ['received', 'cancelled'].includes(order.status));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Purchase Orders</h2>
          <p className="text-gray-600">Order from wholesalers and track deliveries</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select value={formData.supplier_id} onValueChange={(value) => setFormData({...formData, supplier_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <Input
                    type="date"
                    value={formData.expected_delivery}
                    onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes or instructions"
                  rows={2}
                />
              </div>

              <div>
                <h3 className="font-medium mb-4">Add Items</h3>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label>Product</Label>
                    <Select value={newItem.product_id} onValueChange={(value) => {
                      const product = products.find(p => p.id === value);
                      setNewItem({
                        ...newItem, 
                        product_id: value,
                        unit_price: product?.buy_price || 0
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (Stock: {product.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.unit_price}
                      onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addItemToOrder} className="w-full">
                      Add Item
                    </Button>
                  </div>
                </div>

                {orderItems.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>TZS {item.unit_price.toLocaleString()}</TableCell>
                            <TableCell>TZS {item.total_price.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItemFromOrder(index)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="font-bold">Total Amount:</TableCell>
                          <TableCell className="font-bold">TZS {getTotalAmount().toLocaleString()}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={createPurchaseOrder} className="flex-1" disabled={orderItems.length === 0}>
                  Create Purchase Order
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Orders ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="all">All Orders ({purchaseOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Active Purchase Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.po_number}</TableCell>
                      <TableCell>{order.supplier_name}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.expected_delivery 
                          ? new Date(order.expected_delivery).toLocaleDateString()
                          : 'TBD'
                        }
                      </TableCell>
                      <TableCell>TZS {order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'approved')}
                            >
                              Approve
                            </Button>
                          )}
                          {order.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'ordered')}
                            >
                              Mark Ordered
                            </Button>
                          )}
                          {order.status === 'ordered' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'received')}
                            >
                              Mark Received
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No active purchase orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedOrders.slice(0, 20).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.po_number}</TableCell>
                      <TableCell>{order.supplier_name}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>TZS {order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.items?.length || 0} items</TableCell>
                    </TableRow>
                  ))}
                  {completedOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No completed purchase orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.slice(0, 50).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.po_number}</TableCell>
                      <TableCell>{order.supplier_name}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>TZS {order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.items?.length || 0} items</TableCell>
                    </TableRow>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No purchase orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RetailPurchaseOrders;
