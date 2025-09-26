
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointmentService';
import { useToast } from '@/hooks/use-toast';

export const useUserAppointments = (userId: string) => {
  return useQuery({
    queryKey: ['appointments', userId],
    queryFn: () => appointmentService.fetchUserAppointments(userId),
    enabled: !!userId,
  });
};

export const useTodaysAppointments = (providerType?: string) => {
  return useQuery({
    queryKey: ['appointments', 'today', providerType],
    queryFn: () => appointmentService.fetchTodaysAppointments(providerType),
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: appointmentService.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Appointment created",
        description: "Your appointment has been successfully scheduled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating appointment:', error);
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentService.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Appointment updated",
        description: "Appointment status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating appointment:', error);
    },
  });
};
