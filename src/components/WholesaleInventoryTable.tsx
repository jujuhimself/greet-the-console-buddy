import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Edit, Trash2, Plus, Package, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  minStock: number;
  maxStock: number;
  buyPrice: number;
  sellPrice: number;
  supplier: string;
  expiryDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
}

interface WholesaleInventoryTableProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

const WholesaleInventoryTable = ({ 
  products, 
  onUpdateProduct, 
  onDeleteProduct, 
  onAddProduct 
}: WholesaleInventoryTableProps) => {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const form = useForm<Omit<Product, 'id' | 'status'>>();

  const handleBulkAction = (action: string) => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No products selected",
        description: "Please select products to perform bulk actions.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bulk Action",
      description: `${action} applied to ${selectedProducts.size} products`,
    });
    setSelectedProducts(new Set());
  };

  const handleSubmit = (data: Omit<Product, 'id' | 'status'>) => {
    const status: Product['status'] = data.stock <= data.minStock ? 'low-stock' : 'in-stock';
    const productData = {
      ...data,
      status
    };

    if (editingProduct) {
      onUpdateProduct({ ...productData, id: editingProduct.id });
      setEditingProduct(null);
    } else {
      onAddProduct(productData);
      setIsAddDialogOpen(false);
    }

    form.reset();
    toast({
      title: editingProduct ? "Product Updated" : "Product Added",
      description: `${data.name} has been ${editingProduct ? 'updated' : 'added'} successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const ProductForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="buyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buy Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sell Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setEditingProduct(null);
              setIsAddDialogOpen(false);
              form.reset();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Management
          </CardTitle>
          <div className="flex gap-2">
            {selectedProducts.size > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Update Stock')}>
                  Update Stock
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Apply Discount')}>
                  Apply Discount
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('Delete')}>
                  Delete Selected
                </Button>
              </>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <ProductForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input 
                  type="checkbox" 
                  checked={selectedProducts.size === products.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(new Set(products.map(p => p.id)));
                    } else {
                      setSelectedProducts(new Set());
                    }
                  }}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </div>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {product.stock.toLocaleString()}
                    {product.stock <= product.minStock && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Min: {product.minStock}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">Buy: TZS {product.buyPrice}</div>
                  <div className="text-sm text-green-600">Sell: TZS {product.sellPrice}</div>
                </TableCell>
                <TableCell>{product.supplier}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(product.status)}>
                    {product.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product);
                            form.reset(product);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                        </DialogHeader>
                        <ProductForm />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        onDeleteProduct(product.id);
                        toast({
                          title: "Product Deleted",
                          description: `${product.name} has been removed from inventory.`,
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WholesaleInventoryTable;
