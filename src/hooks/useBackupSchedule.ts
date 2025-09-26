
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backupScheduleService, BackupSchedule } from "@/services/backupScheduleService";
import { useToast } from "@/hooks/use-toast";

export const useBackupSchedules = () => {
  return useQuery({
    queryKey: ["backup-schedules"],
    queryFn: backupScheduleService.getSchedules,
  });
};

export const useUpsertBackupSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: backupScheduleService.upsertSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-schedules"] });
      toast({ title: "Schedule saved", description: "Backup schedule has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save schedule.", variant: "destructive" });
    }
  });
};

export const useDeleteBackupSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: backupScheduleService.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-schedules"] });
      toast({ title: "Schedule deleted", description: "Backup schedule deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete schedule.", variant: "destructive" });
    }
  });
};
