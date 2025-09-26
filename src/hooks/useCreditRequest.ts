
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditRequestService, CreditRequest } from '@/services/creditRequestService';
import { useToast } from '@/hooks/use-toast';

export const useCreditRequests = () => {
  return useQuery({
    queryKey: ['credit-requests'],
    queryFn: creditRequestService.getCreditRequests,
  });
};

export const useCreditAccount = () => {
  return useQuery({
    queryKey: ['credit-account'],
    queryFn: creditRequestService.getCreditAccount,
  });
};

export const useCreateCreditRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: creditRequestService.createCreditRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-requests'] });
      toast({
        title: "Credit request submitted",
        description: "Your credit request has been submitted for review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit credit request. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating credit request:', error);
    },
  });
};

export const useUpdateCreditRequestStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, reviewNotes }: { id: string; status: CreditRequest['status']; reviewNotes?: string }) =>
      creditRequestService.updateCreditRequestStatus(id, status, reviewNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-requests'] });
      toast({
        title: "Status updated",
        description: "Credit request status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating credit request:', error);
    },
  });
};
