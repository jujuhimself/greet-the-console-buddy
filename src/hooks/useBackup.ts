
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupService, BackupJob } from '@/services/backupService';
import { useToast } from '@/hooks/use-toast';

export const useCreateBackup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: backupService.createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
      toast({
        title: "Backup started",
        description: "Your data backup has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start backup. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating backup:', error);
    },
  });
};

export const useBackupHistory = () => {
  return useQuery({
    queryKey: ['backup-history'],
    queryFn: backupService.getBackupHistory,
  });
};

export const useDownloadBackup = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: backupService.downloadBackup,
    onSuccess: () => {
      toast({
        title: "Download started",
        description: "Your backup file download has started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to download backup. Please try again.",
        variant: "destructive",
      });
      console.error('Error downloading backup:', error);
    },
  });
};
