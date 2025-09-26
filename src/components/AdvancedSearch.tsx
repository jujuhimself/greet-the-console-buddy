import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Star,
  Package,
  Shield,
  Clock
} from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  manufacturer: string;
  prescription: string;
  rating: number;
  availability: string;
  sortBy: string;
  tags: string[];
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

const AdvancedSearch = ({ onSearch, onReset }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    priceRange: [0, 100000],
    manufacturer: "",
    prescription: "",
    rating: 0,
    availability: "",
    sortBy: "relevance",
    tags: []
  });

  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Pain Relief", "Antibiotics", "Vitamins & Supplements", "Heart & Blood Pressure",
    "Diabetes Care", "Respiratory", "Digestive Health", "Mental Health", "Skin Care"
  ];

  const manufacturers = [
    "PharmaCorp Ltd", "MediTech Industries", "HealthPlus Pharma", "BioMed Solutions",
    "Global Pharmaceuticals", "Wellness Labs", "CureMed Inc", "VitalCare"
  ];

  const availableTags = [
    "Fast Acting", "Long Lasting", "Sugar Free", "Gluten Free", "Natural",
    "Pediatric", "Generic", "Import", "Local", "Emergency"
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange('tags', newTags);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: "",
      category: "",
      priceRange: [0, 100000],
      manufacturer: "",
      prescription: "",
      rating: 0,
      availability: "",
      sortBy: "relevance",
      tags: []
    };
    setFilters(resetFilters);
    onReset();
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'query' && value) return true;
    if (key === 'category' && value) return true;
    if (key === 'manufacturer' && value) return true;
    if (key === 'prescription' && value) return true;
    if (key === 'rating' && value > 0) return true;
    if (key === 'availability' && value) return true;
    if (key === 'tags' && Array.isArray(value) && value.length > 0) return true;
    if (key === 'priceRange' && Array.isArray(value) && (value[0] > 0 || value[1] < 100000)) return true;
    return false;
  }).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Products
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products, brands, symptoms..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('category', 'Pain Relief')}
            className={filters.category === 'Pain Relief' ? 'bg-primary text-white' : ''}
          >
            Pain Relief
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('prescription', 'false')}
            className={filters.prescription === 'false' ? 'bg-primary text-white' : ''}
          >
            No Prescription
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('availability', 'in-stock')}
            className={filters.availability === 'in-stock' ? 'bg-primary text-white' : ''}
          >
            <Package className="h-4 w-4 mr-1" />
            In Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('rating', 4)}
            className={filters.rating >= 4 ? 'bg-primary text-white' : ''}
          >
            <Star className="h-4 w-4 mr-1" />
            4+ Rating
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.filter(Boolean).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manufacturer */}
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Select value={filters.manufacturer} onValueChange={(value) => handleFilterChange('manufacturer', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Manufacturers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Manufacturers</SelectItem>
                    {manufacturers.filter(Boolean).map(manufacturer => (
                      <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prescription */}
              <div className="space-y-2">
                <Label>Prescription Required</Label>
                <Select value={filters.prescription} onValueChange={(value) => handleFilterChange('prescription', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="true">Prescription Required</SelectItem>
                    <SelectItem value="false">No Prescription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <Label>Minimum Rating</Label>
                <Select value={filters.rating.toString()} onValueChange={(value) => handleFilterChange('rating', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label>Price Range (TZS)</Label>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                  max={100000}
                  min={0}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>TZS {filters.priceRange[0].toLocaleString()}</span>
                  <span>TZS {filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Product Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className={`${filters.tags.includes(tag) ? 'bg-primary text-white' : ''}`}
                  >
                    {tag}
                    {filters.tags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {activeFiltersCount > 0 && `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Clear All
                </Button>
                <Button onClick={() => onSearch(filters)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.query && (
              <Badge variant="secondary" className="gap-1">
                Query: {filters.query}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('query', '')}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', '')}
                />
              </Badge>
            )}
            {filters.manufacturer && (
              <Badge variant="secondary" className="gap-1">
                {filters.manufacturer}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('manufacturer', '')}
                />
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
