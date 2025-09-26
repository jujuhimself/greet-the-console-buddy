import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import ProductFormDialog from '@/components/ProductFormDialog';
import { useUpdateProduct, useProduct } from '@/hooks/useInventory';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  expiryDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
}

const InventoryManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [showEditProduct, setShowEditProduct] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        if (!user) {
          setInventory([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        console.log('Fetching inventory for user:', user.id, 'role:', user.role);

        let query = supabase.from("products").select("*");
        
        // Role-based filtering
        if (user.role === 'retail') {
          // Retail users see their own products
          query = query.eq('user_id', user.id);
        } else if (user.role === 'wholesale') {
          // Wholesale users see their own products
          query = query.eq('user_id', user.id);
        } else if (user.role === 'admin') {
          // Admins see all products
          // Admins see all products - no additional filter needed
        } else {
          // Other roles don't have inventory management
          setInventory([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await query.order("name");

        if (error) {
          console.error('Inventory fetch error:', error);
          toast({
            title: "Error loading inventory",
            description: error.message,
            variant: "destructive",
          });
          setInventory([]);
          return;
        }

        // Map Supabase data to InventoryItem format
        const mappedInventory: InventoryItem[] = (data || []).map((product: Tables<'products'>) => {
          const quantity = product.stock || 0;
          const minStock = product.min_stock_level || 0;
          const maxStock = product.max_stock || 1000;
          const unitPrice = Number(product.buy_price || 0);
          
          // Determine status based on quantity and expiry
          let status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' = 'in-stock';
          
          if (quantity === 0) {
            status = 'out-of-stock';
          } else if (quantity <= minStock) {
            status = 'low-stock';
          }
          
          // Check if expired (if expiry_date exists)
          if (product.expiry_date) {
            const expiryDate = new Date(product.expiry_date);
            const today = new Date();
            if (expiryDate < today) {
              status = 'expired';
            }
          }

          return {
            id: product.id,
            name: product.name,
            sku: product.sku || `SKU-${product.id}`,
            category: product.category,
            quantity,
            minStock,
            maxStock,
            unitPrice,
            supplier: product.supplier || 'Unknown',
            expiryDate: product.expiry_date || 'No expiry',
            status
          };
        });

        console.log('Mapped inventory:', mappedInventory);
        setInventory(mappedInventory);
      } catch (error) {
        console.error('Unexpected error fetching inventory:', error);
        toast({
          title: "Unexpected error",
          description: "Failed to load inventory.",
          variant: "destructive",
        });
        setInventory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [user, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <TrendingUp className="h-4 w-4" />;
      case 'low-stock': return <AlertTriangle className="h-4 w-4" />;
      case 'out-of-stock': return <TrendingDown className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter(item => item.status === 'in-stock').length,
    lowStock: inventory.filter(item => item.status === 'low-stock').length,
    outOfStock: inventory.filter(item => item.status === 'out-of-stock').length,
    expired: inventory.filter(item => item.status === 'expired').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600 text-lg">Manage your medical inventory and stock levels</p>
          </div>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>

        <ProductFormDialog open={showAddProduct} onOpenChange={setShowAddProduct} />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.inStock}</div>
              <div className="text-sm text-gray-600">In Stock</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.lowStock}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.outOfStock}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold">TZS {stats.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Quantity</th>
                    <th className="text-left p-3">Min/Max</th>
                    <th className="text-left p-3">Unit Price</th>
                    <th className="text-left p-3">Expiry</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.supplier}</div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">{item.sku}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3">
                        <span className={`font-bold ${item.quantity <= item.minStock ? 'text-red-600' : 'text-green-600'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {item.minStock} / {item.maxStock}
                      </td>
                      <td className="p-3">TZS {item.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-sm">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(item.status)}
                          {item.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" onClick={() => { setEditProductId(item.id); setShowEditProduct(true); }}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {editProductId && (
          <ProductFormDialog
            open={showEditProduct}
            onOpenChange={(open) => { setShowEditProduct(open); if (!open) setEditProductId(null); }}
            productId={editProductId}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
