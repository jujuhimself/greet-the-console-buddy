import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react";

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  categories: string[];
  totalProducts: number;
}

const ProductFilters = ({ onFiltersChange, categories, totalProducts }: ProductFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilters = [
    searchTerm && { type: 'search', label: `Search: "${searchTerm}"` },
    selectedCategory && { type: 'category', label: `Category: ${selectedCategory}` },
    (priceRange[0] > 0 || priceRange[1] < 100000) && { 
      type: 'price', 
      label: `Price: TZS ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}` 
    },
    stockFilter && { type: 'stock', label: `Stock: ${stockFilter}` },
  ].filter(Boolean) as { type: string; label: string }[];

  const handleFiltersChange = () => {
    onFiltersChange({
      searchTerm,
      selectedCategory,
      priceRange,
      stockFilter,
      sortBy
    });
  };

  const clearFilter = (type: string) => {
    switch (type) {
      case 'search':
        setSearchTerm("");
        break;
      case 'category':
        setSelectedCategory("");
        break;
      case 'price':
        setPriceRange([0, 100000]);
        break;
      case 'stock':
        setStockFilter("");
        break;
    }
    setTimeout(handleFiltersChange, 0);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange([0, 100000]);
    setStockFilter("");
    setSortBy("name");
    setTimeout(handleFiltersChange, 0);
  };

  React.useEffect(() => {
    handleFiltersChange();
  }, [searchTerm, selectedCategory, priceRange, stockFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        
        {/* Mobile Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="sm:hidden border-gray-200 hover:border-primary-300"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-primary-500">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            <SelectItem value="stock">Stock (Low to High)</SelectItem>
            <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 bg-primary-100 text-primary-800 border-primary-200"
            >
              {filter.label}
              <button
                onClick={() => clearFilter(filter.type)}
                className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent className="sm:block">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Filter className="h-5 w-5 mr-2 text-primary-600" />
                Filters
                <Badge variant="outline" className="ml-auto">
                  {totalProducts} products
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-gray-200 focus:border-primary-500">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Stock Status</Label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="border-gray-200 focus:border-primary-500">
                      <SelectValue placeholder="All stock levels" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">All Stock Levels</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Price Range: TZS {priceRange[0].toLocaleString()} - TZS {priceRange[1].toLocaleString()}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    min={0}
                    step={1000}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>TZS 0</span>
                    <span>TZS 100,000+</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ProductFilters;
