
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Minus, Package, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  stock: number;
  sku: string;
}

interface Adjustment {
  id: string;
  product_id: string;
  product_name: string;
  adjustment_type: 'add' | 'remove';
  quantity: number;
  reason: string;
  created_at: string;
  created_by: string;
  old_stock: number;
  new_stock: number;
}

const InventoryAdjustments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'add' as 'add' | 'remove',
    quantity: 0,
    reason: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchAdjustments();
  }, []);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, sku')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const fetchAdjustments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .select(`
          *,
          products!inventory_adjustments_product_id_fkey(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedAdjustments = (data || []).map((adj: any) => ({
        ...adj,
        product_name: adj.products?.name || 'Unknown Product'
      }));

      setAdjustments(transformedAdjustments);
    } catch (error: any) {
      console.error('Error fetching adjustments:', error);
      toast({
        title: "Error",
        description: "Failed to load adjustment history",
        variant: "destructive",
      });
    }
  };

  const openAdjustDialog = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentForm({ type: 'add', quantity: 0, reason: '' });
    setIsAdjustDialogOpen(true);
  };

  const processAdjustment = async () => {
    if (!selectedProduct || !user || adjustmentForm.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const oldStock = selectedProduct.stock;
      const newStock = adjustmentForm.type === 'add' 
        ? oldStock + adjustmentForm.quantity 
        : Math.max(0, oldStock - adjustmentForm.quantity);

      // Update product stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (stockError) throw stockError;

      // Create adjustment record
      const { error: adjustmentError } = await supabase
        .from('inventory_adjustments')
        .insert({
          user_id: user.id,
          product_id: selectedProduct.id,
          adjustment_type: adjustmentForm.type,
          quantity: adjustmentForm.quantity,
          reason: adjustmentForm.reason,
          old_stock: oldStock,
          new_stock: newStock
        });

      if (adjustmentError) throw adjustmentError;

      // Create inventory movement
      await supabase
        .from('inventory_movements')
        .insert({
          user_id: user.id,
          product_id: selectedProduct.id,
          movement_type: adjustmentForm.type === 'add' ? 'in' : 'out',
          quantity: adjustmentForm.quantity,
          reason: `Adjustment: ${adjustmentForm.reason}`,
          created_by: user.id
        });

      toast({
        title: "Adjustment processed",
        description: `Stock ${adjustmentForm.type === 'add' ? 'increased' : 'decreased'} by ${adjustmentForm.quantity} units`,
      });

      setIsAdjustDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      fetchAdjustments();

    } catch (error: any) {
      console.error('Error processing adjustment:', error);
      toast({
        title: "Error",
        description: "Failed to process adjustment",
        variant: "destructive",
      });
    }
  };

  const getAdjustmentBadge = (type: string) => {
    return type === 'add' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <Plus className="h-3 w-3 mr-1" />
        Added
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <Minus className="h-3 w-3 mr-1" />
        Removed
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Adjustments</h2>
          <p className="text-gray-600">Manage stock levels and track inventory changes</p>
        </div>
      </div>

      {/* Current Stock Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                    {product.stock} units
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAdjustDialog(product)}
                  className="w-full"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Adjust Stock
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Adjustment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Stock Change</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No adjustments recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>{new Date(adjustment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{adjustment.product_name}</TableCell>
                    <TableCell>{getAdjustmentBadge(adjustment.adjustment_type)}</TableCell>
                    <TableCell>{adjustment.quantity}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {adjustment.old_stock} → {adjustment.new_stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{adjustment.reason}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adjust Stock - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Current Stock: {selectedProduct.stock} units</p>
              </div>

              <div>
                <Label>Adjustment Type</Label>
                <Select 
                  value={adjustmentForm.type} 
                  onValueChange={(value: 'add' | 'remove') => 
                    setAdjustmentForm({ ...adjustmentForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock (Increase)</SelectItem>
                    <SelectItem value="remove">Remove Stock (Decrease)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm({ 
                    ...adjustmentForm, 
                    quantity: parseInt(e.target.value) || 0 
                  })}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <Label>Reason *</Label>
                <Select 
                  value={adjustmentForm.reason} 
                  onValueChange={(value) => 
                    setAdjustmentForm({ ...adjustmentForm, reason: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason for adjustment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expired">Product Expired</SelectItem>
                    <SelectItem value="damaged">Product Damaged</SelectItem>
                    <SelectItem value="stolen">Theft/Loss</SelectItem>
                    <SelectItem value="returned">Customer Return</SelectItem>
                    <SelectItem value="restock">New Stock Received</SelectItem>
                    <SelectItem value="correction">Stock Count Correction</SelectItem>
                    <SelectItem value="promotion">Promotional Giveaway</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {adjustmentForm.reason === 'other' && (
                <div>
                  <Label>Custom Reason</Label>
                  <Textarea
                    placeholder="Describe the reason for this adjustment"
                    onChange={(e) => setAdjustmentForm({ 
                      ...adjustmentForm, 
                      reason: e.target.value 
                    })}
                  />
                </div>
              )}

              {adjustmentForm.quantity > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Preview:</strong> Stock will {adjustmentForm.type === 'add' ? 'increase' : 'decrease'} 
                    {' '}from {selectedProduct.stock} to{' '}
                    {adjustmentForm.type === 'add' 
                      ? selectedProduct.stock + adjustmentForm.quantity
                      : Math.max(0, selectedProduct.stock - adjustmentForm.quantity)
                    } units
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={processAdjustment} 
                  disabled={!adjustmentForm.reason || adjustmentForm.quantity <= 0}
                  className="flex-1"
                >
                  Process Adjustment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAdjustDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryAdjustments;
