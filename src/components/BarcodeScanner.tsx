import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scan, Search, Package, AlertTriangle, Camera, CameraOff, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inventoryService } from "@/services/inventoryService";
import { useAuth } from "@/contexts/AuthContext";
import QrReader from "react-qr-barcode-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Update Product interface to match backend fields
interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  sell_price: number;
  category: string;
}

const BarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState("");
  const [addProduct, setAddProduct] = useState({ name: '', barcode: '', price: '', category: '', stock: '', minStock: '' });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const role = user?.role;
        const supaProducts = await inventoryService.getProducts(role);
        // Map to local Product interface
        setProducts(
          supaProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || p.id,
            stock: p.stock,
            min_stock: p.min_stock,
            sell_price: p.sell_price || p.price || 0,
            category: p.category || "-"
          }))
        );
      } catch (err) {
        toast({
          title: "Error loading products",
          description: "Could not fetch inventory from Supabase.",
          variant: "destructive"
        });
      }
      setLoading(false);
    };
    fetchProducts();
  }, [user]);

  const handleScan = async (code: string) => {
    if (lastScanned === code) return;
    setLastScanned(code);
    setScannedCode(code);
    const product = products.find(p => p.sku === code || p.id === code);
    if (product) {
      // Fetch real details from backend
      const realProduct = await inventoryService.getProduct(product.id);
      // Ensure all required fields are present
      const mergedProduct: Product = {
        id: realProduct?.id || product.id,
        name: realProduct?.name || product.name,
        sku: realProduct?.sku || realProduct?.barcode || product.sku || product.id,
        stock: realProduct?.stock ?? product.stock,
        min_stock: realProduct?.min_stock ?? product.min_stock,
        sell_price: realProduct?.sell_price || realProduct?.price || product.sell_price || 0,
        category: realProduct?.category || product.category || "-"
      };
      setFoundProduct(mergedProduct);
      toast({
        title: "Product Found!",
        description: `${mergedProduct.name} - Stock: ${mergedProduct.stock}`,
      });
    } else {
      setPendingBarcode(code);
      setAddProduct({ name: '', barcode: code, price: '', category: '', stock: '', minStock: '' });
      setShowAddProduct(true);
    }
  };

  const handleCameraError = (error: any) => {
    console.error("Camera error:", error);
    setCameraError("Camera access denied or not available. Please check permissions.");
    setIsScanning(false);
  };

  const handleCameraStart = () => {
    setCameraError(null);
    setLastScanned(null);
    setIsScanning(true);
  };

  const handleCameraStop = () => {
    setIsScanning(false);
    setCameraError(null);
  };

  const simulateBarcodeScan = () => {
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    handleScan(randomProduct.sku);
  };

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock);

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await inventoryService.createProduct({
        name: addProduct.name,
        sku: addProduct.barcode,
        price: Number(addProduct.price),
        sell_price: Number(addProduct.price),
        category: addProduct.category,
        stock: Number(addProduct.stock),
        min_stock: Number(addProduct.minStock),
        status: 'in-stock' as const,
        buy_price: 0,
      });
      toast({ title: 'Product added!', description: addProduct.name });
      setShowAddProduct(false);
      setAddProduct({ name: '', barcode: '', price: '', category: '', stock: '', minStock: '' });
      // Optionally refetch products
    } catch (err: any) {
      toast({ title: 'Failed to add product', description: err.message, variant: 'destructive' });
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Scanner */}
          {isScanning && (
            <div className="relative">
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <QrReader
                  onUpdate={(err, result) => {
                    if (result) {
                      handleScan(result.getText());
                    }
                    if (err) {
                      handleCameraError(err);
                    }
                  }}
                  onError={handleCameraError}
                  width={"100%"}
                  height={300}
                />
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleCameraStop}
                >
                  <CameraOff className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Point camera at barcode to scan
              </div>
            </div>
          )}

          {/* Camera Controls */}
          {!isScanning && (
            <div className="flex gap-2">
              <Button 
                onClick={handleCameraStart}
                className="flex-1"
                disabled={loading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Scanner
              </Button>
              <Button 
                onClick={simulateBarcodeScan}
                variant="outline"
                disabled={loading || products.length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Demo Scan
              </Button>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{cameraError}</p>
              <p className="text-red-600 text-xs mt-1">
                Try refreshing the page or check browser camera permissions.
              </p>
            </div>
          )}

          {/* Manual Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode manually"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
            />
            <Button onClick={() => handleScan(scannedCode)} disabled={!scannedCode || loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center text-gray-500 py-4">Loading inventory...</div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="text-center text-gray-500 py-4">No products found in inventory.</div>
          )}

          {/* Found Product */}
          {foundProduct && (
            <div className="p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold text-lg">{foundProduct.name}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p>Stock: <span className="font-medium">{foundProduct.stock}</span></p>
                <p>Price: <span className="font-medium">TZS {foundProduct.sell_price.toLocaleString()}</span></p>
                <p>Category: <span className="font-medium">{foundProduct.category}</span></p>
                <p>Barcode: <span className="font-medium">{foundProduct.sku}</span></p>
              </div>
              {foundProduct.stock <= foundProduct.min_stock && (
                <Badge variant="destructive" className="mt-2">
                  Low Stock Alert
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {!loading && lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">Current: {product.stock} | Min: {product.min_stock}</p>
                  </div>
                  {/* Reorder button removed for both wholesaler and retailer */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProductSubmit} className="space-y-3">
            <Input placeholder="Barcode" value={addProduct.barcode} disabled />
            <Input placeholder="Name" value={addProduct.name} onChange={e => setAddProduct(p => ({ ...p, name: e.target.value }))} required />
            <Input placeholder="Category" value={addProduct.category} onChange={e => setAddProduct(p => ({ ...p, category: e.target.value }))} required />
            <Input placeholder="Price" type="number" value={addProduct.price} onChange={e => setAddProduct(p => ({ ...p, price: e.target.value }))} required />
            <Input placeholder="Stock" type="number" value={addProduct.stock} onChange={e => setAddProduct(p => ({ ...p, stock: e.target.value }))} required />
            <Input placeholder="Min Stock Level" type="number" value={addProduct.minStock} onChange={e => setAddProduct(p => ({ ...p, minStock: e.target.value }))} required />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)} disabled={addLoading}>Cancel</Button>
              <Button type="submit" disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Product'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarcodeScanner;
