
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminPolicyService, AdminPolicyAction } from '@/services/adminPolicyService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminPolicyAction = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (action: AdminPolicyAction) => adminPolicyService.executeAdminAction(action),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "Action Completed",
          description: `Admin action "${variables.action}" completed successfully.`,
        });
      } else {
        toast({
          title: "Action Failed",
          description: result.error || "An error occurred while executing the admin action.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Action Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  });
};

export const useAdminActionHistory = (limit: number = 50) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-action-history', limit],
    queryFn: () => adminPolicyService.getAdminActionHistory(limit),
    enabled: !!user && user.role === 'admin',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
