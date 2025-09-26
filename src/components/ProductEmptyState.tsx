
import React from "react";
import { Package } from "lucide-react";

const ProductEmptyState = () => (
  <div className="text-center py-16">
    <Package className="h-20 w-20 text-gray-400 mx-auto mb-6" />
    <h3 className="text-2xl font-semibold text-gray-600 mb-3">No products found</h3>
    <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria</p>
  </div>
);

export default ProductEmptyState;
