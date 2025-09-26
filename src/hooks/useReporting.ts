
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportingService, ReportTemplate, GeneratedReport } from '@/services/reportingService';
import { useToast } from '@/hooks/use-toast';

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['report-templates'],
    queryFn: reportingService.getReportTemplates,
  });
};

export const useCreateReportTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: reportingService.createReportTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
      toast({
        title: "Report template created",
        description: "Report template has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create report template. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating report template:', error);
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ templateId, parameters }: { templateId: string; parameters?: Record<string, any> }) =>
      reportingService.generateReport(templateId, parameters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
      toast({
        title: "Report generation started",
        description: "Your report is being generated. You'll be notified when it's ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      console.error('Error generating report:', error);
    },
  });
};

export const useGeneratedReports = () => {
  return useQuery({
    queryKey: ['generated-reports'],
    queryFn: reportingService.getGeneratedReports,
  });
};
