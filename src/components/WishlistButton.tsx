
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type WishlistButtonProps = {
  isInWishlist: boolean;
  onClick: (e: React.MouseEvent) => void;
};

const WishlistButton = ({ isInWishlist, onClick }: WishlistButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    className="absolute bottom-3 right-3 bg-white/80 hover:bg-white"
    onClick={onClick}
  >
    <Heart
      className={`h-4 w-4 ${
        isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
      }`}
    />
  </Button>
);

export default WishlistButton;
