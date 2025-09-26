import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Search, Filter, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Branch } from '@/services/branchService';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock_level: number;
  buy_price: number;
  sell_price: number;
  status: string;
  branch_id?: string;
}

interface BranchInventoryManagerProps {
  selectedBranch?: Branch | null;
}

const BranchInventoryManager: React.FC<BranchInventoryManagerProps> = ({ selectedBranch: propSelectedBranch }) => {
  const context = useBranch();
  const selectedBranch = propSelectedBranch !== undefined ? propSelectedBranch : context.selectedBranch;
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editProduct, setEditProduct] = useState<InventoryItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addProduct, setAddProduct] = useState({
    name: '',
    category: '',
    stock: 0,
    min_stock_level: 0,
    buy_price: 0,
    sell_price: 0,
    status: 'in-stock',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [adjustProduct, setAdjustProduct] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  useEffect(() => {
    if (selectedBranch) {
      fetchBranchInventory();
    }
  }, [selectedBranch]);

  const fetchBranchInventory = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .order('name');
      if (error) throw error;
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        stock: item.stock || 0,
        min_stock_level: item.min_stock_level || 0,
        buy_price: item.buy_price || 0,
        sell_price: item.sell_price || 0,
        status: item.status || 'in-stock',
        branch_id: item.branch_id
      }));
      setInventory(transformedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analytics
  const totalStockValue = useMemo(() => inventory.reduce((sum, item) => sum + (item.stock * item.buy_price), 0), [inventory]);
  const lowStockCount = useMemo(() => inventory.filter(item => item.stock <= item.min_stock_level).length, [inventory]);
  const outOfStockCount = useMemo(() => inventory.filter(item => item.stock <= 0).length, [inventory]);
  const topProduct = useMemo(() => inventory.reduce((top, item) => (item.stock > (top?.stock || 0) ? item : top), null as InventoryItem | null), [inventory]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (item: InventoryItem) => {
    if (item.stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (item.stock <= item.min_stock_level) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  const handleEditSave = async () => {
    if (!editProduct) return;
    setEditLoading(true);
    setEditError('');
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editProduct.name,
          category: editProduct.category,
          stock: editProduct.stock,
          min_stock_level: editProduct.min_stock_level,
          buy_price: editProduct.buy_price,
          sell_price: editProduct.sell_price,
          status: editProduct.status,
        })
        .eq('id', editProduct.id);
      if (error) throw error;
      setEditProduct(null);
      fetchBranchInventory();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedBranch) return;
    setAddLoading(true);
    setAddError('');
    try {
      const { error } = await supabase.from('products').insert({
        name: addProduct.name,
        category: addProduct.category,
        stock: addProduct.stock,
        min_stock_level: addProduct.min_stock_level,
        buy_price: addProduct.buy_price,
        sell_price: addProduct.sell_price,
        status: addProduct.status,
        branch_id: selectedBranch.id,
      });
      if (error) throw error;
      setAddProductOpen(false);
      setAddProduct({ name: '', category: '', stock: 0, min_stock_level: 0, buy_price: 0, sell_price: 0, status: 'in-stock' });
      fetchBranchInventory();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustProduct) return;
    setAdjustLoading(true);
    setAdjustError('');
    try {
      const newStock = adjustProduct.stock + adjustAmount;
      if (newStock < 0) throw new Error('Stock cannot be negative');
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', adjustProduct.id);
      if (error) throw error;
      setAdjustProduct(null);
      setAdjustAmount(0);
      fetchBranchInventory();
    } catch (err: any) {
      setAdjustError(err.message || 'Failed to adjust stock');
    } finally {
      setAdjustLoading(false);
    }
  };

  if (!selectedBranch) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Branch</h3>
            <p className="text-gray-600">Please select a branch to view its inventory</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <CardTitle>Total Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">${totalStockValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
            <p className="text-sm text-gray-500">{outOfStockCount} out of stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Star className="w-6 h-6 text-green-600" />
            <CardTitle>Top Product</CardTitle>
          </CardHeader>
          <CardContent>
            {topProduct ? (
              <div>
                <p className="font-semibold text-gray-900">{topProduct.name}</p>
                <p className="text-sm text-gray-500">Stock: {topProduct.stock}</p>
              </div>
            ) : (
              <p className="text-gray-500">No products</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Header and Actions */}
      <div className="flex items-center justify-between mt-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Inventory - {selectedBranch.name}
          </h2>
          <p className="text-gray-600">
            Manage inventory for {selectedBranch.name} branch
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setAddProductOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading inventory...</p>
              </div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No products in inventory yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Stock Level</TableHead>
                  <TableHead>Buy Price</TableHead>
                  <TableHead>Sell Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.min_stock_level}</TableCell>
                    <TableCell>${item.buy_price}</TableCell>
                    <TableCell>${item.sell_price}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setEditProduct(item)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAdjustProduct(item)}>
                        Adjust Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editProduct} onOpenChange={open => { if (!open) setEditProduct(null); }}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={editProduct.name} onChange={e => setEditProduct(p => p ? { ...p, name: e.target.value } : p)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input value={editProduct.category} onChange={e => setEditProduct(p => p ? { ...p, category: e.target.value } : p)} required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <Input type="number" value={editProduct.stock} onChange={e => setEditProduct(p => p ? { ...p, stock: Number(e.target.value) } : p)} required min={0} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Min Stock Level</label>
                  <Input type="number" value={editProduct.min_stock_level} onChange={e => setEditProduct(p => p ? { ...p, min_stock_level: Number(e.target.value) } : p)} required min={0} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Buy Price</label>
                  <Input type="number" value={editProduct.buy_price} onChange={e => setEditProduct(p => p ? { ...p, buy_price: Number(e.target.value) } : p)} required min={0} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Sell Price</label>
                  <Input type="number" value={editProduct.sell_price} onChange={e => setEditProduct(p => p ? { ...p, sell_price: Number(e.target.value) } : p)} required min={0} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={editProduct.status} onChange={e => setEditProduct(p => p ? { ...p, status: e.target.value } : p)} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
              {editError && <div className="text-red-600 text-sm">{editError}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditProduct(null)} disabled={editLoading}>Cancel</Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleAddProduct(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input value={addProduct.name} onChange={e => setAddProduct(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input value={addProduct.category} onChange={e => setAddProduct(p => ({ ...p, category: e.target.value }))} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input type="number" value={addProduct.stock} onChange={e => setAddProduct(p => ({ ...p, stock: Number(e.target.value) }))} required min={0} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Min Stock Level</label>
                <Input type="number" value={addProduct.min_stock_level} onChange={e => setAddProduct(p => ({ ...p, min_stock_level: Number(e.target.value) }))} required min={0} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Buy Price</label>
                <Input type="number" value={addProduct.buy_price} onChange={e => setAddProduct(p => ({ ...p, buy_price: Number(e.target.value) }))} required min={0} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Sell Price</label>
                <Input type="number" value={addProduct.sell_price} onChange={e => setAddProduct(p => ({ ...p, sell_price: Number(e.target.value) }))} required min={0} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={addProduct.status} onChange={e => setAddProduct(p => ({ ...p, status: e.target.value }))} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            {addError && <div className="text-red-600 text-sm">{addError}</div>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddProductOpen(false)} disabled={addLoading}>Cancel</Button>
              <Button type="submit" disabled={addLoading}>
                {addLoading ? <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span> : null}
                Add Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!adjustProduct} onOpenChange={open => { if (!open) setAdjustProduct(null); setAdjustAmount(0); }}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {adjustProduct && (
            <form onSubmit={e => { e.preventDefault(); handleAdjustStock(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <Input value={adjustProduct.name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Stock</label>
                <Input value={adjustProduct.stock} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adjust By (use negative to decrease)</label>
                <Input type="number" value={adjustAmount} onChange={e => setAdjustAmount(Number(e.target.value))} required />
              </div>
              {adjustError && <div className="text-red-600 text-sm">{adjustError}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAdjustProduct(null)} disabled={adjustLoading}>Cancel</Button>
                <Button type="submit" disabled={adjustLoading}>
                  {adjustLoading ? <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span> : null}
                  Save Adjustment
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchInventoryManager; 