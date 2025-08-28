import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Download, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productId?: string;
}

interface InvoiceData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
}

interface Product {
  id: string;
  name: string;
  sell_price: number;
  stock_quantity: number;
}

export function InvoiceGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  });

  // Fetch available products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sell_price, stock_quantity, unit')
        .eq('organization_id', user?.organization_id)
        .gt('stock_quantity', 0)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error fetching products',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add new item to invoice
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      productId: undefined,
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove item from invoice
  const removeItem = (id: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
    calculateTotals();
  };

  // Update item in invoice
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceData(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // If updating product, get price from products
          if (field === 'description') {
            const product = products.find(p => p.name === value);
            if (product) {
              updatedItem.unitPrice = product.sell_price;
              updatedItem.productId = product.id;
            }
          }
          
          // Recalculate total for the item
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          return updatedItem;
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
    calculateTotals();
  };

  // Calculate subtotal, tax, and total
  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.18; // 18% VAT
    const total = subtotal + tax;

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  // Save invoice and deduct stock
  const saveInvoice = async () => {
    try {
      setLoading(true);

      // Validate invoice data
      if (!invoiceData.customerName || invoiceData.items.length === 0) {
        throw new Error('Please fill in customer details and add items');
      }

      // Check stock availability
      for (const item of invoiceData.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;
        
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      // Start a Supabase transaction
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          pharmacy_id: user?.id,
          customer_name: invoiceData.customerName,
          customer_email: invoiceData.customerEmail,
          customer_phone: invoiceData.customerPhone,
          customer_address: invoiceData.customerAddress,
          items: invoiceData.items,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          total: invoiceData.total,
          notes: invoiceData.notes,
          status: 'completed',
          invoice_date: new Date().toISOString(),
          invoice_number: `INV-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Deduct stock for each item
      for (const item of invoiceData.items) {
        if (!item.productId) continue;

        const { error: stockError } = await supabase.rpc('deduct_stock', {
          p_product_id: item.productId,
          p_quantity: item.quantity
        });

        if (stockError) throw stockError;
      }

      toast({
        title: 'Success',
        description: 'Invoice created and stock updated successfully.',
        variant: 'default',
      });

      // Reset form
      setInvoiceData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: ''
      });

      // Refresh products list
      fetchProducts();

    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF invoice
  const generatePDF = async () => {
    // Implementation for PDF generation will be added
    toast({
      title: 'Coming Soon',
      description: 'PDF generation feature is coming soon.',
      variant: 'default',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={invoiceData.customerName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={invoiceData.customerEmail}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="Enter customer email"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={invoiceData.customerPhone}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Enter customer phone"
              />
            </div>
            <div>
              <Label htmlFor="customerAddress">Customer Address</Label>
              <Input
                id="customerAddress"
                value={invoiceData.customerAddress}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, customerAddress: e.target.value }))}
                placeholder="Enter customer address"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {invoiceData.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => {
                          const product = products.find(p => p.id === value);
                          if (product) {
                            updateItem(item.id, 'productId', value);
                            updateItem(item.id, 'description', product.name);
                            updateItem(item.id, 'unitPrice', product.sell_price);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Stock: {product.stock_quantity})
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
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <Input
                        type="number"
                        value={item.total}
                        disabled
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>TZS {invoiceData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (18%):</span>
              <span>TZS {invoiceData.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>TZS {invoiceData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes or special instructions"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={generatePDF}
              disabled={loading || invoiceData.items.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={saveInvoice}
              disabled={loading || invoiceData.items.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
