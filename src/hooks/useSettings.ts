import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, UserSettings } from '@/services/settingsService';
import { auditService } from '@/services/auditService';
import { useToast } from '@/hooks/use-toast';

export const useUserSettings = () => {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: settingsService.getUserSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ updates, oldSettings }: { updates: Partial<UserSettings>; oldSettings?: UserSettings }) => {
      const result = await settingsService.updateSettings(updates);
      // Log the settings update
      if (oldSettings) {
        await auditService.logSettingsUpdate(oldSettings, result);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useExportUserData = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: settingsService.exportUserData,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bepawa-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      });

      // Log the data export
      auditService.logAction('export', 'user_data');
    },
    onError: (error) => {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAccount = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: settingsService.deleteAccount,
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully.",
        });
        // Redirect to home page
        window.location.href = '/';
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete account.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Notification preferences
export const useNotificationSettings = () => {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateSettings();

  const updateNotifications = (notifications: Partial<UserSettings['notifications']>) => {
    if (settings) {
      const newNotifications = { ...settings.notifications, ...notifications };
      updateSettings.mutate({
        updates: { notifications: newNotifications },
        oldSettings: settings,
      });
    }
  };

  return {
    notifications: settings?.notifications || {
      email: true,
      sms: false,
      push: true,
      marketing: false,
    },
    updateNotifications,
    isUpdating: updateSettings.isPending,
  };
};

// Privacy settings
export const usePrivacySettings = () => {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateSettings();

  const updatePrivacy = (privacy: Partial<UserSettings['privacy']>) => {
    if (settings) {
      const newPrivacy = { ...settings.privacy, ...privacy };
      updateSettings.mutate({
        updates: { privacy: newPrivacy },
        oldSettings: settings,
      });
    }
  };

  return {
    privacy: settings?.privacy || {
      profile_visibility: 'business_only',
      data_sharing: false,
      analytics_tracking: true,
    },
    updatePrivacy,
    isUpdating: updateSettings.isPending,
  };
};
