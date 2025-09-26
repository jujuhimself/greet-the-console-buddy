import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, OrderItem, OrderStatusHistory, WholesaleOrder, RetailOrder } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderItems = (orderId: string) => {
  return useQuery({
    queryKey: ['order-items', orderId],
    queryFn: () => orderService.getOrderItems(orderId),
    enabled: !!orderId,
  });
};

export const useCreateOrderItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: orderService.createOrderItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order-items', data.order_id] });
      toast({
        title: "Order item added",
        description: "Order item has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add order item. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating order item:', error);
    },
  });
};

export const useOrderStatusHistory = (orderId: string) => {
  return useQuery({
    queryKey: ['order-status-history', orderId],
    queryFn: () => orderService.getOrderStatusHistory(orderId),
    enabled: !!orderId,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) =>
      orderService.updateOrderStatus(orderId, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-status-history', variables.orderId] });
      toast({
        title: "Order status updated",
        description: "Order status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating order status:', error);
    },
  });
};

// New hooks for fetching orders
export const useWholesaleOrders = () => {
  const { user } = useAuth();
  return useQuery<WholesaleOrder[]>({
    queryKey: ['wholesale-orders', user?.id],
    queryFn: () => user?.id ? orderService.getWholesaleOrders(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
};

export const useRetailOrders = () => {
  const { user } = useAuth();
  return useQuery<RetailOrder[]>({
    queryKey: ['retail-orders', user?.id],
    queryFn: () => user?.id ? orderService.getRetailOrders(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
};
