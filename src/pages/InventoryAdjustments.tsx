import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { inventoryAdjustmentService, InventoryAdjustment } from '@/services/inventoryAdjustmentService';
import { supabase } from '@/integrations/supabase/client';
import { FaPlus, FaHistory, FaBoxes } from 'react-icons/fa';
import { format } from 'date-fns';

interface Product {
  id: string;
  name: string;
  stock: number;
}

const adjustmentReasons = [
  'Stock Correction',
  'Damaged Goods',
  'Cycle Count',
  'Expired Products',
  'Theft/Loss',
  'Returns',
  'Quality Control',
  'Other'
];

export default function InventoryAdjustments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [adjustmentsData, productsData] = await Promise.all([
        inventoryAdjustmentService.fetchAdjustmentsByUser(user.id),
        fetchProducts()
      ]);
      setAdjustments(adjustmentsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load adjustments and products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (): Promise<Product[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct || !quantity || !reason) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      await inventoryAdjustmentService.createAdjustment({
        user_id: user.id,
        product_id: selectedProduct,
        adjustment_type: adjustmentType,
        quantity: parseInt(quantity),
        reason: `${reason}${notes ? ` - ${notes}` : ''}`
      });

      // Update product stock
      const selectedProductData = products.find(p => p.id === selectedProduct);
      if (selectedProductData) {
        const newStock = adjustmentType === 'add' 
          ? selectedProductData.stock + parseInt(quantity)
          : selectedProductData.stock - parseInt(quantity);

        await supabase
          .from('products')
          .update({ stock: Math.max(0, newStock) })
          .eq('id', selectedProduct);
      }

      toast({
        title: 'Adjustment created successfully',
        description: `Stock ${adjustmentType === 'add' ? 'added' : 'removed'} for product`
      });

      // Reset form
      setSelectedProduct('');
      setAdjustmentType('add');
      setQuantity('');
      setReason('');
      setNotes('');
      setDialogOpen(false);

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error creating adjustment:', error);
      toast({
        title: 'Error creating adjustment',
        description: 'Failed to create inventory adjustment',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === selectedProduct);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading inventory adjustments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Adjustments</h1>
          <p className="text-muted-foreground">
            Manage inventory levels and track adjustments for compliance
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <FaPlus className="h-4 w-4" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Inventory Adjustment</DialogTitle>
              <DialogDescription>
                Add or remove stock from inventory with proper documentation
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <div className="text-sm text-muted-foreground">
                    Current stock: {getSelectedProduct()?.stock || 0}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Adjustment Type *</Label>
                  <Select value={adjustmentType} onValueChange={(value: 'add' | 'remove') => setAdjustmentType(value)} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Stock</SelectItem>
                      <SelectItem value="remove">Remove Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select value={reason} onValueChange={setReason} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional additional details..."
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? 'Creating...' : 'Create Adjustment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
            <FaHistory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adjustments.length}</div>
            <p className="text-xs text-muted-foreground">
              All time adjustments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <FaBoxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adjustments.filter(adj => {
                const adjDate = new Date(adj.created_at);
                const now = new Date();
                return adjDate.getMonth() === now.getMonth() && adjDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Adjustments this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <FaBoxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Available products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Adjustments History */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
          <CardDescription>
            Recent inventory adjustments and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FaHistory className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No adjustments found</p>
              <p className="text-sm">Create your first adjustment to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.slice(0, 20).map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell className="font-medium">
                        {format(new Date(adjustment.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {products.find(p => p.id === adjustment.product_id)?.name || adjustment.product_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={adjustment.adjustment_type === 'add' ? 'default' : 'destructive'}>
                          {adjustment.adjustment_type === 'add' ? 'Add' : 'Remove'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {adjustment.adjustment_type === 'add' ? '+' : '-'}{adjustment.quantity}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {adjustment.reason}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {adjustment.user_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 