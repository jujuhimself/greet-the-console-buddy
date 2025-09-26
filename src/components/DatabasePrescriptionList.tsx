import { useState, useEffect } from "react";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const DatabasePrescriptionList = () => {
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [pharmacyResults, setPharmacyResults] = useState<any[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewPrescription, setViewPrescription] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handlePharmacySearch = async (term: string) => {
    setPharmacySearch(term);
    if (term.length < 2) {
      setPharmacyResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
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

  const handleShare = async () => {
    if (!selectedPharmacy || !selectedPrescription) return;
    setIsSharing(true);
    try {
      const { error: insertError } = await supabase.from('shared_prescriptions').insert({
        prescription_id: selectedPrescription.id,
        pharmacy_id: selectedPharmacy.id,
        user_id: user?.id || null,
        shared_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
      await notificationService.sendNotification({
        user_id: selectedPharmacy.id,
        title: 'New Prescription Shared',
        message: `A patient has shared a prescription (${selectedPrescription.id}) with your pharmacy.`,
        type: 'info',
        data: { prescription_id: selectedPrescription.id },
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
        setSelectedPrescription(null);
      }, 1500);
    } catch (err: any) {
      setIsSharing(false);
      toast({
        title: 'Error',
        description: `Failed to share prescription. ${err?.message || ''}`,
        variant: 'destructive',
      });
    }
    setIsSharing(false);
  };

  const handleDelete = async (prescriptionId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('prescriptions').delete().eq('id', prescriptionId);
      if (error) throw error;
      toast({
        title: 'Deleted',
        description: 'Prescription deleted successfully.',
        variant: 'default',
      });
      window.location.reload();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to delete prescription. ${err?.message || ''}`,
        variant: 'destructive',
      });
    }
    setIsDeleting(false);
  };

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (viewPrescription && viewPrescription.file_path) {
        const { data, error } = await supabase.storage.from('prescriptions').createSignedUrl(viewPrescription.file_path, 60 * 60); // 1 hour
        if (data?.signedUrl) setFileUrl(data.signedUrl);
        else setFileUrl(null);
      } else {
        setFileUrl(null);
      }
    };
    if (showViewDialog) fetchSignedUrl();
  }, [viewPrescription, showViewDialog]);

  if (isLoading) {
    return <div>Loading prescriptions...</div>;
  }

  return (
    <div className="space-y-4">
      {prescriptions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No prescriptions found.</div>
      ) : (
        prescriptions.map((prescription) => (
          <div key={prescription.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-medium">Prescription ID: {prescription.id}</h4>
                <p className="text-sm text-gray-600">Doctor: {prescription.doctor_name}</p>
                <p className="text-xs text-gray-500">Date: {prescription.prescription_date}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setViewPrescription(prescription); setShowViewDialog(true); }}>View</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(prescription.id)} disabled={isDeleting}>Delete</Button>
                <Button size="sm" variant="secondary" onClick={() => { setSelectedPrescription(prescription); setShowShareDialog(true); }}>Share with Pharmacy</Button>
              </div>
            </div>
            {prescription.diagnosis && <p className="text-sm text-gray-600 mb-2">Diagnosis: {prescription.diagnosis}</p>}
            {prescription.instructions && <p className="text-sm text-gray-600 mb-2">Instructions: {prescription.instructions}</p>}
          </div>
        ))
      )}
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
              placeholder="Search for pharmacy..."
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
              disabled={!selectedPharmacy || !selectedPrescription || isSharing}
              className="w-full mt-2"
            >
              {isSharing ? 'Sharing...' : 'Share Prescription'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {viewPrescription && (
            <div className="space-y-2">
              <div><strong>ID:</strong> {viewPrescription.id}</div>
              <div><strong>Doctor:</strong> {viewPrescription.doctor_name}</div>
              <div><strong>Date:</strong> {viewPrescription.prescription_date}</div>
              <div><strong>Status:</strong> {viewPrescription.status}</div>
              {viewPrescription.diagnosis && <div><strong>Diagnosis:</strong> {viewPrescription.diagnosis}</div>}
              {viewPrescription.instructions && <div><strong>Instructions:</strong> {viewPrescription.instructions}</div>}
              {/* File preview */}
              {viewPrescription.file_path && fileUrl && (
                <div className="mt-4">
                  <strong>Uploaded File:</strong>
                  {viewPrescription.file_path.endsWith('.pdf') ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block mt-1"
                    >
                      View PDF
                    </a>
                  ) : (
                    <img
                      src={fileUrl}
                      alt="Prescription File"
                      className="max-w-full max-h-64 mt-1 border rounded"
                    />
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabasePrescriptionList; 