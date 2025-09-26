
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

export const useSalesAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['sales-analytics', startDate, endDate],
    queryFn: () => analyticsService.getSalesAnalytics(startDate, endDate),
  });
};

export const useProductAnalytics = (productId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['product-analytics', productId, startDate, endDate],
    queryFn: () => analyticsService.getProductAnalytics(productId, startDate, endDate),
  });
};

export const useCustomerAnalytics = () => {
  return useQuery({
    queryKey: ['customer-analytics'],
    queryFn: analyticsService.getCustomerAnalytics,
  });
};

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsService.getDashboardMetrics,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
