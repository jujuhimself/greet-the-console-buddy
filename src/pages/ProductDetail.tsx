import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Share2, 
  Star, 
  Package, 
  Shield, 
  Truck, 
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ProductActionButtons from "@/components/ProductActionButtons";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product data - in real app, this would come from API
  const product = {
    id: id || "1",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 2500,
    originalPrice: 3000,
    stock: 150,
    manufacturer: "PharmaCorp Ltd",
    dosage: "500mg",
    prescription: false,
    image: "/placeholder.svg",
    description: "Effective pain relief and fever reducer. Suitable for adults and children over 12 years.",
    activeIngredient: "Paracetamol",
    form: "Tablets",
    packSize: "20 tablets",
    expiryDate: "2025-12-31",
    batchNumber: "PC2024001",
    storage: "Store in a cool, dry place below 25°C",
    dosageInstructions: "Adults: 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.",
    contraindications: "Do not use if allergic to paracetamol. Consult doctor if pregnant or breastfeeding.",
    sideEffects: "Rare: skin rash, nausea. Stop use and consult doctor if symptoms persist.",
    rating: 4.5,
    reviewCount: 247,
    inStock: true
  };

  const reviews = [
    {
      id: 1,
      user: "Dr. Sarah M.",
      rating: 5,
      comment: "Excellent quality medication. Patients respond well to this brand.",
      date: "2024-05-15",
      verified: true
    },
    {
      id: 2,
      user: "Pharmacy Manager",
      rating: 4,
      comment: "Good product, reliable supplier. Fast delivery and good packaging.",
      date: "2024-05-10",
      verified: true
    }
  ];

  const relatedProducts = [
    { id: "2", name: "Ibuprofen 400mg", price: 1800, image: "/placeholder.svg", rating: 4.3 },
    { id: "3", name: "Aspirin 300mg", price: 1200, image: "/placeholder.svg", rating: 4.1 }
  ];

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg border"
              />
              {product.originalPrice > product.price && (
                <Badge className="absolute top-4 left-4 bg-red-500">
                  Save TZS {(product.originalPrice - product.price).toLocaleString()}
                </Badge>
              )}
              {product.prescription && (
                <Badge className="absolute top-4 right-4 bg-orange-500">
                  Prescription Required
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">by {product.manufacturer}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{product.rating}</span>
                <span className="text-gray-600">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary">
                  TZS {product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    TZS {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <Badge variant={product.stock > 50 ? "default" : product.stock > 0 ? "destructive" : "secondary"}>
                {product.stock > 50 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
              </Badge>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Pack: {product.packSize}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm">Quality Assured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Licensed Product</span>
              </div>
            </div>

            {/* Product Actions */}
            <ProductActionButtons
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              isWishlisted={isWishlisted}
              onWishlistToggle={handleWishlist}
            />

            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="h-5 w-5 mr-2" />
              Share Product
            </Button>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Usage Instructions</h3>
                    <p className="text-gray-600 leading-relaxed">{product.dosageInstructions}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Key Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Ingredient:</span>
                          <span>{product.activeIngredient}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Form:</span>
                          <span>{product.form}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pack Size:</span>
                          <span>{product.packSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batch Number:</span>
                          <span>{product.batchNumber}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Storage & Safety</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Storage:</span>
                          <p>{product.storage}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Expiry Date:</span>
                          <p>{product.expiryDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Contraindications</h3>
                    <p className="text-gray-600 leading-relaxed">{product.contraindications}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Side Effects</h3>
                    <p className="text-gray-600 leading-relaxed">{product.sideEffects}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Manufacturer Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>Manufacturer:</strong> {product.manufacturer}</p>
                      <p><strong>Batch Number:</strong> {product.batchNumber}</p>
                      <p><strong>Manufacturing Date:</strong> 2024-01-15</p>
                      <p><strong>Expiry Date:</strong> {product.expiryDate}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Write Review
                    </Button>
                  </div>

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
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="related" className="mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Related Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedProducts.map((relatedProduct) => (
                      <Card key={relatedProduct.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                          <h4 className="font-medium mb-2">{relatedProduct.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-primary font-semibold">
                              TZS {relatedProduct.price.toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{relatedProduct.rating}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full mt-3"
                            onClick={() => navigate(`/product/${relatedProduct.id}`)}
                          >
                            View Product
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
