import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, FileText, Users, CreditCard } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '@/services/inventoryService';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'product' | 'order' | 'prescription' | 'credit' | 'customer';
  route?: string;
  icon: React.ReactNode;
}

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchTimeout = setTimeout(async () => {
      await performSearch(query);
      setLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  useEffect(() => {
    (async () => {
      const products = await inventoryService.getProducts();
      setInventory(products);
    })();
  }, []);

  const performSearch = async (searchQuery: string) => {
    const searchResults: SearchResult[] = [];
    const lowercaseQuery = searchQuery.toLowerCase();

    // Search orders
    const orders = await dataService.getOrders();
    orders.forEach(order => {
      if (order.id.toLowerCase().includes(lowercaseQuery) || 
          order.order_number?.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push({
          id: order.id,
          title: `Order #${order.order_number || order.id}`,
          subtitle: `Order ${order.order_type} - ${order.payment_status}`,
          type: 'order',
          route: '/orders',
          icon: <FileText className="h-4 w-4" />
        });
      }
    });

    // Search prescriptions
    const prescriptions = dataService.getPrescriptions();
    prescriptions.forEach(prescription => {
      if (prescription.patientName?.toLowerCase().includes(lowercaseQuery) ||
          prescription.id.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push({
          id: prescription.id,
          title: `Prescription #${prescription.id}`,
          subtitle: `Patient: ${prescription.patientName}`,
          type: 'prescription',
          route: '/prescription-management',
          icon: <FileText className="h-4 w-4" />
        });
      }
    });

    // Search inventory
    inventory.forEach(item => {
      if (item.name?.toLowerCase().includes(lowercaseQuery) ||
          item.category?.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push({
          id: item.id,
          title: item.name,
          subtitle: `${item.category} - Stock: ${item.stock}`,
          type: 'product',
          route: '/inventory-management',
          icon: <Package className="h-4 w-4" />
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.route) {
      navigate(result.route);
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search orders, products, prescriptions..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <Card className="absolute top-full mt-1 w-full z-50 max-h-80 overflow-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No results found
              </div>
            ) : (
              <div>
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center gap-3">
                      {result.icon}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{result.title}</p>
                        <p className="text-xs text-gray-500">{result.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
