import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, Product } from '@/services/inventoryService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useProducts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['products', user?.role],
    queryFn: () => inventoryService.getProducts(user?.role),
    enabled: !!user,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => inventoryService.getProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => 
      inventoryService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (user?.id) queryClient.invalidateQueries({ queryKey: ['inventory-analytics', user.id] });
      toast({
        title: "Product created",
        description: "Product has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ productId, updates }: { productId: string; updates: Partial<Product> }) =>
      inventoryService.updateProduct(productId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (user?.id) queryClient.invalidateQueries({ queryKey: ['inventory-analytics', user.id] });
      toast({
        title: "Product updated",
        description: "Product has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (productId: string) => inventoryService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (user?.id) queryClient.invalidateQueries({ queryKey: ['inventory-analytics', user.id] });
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });
};

// Analytics hooks using real Supabase data
export const useInventoryAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get real analytics data from Supabase
      const products = await inventoryService.getProducts(user.role);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('user_id', user.id);

      if (ordersError) throw ordersError;

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(p => p.stock <= p.min_stock).length || 0;
      const totalValue = products?.reduce((sum, p) => sum + (p.stock * p.sell_price), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      return {
        totalProducts,
        lowStockProducts,
        totalValue,
        totalOrders,
        totalRevenue
      };
    },
    enabled: !!user,
  });
};

export const useLowStockProducts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['low-stock-products', user?.id],
    queryFn: () => inventoryService.getLowStockProducts(),
    enabled: !!user,
  });
};

export const useExpiringProducts = (days: number = 30) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['expiring-products', user?.id, days],
    queryFn: () => inventoryService.getExpiringProducts(days),
    enabled: !!user,
  });
};

// Suppliers hooks
export const useSuppliers = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (supplier: any) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier created",
        description: "Supplier has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create supplier",
        variant: "destructive",
      });
    },
  });
};

// Purchase Orders hooks
export const usePurchaseOrders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (purchaseOrder: any) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([{ ...purchaseOrder, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: "Purchase order created",
        description: "Purchase order has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });
};

export const usePurchaseOrderItems = (purchaseOrderId: string) => {
  return useQuery({
    queryKey: ['purchase-order-items', purchaseOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', purchaseOrderId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!purchaseOrderId,
  });
};

// Sales Analytics hook
export const useSalesAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sales-analytics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};
