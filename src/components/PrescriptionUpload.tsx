import { useEffect, useState } from "react";
import PrescriptionUploadForm from "./PrescriptionUploadForm";
import PrescriptionHistoryList from "./PrescriptionHistoryList";
import { getFileUrl, deleteFile } from "@/services/storageService";
import { auditService } from "@/services/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrescriptionFile {
  id: string;
  fileName: string;
  uploadDate: string;
  doctorName: string;
  notes: string;
  filePath: string;
  viewUrl: string;
  status: 'pending' | 'processed' | 'filled';
  pharmacyName?: string;
}

const PrescriptionUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<PrescriptionFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load prescription file refs from storage
  useEffect(() => {
    if (!user?.id) return;
    
    const loadPrescriptions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from("prescriptions")
          .list(`${user.id}/`);
        console.log('Prescription list data:', data, 'error:', error);
        if (error) {
          console.error('Error loading prescriptions:', error);
          toast({
            title: "Error loading prescriptions",
            description: "Failed to load your prescription history",
            variant: "destructive"
          });
          setPrescriptions([]);
          return;
        }
        
        if (!data || data.length === 0) {
          setPrescriptions([]);
          return;
        }
        
        const history: PrescriptionFile[] = await Promise.all(
          data.map(async (file: any) => {
            try {
              const url = await getFileUrl("prescriptions", `${user.id}/${file.name}`);
              return {
                id: file.id || file.name,
                fileName: file.name.split("_").slice(1).join("_"),
                uploadDate: new Date(file.created_at || Date.now()).toISOString(),
                doctorName: "",
                notes: "",
                filePath: `${user.id}/${file.name}`,
                viewUrl: url || "",
                status: "pending",
                pharmacyName: "",
              };
            } catch (err) {
              console.error('Error getting file URL:', err);
              return null;
            }
          })
        );
        
        // Filter out any null entries from failed URL generation
        const validHistory = history.filter(Boolean) as PrescriptionFile[];
        setPrescriptions(validHistory.reverse());
        
      } catch (err) {
        console.error('Error in loadPrescriptions:', err);
        toast({
          title: "Error loading prescriptions",
          description: "Failed to load your prescription history",
          variant: "destructive"
        });
        setPrescriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptions();
  }, [user?.id, refreshTrigger]);

  const handleDelete = async (filePath: string) => {
    if (!user?.id) return;
    
    try {
      await deleteFile("prescriptions", filePath);
      await auditService.logAction(
        "delete-prescription",
        "prescription",
        undefined,
        { filePath }
      );
      
      setPrescriptions((prev) =>
        prev.filter((p) => p.filePath !== filePath)
      );
      
      toast({
        title: "Prescription deleted",
        description: "The prescription has been successfully deleted",
      });
      
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: "Delete failed",
        description: "Failed to delete the prescription. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Trigger refresh after upload
  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PrescriptionUploadForm onUploadSuccess={handleUploadSuccess} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading prescription history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PrescriptionUploadForm onUploadSuccess={handleUploadSuccess} />
      <PrescriptionHistoryList
        prescriptions={prescriptions}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PrescriptionUpload;
