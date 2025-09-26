import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Plus, 
  Minus,
  Building,
  Package,
  Calculator,
  Send,
  Save,
  Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
}

interface POItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Retailer {
  id: string;
  name: string;
  email: string;
  location: string;
}

const WholesalePurchaseOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<string>("");
  const [poItems, setPOItems] = useState<POItem[]>([]);
  const [poNumber, setPONumber] = useState("");

  useEffect(() => {
    if (!user || user.role !== 'wholesale') {
      navigate('/login');
      return;
    }

    setPONumber(`PO-${Date.now()}`);

    // Load retailers from Supabase (all retail pharmacies in profiles)
    async function fetchRetailers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, business_name, region, city, address, email')
        .eq('role', 'retail')
        .eq('is_approved', true);

      if (!error && data) {
        setRetailers(
          data.map((r: any) => ({
            id: r.id,
            name: r.business_name,
            email: r.email || "",
            location: [r.city, r.region, r.address].filter(Boolean).join(", "),
          }))
        );
      }
    }
    fetchRetailers();

    // Load products from Supabase for this wholesaler
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, sell_price, category')
        .eq('wholesaler_id', user.id);

      if (!error && data) {
        setProducts(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: Number(p.sell_price ?? 0),
            category: p.category,
          }))
        );
      }
    }
    fetchProducts();
  }, [user, navigate]);

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = poItems.find(item => item.productId === productId);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: POItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      };
      setPOItems([...poItems, newItem]);
    }
  };

  const removeItem = (itemId: string) => {
    setPOItems(poItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setPOItems(poItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return poItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const savePO = () => {
    if (!selectedRetailer || poItems.length === 0) {
      toast({
        title: "Invalid Purchase Order",
        description: "Please select a retailer and add at least one item.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Purchase Order Saved",
      description: `PO ${poNumber} has been saved as draft.`,
    });
  };

  const sendPO = () => {
    if (!selectedRetailer || poItems.length === 0) {
      toast({
        title: "Invalid Purchase Order",
        description: "Please select a retailer and add at least one item.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Purchase Order Sent",
      description: `PO ${poNumber} has been sent to the selected retailer.`,
    });

    setSelectedRetailer("");
    setPOItems([]);
    setPONumber(`PO-${Date.now()}`);
  };

  const selectedRetailerInfo = retailers.find(r => r.id === selectedRetailer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
          <p className="text-gray-600 text-lg">Create and manage purchase orders for retailers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* PO Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* PO Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Purchase Order: {poNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Retailer</label>
                    <Select value={selectedRetailer} onValueChange={setSelectedRetailer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a retailer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {retailers.map((retailer) => (
                          <SelectItem key={retailer.id} value={retailer.id}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {retailer.name} - {retailer.location}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRetailerInfo && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">{selectedRetailerInfo.name}</h4>
                      <p className="text-sm text-gray-600">{selectedRetailerInfo.email}</p>
                      <p className="text-sm text-gray-600">{selectedRetailerInfo.location}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Add Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <h4 className="font-medium text-sm mb-1">{product.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-green-600">TZS {product.price}</span>
                        <Button 
                          size="sm" 
                          onClick={() => addProduct(product.id)}
                          className="h-7 px-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* PO Items */}
            {poItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {poItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>TZS {item.unitPrice}</TableCell>
                          <TableCell className="font-medium">TZS {item.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* PO Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span>{poItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>TZS {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (18%):</span>
                    <span>TZS {calculateTax().toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">TZS {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <Button 
                    onClick={savePO}
                    variant="outline" 
                    className="w-full"
                    disabled={!selectedRetailer || poItems.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button 
                    onClick={sendPO}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedRetailer || poItems.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Purchase Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">POs Created:</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">POs Sent:</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Value:</span>
                    <span className="text-sm font-medium">TZS 1.2M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesalePurchaseOrders;
