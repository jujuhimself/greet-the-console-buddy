
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductActionButtonsProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
  quantity: number;
  setQuantity: (quantity: number) => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
}

const ProductActionButtons = ({ 
  product, 
  quantity, 
  setQuantity, 
  isWishlisted, 
  onWishlistToggle 
}: ProductActionButtonsProps) => {
  const { toast } = useToast();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const handleAddToCart = () => {
    // In a real app, this would add to cart via API
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  const handleQuickOrder = () => {
    // In a real app, this would create an order via API
    toast({
      title: "Order Placed",
      description: `Quick order for ${quantity}x ${product.name} has been submitted.`,
    });
    setIsOrderModalOpen(false);
    setOrderNotes('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Label>Quantity:</Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center"
            min="1"
            max={product.stock}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setIsOrderModalOpen(true)}>
          Quick Order
        </Button>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onWishlistToggle}
          className="flex-1"
        >
          <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </Button>
      </div>

      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Order - {product.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={quantity} readOnly />
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input 
                value={`TZS ${(quantity * product.price).toLocaleString()}`} 
                readOnly 
              />
            </div>
            <div>
              <Label>Special Instructions</Label>
              <Textarea 
                placeholder="Any special delivery or handling instructions..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuickOrder}>
                Place Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductActionButtons;
