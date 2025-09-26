
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labService, LabTest, LabOrder, LabOrderItem } from '@/services/labService';
import { useToast } from '@/hooks/use-toast';

export const useLabTests = () => {
  return useQuery({
    queryKey: ['lab-tests'],
    queryFn: labService.getLabTests,
  });
};

export const useCreateLabTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: labService.createLabTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast({
        title: "Lab test created",
        description: "Lab test has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lab test. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating lab test:', error);
    },
  });
};

export const useLabOrders = () => {
  return useQuery({
    queryKey: ['lab-orders'],
    queryFn: labService.getLabOrders,
  });
};

export const useCreateLabOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: labService.createLabOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      toast({
        title: "Lab order created",
        description: "Lab order has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lab order. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating lab order:', error);
    },
  });
};

export const useLabOrderItems = (labOrderId: string) => {
  return useQuery({
    queryKey: ['lab-order-items', labOrderId],
    queryFn: () => labService.getLabOrderItems(labOrderId),
    enabled: !!labOrderId,
  });
};

export const useCreateLabOrderItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: labService.createLabOrderItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lab-order-items', data.lab_order_id] });
      toast({
        title: "Lab order item added",
        description: "Lab order item has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add lab order item. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating lab order item:', error);
    },
  });
};

export const useUpdateLabOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LabOrder['status'] }) =>
      labService.updateLabOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      toast({
        title: "Lab order updated",
        description: "Lab order status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update lab order. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating lab order:', error);
    },
  });
};
