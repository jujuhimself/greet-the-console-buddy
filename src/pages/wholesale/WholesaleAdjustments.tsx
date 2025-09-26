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
import { Plus, ClipboardList, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useInventory";

interface InventoryAdjustment {
  id: string;
  user_id: string;
  product_id: string;
  adjustment_type: 'add' | 'remove';
  quantity: number;
  reason?: string;
  created_at: string;
  product_name?: string;
}

const REASONS = [
  { value: 'expired', label: 'Product Expired' },
  { value: 'damaged', label: 'Product Damaged' },
  { value: 'stolen', label: 'Theft/Loss' },
  { value: 'returned', label: 'Customer Return' },
  { value: 'restock', label: 'New Stock Received' },
  { value: 'correction', label: 'Stock Count Correction' },
  { value: 'promotion', label: 'Promotional Giveaway' },
  { value: 'other', label: 'Other' },
];

const WholesaleAdjustments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    adjustment_type: 'add' as 'add' | 'remove',
    quantity: 0,
    reason: '',
    customReason: '',
    notes: '',
  });

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch product names and properly cast adjustment_type
      const adjustmentsWithProducts = await Promise.all(
        (data || []).map(async (adjustment) => {
          const product = products.find(p => p.id === adjustment.product_id);
          return {
            ...adjustment,
            adjustment_type: adjustment.adjustment_type as 'add' | 'remove',
            product_name: product?.name || 'Unknown Product'
          };
        })
      );

      setAdjustments(adjustmentsWithProducts);
    } catch (error: any) {
      console.error('Error fetching adjustments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory adjustments",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const reasonToSave = formData.reason === 'other'
        ? `Other: ${formData.customReason}${formData.notes ? ' - ' + formData.notes : ''}`
        : `${REASONS.find(r => r.value === formData.reason)?.label || formData.reason}${formData.notes ? ' - ' + formData.notes : ''}`;

      // Create adjustment record
      const { error: adjustmentError } = await supabase
        .from('inventory_adjustments')
        .insert({
          user_id: user.id,
          product_id: formData.product_id,
          adjustment_type: formData.adjustment_type,
          quantity: formData.quantity,
          reason: reasonToSave
        });

      if (adjustmentError) throw adjustmentError;

      // Update product stock
      const product = products.find(p => p.id === formData.product_id);
      if (product) {
        const newStock = formData.adjustment_type === 'add' 
          ? product.stock + formData.quantity
          : product.stock - formData.quantity;

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: Math.max(0, newStock) })
          .eq('id', formData.product_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Adjustment Recorded",
        description: `Inventory adjustment recorded successfully`,
      });

      setFormData({ product_id: '', adjustment_type: 'add', quantity: 0, reason: '', customReason: '', notes: '' });
      setIsDialogOpen(false);
      fetchAdjustments();
    } catch (error: any) {
      console.error('Error creating adjustment:', error);
      toast({
        title: "Error",
        description: "Failed to record inventory adjustment",
        variant: "destructive",
      });
    }
  };

  const getAdjustmentIcon = (type: string) => {
    return type === 'add' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getAdjustmentBadge = (type: string) => {
    return (
      <Badge variant={type === 'add' ? 'default' : 'destructive'}>
        {type === 'add' ? 'Stock Added' : 'Stock Removed'}
      </Badge>
    );
  };

  const totalAdjustments = adjustments.length;
  const stockAdded = adjustments.filter(adj => adj.adjustment_type === 'add').reduce((sum, adj) => sum + adj.quantity, 0);
  const stockRemoved = adjustments.filter(adj => adj.adjustment_type === 'remove').reduce((sum, adj) => sum + adj.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8 w-full max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Adjustments</h2>
          <p className="text-gray-600">Track and manage inventory adjustments with detailed logging</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Inventory Adjustment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Product</Label>
                <Select value={formData.product_id} onValueChange={(value) => setFormData({...formData, product_id: value})}>
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
                <Label>Adjustment Type</Label>
                <Select value={formData.adjustment_type} onValueChange={(value: 'add' | 'remove') => setFormData({...formData, adjustment_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({...formData, reason: value})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.reason === 'other' && (
                <div>
                  <Label>Custom Reason</Label>
                  <Textarea
                    value={formData.customReason}
                    onChange={(e) => setFormData({...formData, customReason: e.target.value})}
                    placeholder="Describe the reason for this adjustment"
                    rows={2}
                  />
                </div>
              )}
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Optional additional details..."
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full">
                Record Adjustment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdjustments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Added</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stockAdded}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Removed</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stockRemoved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Adjustments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustment History ({adjustments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No adjustments recorded yet. Record your first adjustment to get started.
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      {new Date(adjustment.created_at).toLocaleDateString()} {new Date(adjustment.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-medium">{adjustment.product_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAdjustmentIcon(adjustment.adjustment_type)}
                        {getAdjustmentBadge(adjustment.adjustment_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={adjustment.adjustment_type === 'add' ? 'text-green-600' : 'text-red-600'}>
                        {adjustment.adjustment_type === 'add' ? '+' : '-'}{adjustment.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{adjustment.reason}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WholesaleAdjustments;
