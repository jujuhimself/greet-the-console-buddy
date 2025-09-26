
import ProductCard from "./ProductCard";

type Product = {
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
  status?: string;
};

type ProductListProps = {
  products: Product[];
  viewMode: "grid" | "list";
  wishlist: string[];
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
  userRole?: string;
};

const ProductList = ({
  products,
  viewMode,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onViewDetails,
  userRole
}: ProductListProps) => {
  if (products.length === 0) return null;
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          : "space-y-4"
      }
    >
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          isInWishlist={wishlist.includes(product.id)}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          onViewDetails={onViewDetails}
          userRole={userRole}
        />
      ))}
    </div>
  );
};

export default ProductList;
