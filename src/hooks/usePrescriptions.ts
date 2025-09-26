import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionService, Prescription, PrescriptionItem } from '@/services/prescriptionService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionService.getPrescriptions,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: prescriptionService.createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Prescription created",
        description: "Prescription has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating prescription:', error);
    },
  });
};

export const usePrescriptionItems = (prescriptionId: string) => {
  return useQuery({
    queryKey: ['prescription-items', prescriptionId],
    queryFn: () => prescriptionService.getPrescriptionItems(prescriptionId),
    enabled: !!prescriptionId,
  });
};

export const useCreatePrescriptionItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: prescriptionService.createPrescriptionItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prescription-items', data.prescription_id] });
      toast({
        title: "Prescription item added",
        description: "Prescription item has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add prescription item. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating prescription item:', error);
    },
  });
};

export const useUpdatePrescriptionStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Prescription['status'] }) =>
      prescriptionService.updatePrescriptionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Prescription updated",
        description: "Prescription status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update prescription. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating prescription:', error);
    },
  });
};

export const usePharmacyPrescriptions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pharmacy-prescriptions', user?.id],
    queryFn: () => user ? prescriptionService.getPrescriptionsForPharmacy(user.id) : Promise.resolve([]),
    enabled: !!user && user.role === 'retail',
  });
};
