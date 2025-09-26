import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";

const PharmacyStore = () => {
  const { pharmacyId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    paymentMethod: "Pay on Delivery",
    orderNotes: "",
    loading: false,
    error: "",
  });
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    const fetchPharmacyAndProducts = async () => {
      setIsLoading(true);
      const { data: pharmacyData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', pharmacyId)
        .single();
      setPharmacy(pharmacyData);
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .or(`pharmacy_id.eq.${pharmacyId},user_id.eq.${pharmacyId}`)
        .gt('stock', 0)
        .not('status', 'eq', 'deleted')
        .or('is_retail_product.eq.true,is_public_product.eq.true')
        .order('name');
      setProducts(productsData || []);
      setIsLoading(false);
    };
    if (pharmacyId) fetchPharmacyAndProducts();
  }, [pharmacyId]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.sell_price || 0) * item.quantity, 0);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowOrderSummary(true);
  };

  const confirmOrder = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to place an order.", variant: "destructive" });
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Empty Cart", description: "Add items to your cart before checking out.", variant: "destructive" });
      return;
    }
    setCheckoutForm(f => ({ ...f, loading: true, error: "" }));
    try {
      const orderItems = cart.map((item: any) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.sell_price,
        total_price: (item.sell_price || 0) * item.quantity,
        pharmacy_id: pharmacyId,
        pharmacy_name: pharmacy?.business_name || pharmacy?.name
      }));
      const orderData = {
        user_id: user.id,
        order_type: 'retail' as const,
        total_amount: getTotalAmount(),
        status: checkoutForm.paymentMethod === 'Card' ? 'completed' : 'pending',
        payment_status: checkoutForm.paymentMethod === 'Card' ? 'paid' : 'unpaid',
        payment_method: checkoutForm.paymentMethod,
        shipping_address: {
          name: checkoutForm.name,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
        },
        items: orderItems,
        notes: checkoutForm.orderNotes,
      };
      // Placeholder for payment integration
      if (checkoutForm.paymentMethod === 'Card') {
        // Simulate payment process
        await new Promise(res => setTimeout(res, 1500));
      }
      await orderService.createPlatformOrder(orderData);
      setCart([]);
      setShowCheckout(false);
      setShowOrderSummary(false);
      toast({ title: "Order Placed", description: "Your order has been placed successfully!" });
      navigate('/checkout-success');
    } catch (err: any) {
      setCheckoutForm(f => ({ ...f, loading: false, error: err.message || 'Failed to place order.' }));
      toast({ title: "Order Error", description: err.message || 'Failed to place order.', variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading store...</div>;
  if (!pharmacy) return <div className="p-8 text-center text-red-600">Pharmacy not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{pharmacy.business_name || pharmacy.name}</CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <MapPin className="h-4 w-4" />
              <span>{pharmacy.address || `${pharmacy.city}, ${pharmacy.region}`}</span>
              <Phone className="h-4 w-4 ml-4" />
              <span>{pharmacy.phone}</span>
            </div>
          </CardHeader>
        </Card>
        <div className="grid md:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">No products available.</div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-2 text-gray-600">TZS {product.sell_price?.toLocaleString()}</div>
                    <Badge variant={product.stock > 0 ? 'default' : 'secondary'}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <Button className="mt-4 w-full" onClick={() => addToCart(product)} disabled={product.stock <= 0}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        {/* Cart Section */}
        {cart.length > 0 && !showCheckout && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="mb-4">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-center py-2 border-b">
                    <span>{item.name} x {item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>Remove</Button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total: TZS {getTotalAmount().toLocaleString()}</span>
                <Button className="w-40" onClick={handleCheckout}>Checkout</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Checkout Form */}
        {showCheckout && !showOrderSummary && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePlaceOrder}>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={checkoutForm.name} onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input value={checkoutForm.phone} onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <Input value={checkoutForm.address} onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select className="border rounded px-2 py-1 w-full" value={checkoutForm.paymentMethod} onChange={e => setCheckoutForm(f => ({ ...f, paymentMethod: e.target.value }))} required>
                    <option value="Pay on Delivery">Pay on Delivery</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Order Notes</label>
                  <Input value={checkoutForm.orderNotes} onChange={e => setCheckoutForm(f => ({ ...f, orderNotes: e.target.value }))} placeholder="Any special instructions..." />
                </div>
                {checkoutForm.error && <div className="text-red-600 text-sm">{checkoutForm.error}</div>}
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={checkoutForm.loading}>{checkoutForm.loading ? 'Placing Order...' : 'Place Order'}</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCheckout(false)} disabled={checkoutForm.loading}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {/* Order Summary */}
        {showOrderSummary && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="font-semibold mb-2">Items:</div>
                <ul>
                  {cart.map((item) => (
                    <li key={item.id} className="flex justify-between items-center py-1 border-b">
                      <span>{item.name} x {item.quantity}</span>
                      <span>TZS {(item.sell_price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 font-semibold">Total: TZS {getTotalAmount().toLocaleString()}</div>
                <div className="mt-2"><b>Payment Method:</b> {checkoutForm.paymentMethod}</div>
                <div className="mt-2"><b>Order Notes:</b> {checkoutForm.orderNotes || 'None'}</div>
              </div>
              {checkoutForm.paymentMethod === 'Card' && (
                <div className="mb-4 p-4 bg-blue-50 rounded">
                  <div className="font-semibold mb-2">Card Payment (Demo)</div>
                  <Input className="mb-2" placeholder="Cardholder Name" required />
                  <Input className="mb-2" placeholder="Card Number" required maxLength={19} />
                  <div className="flex gap-2">
                    <Input className="flex-1" placeholder="MM/YY" required maxLength={5} />
                    <Input className="flex-1" placeholder="CVC" required maxLength={4} />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">(Payment integration placeholder)</div>
                </div>
              )}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={confirmOrder} disabled={checkoutForm.loading}>{checkoutForm.loading ? 'Placing Order...' : 'Confirm Order'}</Button>
                <Button className="flex-1" variant="outline" onClick={() => setShowOrderSummary(false)} disabled={checkoutForm.loading}>Back</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PharmacyStore;
