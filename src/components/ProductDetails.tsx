import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2,
  Clock,
  Shield,
  Truck,
  AlertCircle,
  Plus,
  Minus,
  MessageSquare,
  Package,
  Eye,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  manufacturer?: string;
  dosage?: string;
  prescription?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
}

const ProductDetails = ({ product, onAddToCart, onToggleWishlist, isInWishlist }: ProductDetailsProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [customerReview, setCustomerReview] = useState({ rating: 5, comment: "" });

  // Mock data for enhanced product details
  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image
  ];

  const specifications = {
    "Active Ingredient": product.dosage ? `${product.name.split(' ')[0]} ${product.dosage}` : "N/A",
    "Manufacturer": product.manufacturer || "N/A",
    "Form": "Tablet/Capsule",
    "Pack Size": "20-30 units",
    "Storage": "Store in cool, dry place",
    "Expiry": "24 months from manufacture",
    "Batch Number": "PC2024001",
    "Country of Origin": "Tanzania"
  };

  const reviews = [
    {
      id: 1,
      user: "Dr. John M.",
      rating: 5,
      comment: "Excellent quality medication. Patients respond well to this treatment.",
      date: "2024-05-15",
      verified: true,
      helpful: 12
    },
    {
      id: 2,
      user: "Pharmacy Owner",
      rating: 4,
      comment: "Good product, reliable supplier. Fast delivery.",
      date: "2024-05-10",
      verified: true,
      helpful: 8
    },
    {
      id: 3,
      user: "Patient Review",
      rating: 5,
      comment: "Very effective for headaches. No side effects experienced.",
      date: "2024-05-08",
      verified: false,
      helpful: 15
    }
  ];

  const relatedProducts = [
    { id: "rel1", name: "Ibuprofen 400mg", price: 2000, image: product.image, rating: 4.2 },
    { id: "rel2", name: "Aspirin 300mg", price: 1200, image: product.image, rating: 4.0 },
    { id: "rel3", name: "Acetaminophen 650mg", price: 1800, image: product.image, rating: 4.5 },
  ];

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  const handleQuickOrder = () => {
    toast({
      title: "Order Placed",
      description: `Quick order for ${quantity}x ${product.name} has been placed.`,
    });
    setIsQuickOrderOpen(false);
  };

  const handleWishlist = () => {
    onToggleWishlist(product.id);
    toast({
      title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  const handleReviewSubmit = () => {
    toast({
      title: "Review Submitted",
      description: "Thank you for your review. It will be published after moderation.",
    });
    setCustomerReview({ rating: 5, comment: "" });
  };

  const averageRating = product.rating || 4.5;
  const reviewCount = product.reviewCount || reviews.length;

  return (
    <div className="space-y-6">
      {/* Main Product Info */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg border"
              />
              {product.prescription && (
                <Badge className="absolute top-4 left-4 bg-orange-500">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Prescription Required
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => onToggleWishlist(product.id)}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button variant="outline" size="sm" className="bg-white/80">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="bg-white/80">
                  <Camera className="h-4 w-4 mr-1" />
                  Zoom
                </Button>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 border-2 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.manufacturer && (
                <p className="text-lg text-gray-600">by {product.manufacturer}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.dosage && <Badge variant="outline">{product.dosage}</Badge>}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{averageRating}</span>
              <span className="text-gray-600">({reviewCount} reviews)</span>
            </div>

            <div className="space-y-2">
              <span className="text-3xl font-bold text-primary">
                TZS {product.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "destructive" : "secondary"}>
                  <Package className="h-3 w-3 mr-1" />
                  {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                </Badge>
                <span className="text-sm text-gray-500">({product.stock} units available)</span>
              </div>
            </div>

            {/* Product Description Preview */}
            <div className="border-y py-4">
              <p className="text-gray-600 leading-relaxed">
                {showFullDescription ? product.description : `${product.description.substring(0, 150)}...`}
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary hover:underline ml-1"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              </p>
            </div>

            {/* Quick Info Icons */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span>Licensed Product</span>
              </div>
            </div>

            {/* Quantity and Actions */}
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
                <span className="text-sm text-gray-500">
                  Total: TZS {(product.price * quantity).toLocaleString()}
                </span>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Dialog open={isQuickOrderOpen} onOpenChange={setIsQuickOrderOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1" size="lg">
                      Quick Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Quick Order - {product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                        </div>
                        <p className="font-bold">TZS {(product.price * quantity).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label>Special Instructions</Label>
                        <Textarea placeholder="Any special delivery or handling instructions..." />
                      </div>
                      <div>
                        <Label>Delivery Method</Label>
                        <div className="space-y-2 mt-2">
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="delivery" value="standard" defaultChecked />
                            <span>Standard Delivery (2-3 days) - Free</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="delivery" value="express" />
                            <span>Express Delivery (Next day) - TZS 5,000</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsQuickOrderOpen(false)}>
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

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  className="flex-1"
                >
                  <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Information */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="specifications">
              <AccordionTrigger>Specifications & Details</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="usage">
              <AccordionTrigger>Usage Instructions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Dosage</h4>
                    <p className="text-gray-600">Take as directed by healthcare professional. Follow prescription guidelines.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Administration</h4>
                    <p className="text-gray-600">Oral administration with water. Can be taken with or without food.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Warnings</h4>
                    <p className="text-gray-600 text-sm">Keep out of reach of children. Store in original packaging.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reviews">
              <AccordionTrigger>Reviews & Ratings ({reviewCount})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{averageRating}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">Based on {reviewCount} reviews</div>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="flex items-center space-x-2">
                          <span className="text-sm w-3">{star}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${Math.random() * 80 + 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Write Review */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Write a Review</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setCustomerReview(prev => ({ ...prev, rating: star }))}
                            >
                              <Star 
                                className={`h-5 w-5 ${star <= customerReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Your Review</Label>
                        <Textarea
                          value={customerReview.comment}
                          onChange={(e) => setCustomerReview(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Share your experience with this product..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleReviewSubmit} disabled={!customerReview.comment.trim()}>
                        Submit Review
                      </Button>
                    </div>
                  </div>

                  {/* Existing Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="font-medium">{review.user}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-600 mb-2">{review.comment}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button className="hover:text-gray-700">Helpful ({review.helpful})</button>
                          <button className="hover:text-gray-700">Reply</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Shipping Options</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Standard Delivery: 2-3 business days - Free on orders over TZS 50,000</li>
                      <li>• Express Delivery: Next business day - TZS 5,000</li>
                      <li>• Same Day Delivery: Available in Dar es Salaam - TZS 10,000</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Return Policy</h4>
                    <p className="text-gray-600">Returns accepted within 30 days for unopened products. Prescription medications cannot be returned for safety reasons.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Packaging</h4>
                    <p className="text-gray-600">All products are shipped in secure, temperature-controlled packaging to ensure quality and integrity.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Related Products */}
      <Card>
        <CardHeader>
          <CardTitle>Related Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h4 className="font-medium text-gray-800 mb-1">{relatedProduct.name}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-semibold">
                      TZS {relatedProduct.price.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{relatedProduct.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View
                    </Button>
                    <Button size="sm" className="flex-1">
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails;
