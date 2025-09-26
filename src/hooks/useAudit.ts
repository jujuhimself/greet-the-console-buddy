import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/auditService';

export const useAuditLogs = (user?: { id: string; role: string }) => {
  return useQuery({
    queryKey: ['audit-logs', user?.id, user?.role],
    queryFn: async () => {
      if (user?.role === 'retail') {
        return auditService.getOrgActivity(undefined, user.id); // retailer_id
      }
      return auditService.getUserActivity(user?.id);
    },
    staleTime: 30000, // 30 seconds
  });
};
