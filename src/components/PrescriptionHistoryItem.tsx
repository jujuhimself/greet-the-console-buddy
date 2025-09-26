import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface PrescriptionHistoryItemProps {
  prescription: {
    fileName: string;
    doctorName: string;
    uploadDate: string;
    notes: string;
    viewUrl: string;
    status: string;
    pharmacyName?: string;
    filePath: string;
  };
  onDelete: (filePath: string) => void;
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "processed":
      return "bg-blue-500";
    case "filled":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}
function getStatusText(status: string) {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "processed":
      return "Being Processed";
    case "filled":
      return "Prescription Filled";
    default:
      return "Unknown";
  }
}

const PrescriptionHistoryItem = ({
  prescription,
  onDelete,
}: PrescriptionHistoryItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [pharmacyResults, setPharmacyResults] = useState<any[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search pharmacies by name/location
  const handlePharmacySearch = async (term: string) => {
    setPharmacySearch(term);
    if (term.length < 2) {
      setPharmacyResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    // Search by business_name, name, and email
    const { data, error } = await supabase
      .from('profiles')
      .select('id, business_name, name, address, city, region, email')
      .eq('role', 'retail')
      .eq('is_approved', true)
      .or(
        `business_name.ilike.%${term}%,name.ilike.%${term}%,email.ilike.%${term}%`
      );
    if (!error && data) {
      setPharmacyResults(data);
    } else {
      setPharmacyResults([]);
    }
  };

  // Share prescription logic
  const handleShare = async () => {
    if (!selectedPharmacy) return;
    setIsSharing(true);
    try {
      // Debug: log prescription and prescription_id
      console.log('Sharing prescription:', prescription);
      // Insert into shared_prescriptions
      const { error: insertError } = await supabase.from('shared_prescriptions').insert({
        prescription_id: prescription.filePath, // Use filePath as ID
        pharmacy_id: selectedPharmacy.id,
        user_id: user?.id || null,
        shared_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
      // Send notification to pharmacy
      const notificationResult = await notificationService.sendNotification({
        user_id: selectedPharmacy.id,
        title: 'New Prescription Shared',
        message: `A patient has shared a prescription (${prescription.fileName}) with your pharmacy.`,
        type: 'info',
        data: { prescription_id: prescription.filePath },
      });
      setShareSuccess(true);
      toast({
        title: 'Success',
        description: 'Prescription shared successfully!',
        variant: 'default',
      });
      setTimeout(() => {
        setShowShareDialog(false);
        setShareSuccess(false);
        setSelectedPharmacy(null);
        setPharmacySearch("");
        setPharmacyResults([]);
      }, 1500);
    } catch (err: any) {
      setIsSharing(false);
      console.error('Failed to share prescription:', err);
      toast({
        title: 'Error',
        description: `Failed to share prescription. ${err?.message || ''}`,
        variant: 'destructive',
      });
    }
    setIsSharing(false);
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{prescription.fileName}</h4>
          <p className="text-sm text-gray-600">
            Dr. {prescription.doctorName || "[unknown]"}
          </p>
          <p className="text-xs text-gray-500">
            Uploaded: {new Date(prescription.uploadDate).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <Badge className={getStatusColor(prescription.status)}>
            {getStatusText(prescription.status)}
          </Badge>
          {prescription.pharmacyName && (
            <p className="text-xs text-gray-600 mt-1">
              {prescription.pharmacyName}
            </p>
          )}
        </div>
      </div>
      {prescription.notes && (
        <p className="text-sm text-gray-600 mb-2">{prescription.notes}</p>
      )}
      <div className="flex gap-2">
        {prescription.viewUrl ? (
          <a
            href={prescription.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" disabled>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(prescription.filePath)}
        >
          <X className="h-3 w-3 mr-1" />
          Delete
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShowShareDialog(true)}>
          Share with Pharmacy
        </Button>
      </div>
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Prescription with Pharmacy</DialogTitle>
          </DialogHeader>
          {shareSuccess && (
            <div className="text-green-600 py-6 text-center font-semibold">Prescription shared successfully!</div>
          )}
          <div className="space-y-4">
            <Input
              placeholder="Search pharmacy by name..."
              value={pharmacySearch}
              onChange={e => handlePharmacySearch(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-40 overflow-y-auto border rounded">
              {pharmacySearch.length < 2 && !hasSearched ? (
                <div className="text-gray-500 p-2 text-center">Search for pharmacy</div>
              ) : pharmacyResults.length === 0 && hasSearched ? (
                <div className="text-gray-500 p-2 text-center">No pharmacies found.</div>
              ) : (
                pharmacyResults.map(pharmacy => (
                  <div
                    key={pharmacy.id}
                    className={`p-2 cursor-pointer hover:bg-blue-50 ${selectedPharmacy?.id === pharmacy.id ? 'bg-blue-100' : ''}`}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <div className="font-medium">{pharmacy.business_name || pharmacy.name}</div>
                    <div className="text-xs text-gray-500">{pharmacy.address || pharmacy.city || ''} {pharmacy.region || ''}</div>
                    <div className="text-xs text-gray-400">{pharmacy.email}</div>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={handleShare}
              disabled={!selectedPharmacy || isSharing}
              className="w-full mt-2"
            >
              {isSharing ? 'Sharing...' : 'Share Prescription'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionHistoryItem;
