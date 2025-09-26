
import { Badge } from "@/components/ui/badge";

type ProductStatusBadgeProps = {
  stock: number;
  prescription?: boolean;
};

const ProductStatusBadge = ({ stock, prescription }: ProductStatusBadgeProps) => (
  <>
    {stock < 10 && stock > 0 && (
      <Badge variant="destructive" className="absolute top-3 right-3">
        Low Stock
      </Badge>
    )}
    {stock >= 10 && (
      <Badge className="absolute top-3 right-3 bg-green-500">
        In Stock
      </Badge>
    )}
    {stock === 0 && (
      <Badge variant="destructive" className="absolute top-3 right-3">
        Out of Stock
      </Badge>
    )}
    {prescription && (
      <Badge className="absolute top-3 left-3 bg-orange-500">
        Rx
      </Badge>
    )}
  </>
);

export default ProductStatusBadge;
