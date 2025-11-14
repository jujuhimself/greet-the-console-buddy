import { useMutation } from '@tanstack/react-query';
import { comprehensiveNotificationService } from '@/services/comprehensiveNotificationService';

/**
 * Hook to send order-related notifications
 */
export const useOrderNotifications = () => {
  const notifyOrderPlaced = useMutation({
    mutationFn: async ({
      userId,
      email,
      orderNumber,
      totalAmount,
      items,
    }: {
      userId: string;
      email: string;
      orderNumber: string;
      totalAmount: number;
      items: any[];
    }) => {
      await comprehensiveNotificationService.notifyOrderPlaced(
        userId,
        email,
        orderNumber,
        totalAmount,
        items
      );
    },
  });

  const notifyPharmacyNewOrder = useMutation({
    mutationFn: async ({
      pharmacyId,
      email,
      orderNumber,
      customerName,
      totalAmount,
    }: {
      pharmacyId: string;
      email: string;
      orderNumber: string;
      customerName: string;
      totalAmount: number;
    }) => {
      await comprehensiveNotificationService.notifyPharmacyNewOrder(
        pharmacyId,
        email,
        orderNumber,
        customerName,
        totalAmount
      );
    },
  });

  const notifyWholesalerNewOrder = useMutation({
    mutationFn: async ({
      wholesalerId,
      email,
      orderNumber,
      retailerName,
      totalAmount,
    }: {
      wholesalerId: string;
      email: string;
      orderNumber: string;
      retailerName: string;
      totalAmount: number;
    }) => {
      await comprehensiveNotificationService.notifyWholesalerNewOrder(
        wholesalerId,
        email,
        orderNumber,
        retailerName,
        totalAmount
      );
    },
  });

  return {
    notifyOrderPlaced,
    notifyPharmacyNewOrder,
    notifyWholesalerNewOrder,
  };
};