import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Pill,
  Eye,
  Download,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePrescriptions, usePharmacyPrescriptions, useCreatePrescription, useUpdatePrescriptionStatus } from '@/hooks/usePrescriptions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface Prescription {
  id: string;
  patient_name: string;
  doctor_name: string;
  prescription_date: string;
  status: 'pending' | 'verified' | 'dispensed' | 'completed' | 'cancelled';
  diagnosis?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
  file_path?: string;
}

const PrescriptionManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: individualPrescriptions = [], isLoading: isLoadingIndividual } = usePrescriptions();
  const { data: pharmacyPrescriptions = [], isLoading: isLoadingPharmacy } = usePharmacyPrescriptions();
  const createPrescription = useCreatePrescription();
  const updatePrescriptionStatus = useUpdatePrescriptionStatus();
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pharmacyNotes, setPharmacyNotes] = useState("");

  // Choose the correct list based on user role
  const prescriptions = user?.role === 'retail' ? pharmacyPrescriptions : individualPrescriptions;
  const isLoading = user?.role === 'retail' ? isLoadingPharmacy : isLoadingIndividual;

  // Debug: Log prescriptions for pharmacy
  if (user?.role === 'retail') {
    // eslint-disable-next-line no-console
    console.log('Pharmacy prescriptions:', prescriptions);
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading prescriptions...</div>;
  }
  if (!prescriptions || prescriptions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">No prescriptions found for your pharmacy. If you expect to see prescriptions here, please ensure they are assigned to your pharmacy or are unassigned in the database.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800'; 
      case 'dispensed': return 'bg-green-200 text-green-900';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'verified': return Eye;
      case 'dispensed': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertTriangle;
      default: return FileText;
    }
  };

  const handleStatusUpdate = async (prescriptionId: string, newStatus: Prescription['status']) => {
    try {
      await updatePrescriptionStatus.mutateAsync({ id: prescriptionId, status: newStatus });
      setSelectedPrescription(null);
      toast({
        title: "Prescription Updated",
        description: `Prescription ${prescriptionId} has been ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prescription status.",
        variant: "destructive",
      });
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;
  const processedCount = prescriptions.filter(p => p.status === 'verified').length;
  const dispensedCount = prescriptions.filter(p => p.status === 'dispensed').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Prescription Management</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-purple-600">{processedCount}</p>
              </div>
              <Pill className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dispensed</p>
                <p className="text-2xl font-bold text-green-600">{dispensedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Today</p>
                <p className="text-2xl font-bold text-primary-600">{prescriptions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => {
              const StatusIcon = getStatusIcon(prescription.status);
              return (
                <div key={prescription.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <StatusIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{prescription.patient_name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">Prescription ID: {prescription.id}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Doctor:</span>
                            <p className="font-medium">{prescription.doctor_name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Prescription Date:</span>
                            <p className="font-medium">{prescription.prescription_date}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status.toUpperCase()}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPrescription(prescription)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Prescription Details - {prescription.patient_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Patient & Doctor Info */}
                            <div className="grid grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Patient Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-sm text-gray-600">Name:</span>
                                      <p className="font-medium">{prescription.patient_name}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Prescriber Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-sm text-gray-600">Doctor:</span>
                                      <p className="font-medium">{prescription.doctor_name}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Notes */}
                            {prescription.diagnosis && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Doctor's Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p>{prescription.diagnosis}</p>
                                </CardContent>
                              </Card>
                            )}

                            {/* Pharmacy Actions */}
                            {prescription.status !== 'dispensed' && prescription.status !== 'cancelled' && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Pharmacy Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Pharmacy Notes</label>
                                    <Textarea
                                      value={pharmacyNotes}
                                      onChange={(e) => setPharmacyNotes(e.target.value)}
                                      placeholder="Add any notes about processing this prescription..."
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex gap-3">
                                    {prescription.status === 'pending' && (
                                      <Button 
                                        onClick={() => handleStatusUpdate(prescription.id, 'verified')}
                                        variant="outline"
                                      >
                                        Mark as Verified
                                      </Button>
                                    )}
                                    {prescription.status === 'verified' && (
                                      <Button 
                                        onClick={() => handleStatusUpdate(prescription.id, 'dispensed')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Mark as Dispensed
                                      </Button>
                                    )}
                                    <Button 
                                      onClick={() => handleStatusUpdate(prescription.id, 'cancelled')}
                                      variant="destructive"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {prescription.instructions && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Doctor's Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p>{prescription.instructions}</p>
                                </CardContent>
                              </Card>
                            )}

                            {selectedPrescription?.file_path && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Prescription Image</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {selectedPrescription.file_path.endsWith('.pdf') ? (
                                    <a href={supabase.storage.from('prescriptions').getPublicUrl(selectedPrescription.file_path).data.publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF</a>
                                  ) : (
                                    <img
                                      src={supabase.storage.from('prescriptions').getPublicUrl(selectedPrescription.file_path).data.publicUrl}
                                      alt="Prescription"
                                      className="max-w-xs rounded border"
                                    />
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionManagement;
