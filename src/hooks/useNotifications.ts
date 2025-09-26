
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, Notification } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useNotifications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getNotifications(user?.id || ''),
    enabled: !!user?.id,
  });
};

export const useUnreadNotificationsCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: () => notificationService.getUnreadCount(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
    },
  });
};

export const useSystemAlerts = () => {
  return useQuery({
    queryKey: ['system-alerts'],
    queryFn: notificationService.getSystemAlerts,
  });
};

export const useNotificationSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    const channel = notificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        // Show toast for new notifications
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'error' ? 'destructive' : 'default',
        });

        // Invalidate queries to refresh notification list
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user.id] });
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, queryClient, toast]);
};
