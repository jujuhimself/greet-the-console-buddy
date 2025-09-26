
import React from "react";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

type ViewMode = "grid" | "list";
interface ProductViewControlsProps {
  productCount: number;
  totalProducts: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ProductViewControls = ({
  productCount,
  totalProducts,
  viewMode,
  setViewMode
}: ProductViewControlsProps) => (
  <div className="flex justify-between items-center mb-6">
    <p className="text-sm text-gray-600">
      Showing {productCount} of {totalProducts} products
    </p>
    <div className="flex gap-2">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("grid")}
        aria-label="Grid view"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("list")}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default ProductViewControls;
