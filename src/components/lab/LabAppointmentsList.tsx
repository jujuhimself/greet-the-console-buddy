import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appointmentService } from "@/services/appointmentService";
import { uploadFile } from "@/services/storageService";
import { labService } from "@/services/labService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";

export interface Appointment {
  id: string;
  patientName: string;
  testType: string;
  date: string;
  time: string;
  status: string;
  priority: string;
}
interface LabAppointmentsListProps {
  appointments: Appointment[];
  getStatusColor: (status: string) => string;
  onRefresh?: () => void;
}

const statusOptions = [
  "scheduled",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled"
];

const LabAppointmentsList = ({ appointments, getStatusColor, onRefresh }: LabAppointmentsListProps) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ result: "", file: null as File | null });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleOpenDetails = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowDetails(apt.id);
  };
  const handleCloseDetails = () => {
    setShowDetails(null);
    setSelectedAppointment(null);
  };
  const handleOpenStatus = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setNewStatus(apt.status);
    setShowStatusModal(apt.id);
  };
  const handleCloseStatus = () => {
    setShowStatusModal(null);
    setSelectedAppointment(null);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value);
  };
  const handleUpdateStatus = async () => {
    if (!selectedAppointment) return;
    setIsUpdating(true);
    try {
      await appointmentService.updateAppointmentStatus(selectedAppointment.id, newStatus);
      handleCloseStatus();
      if (onRefresh) {
        onRefresh();
      }
      toast({
        title: "Status updated successfully",
        description: `Appointment status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Upload Result logic
  const handleOpenUpload = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowUploadModal(apt.id);
    setUploadForm({ result: "", file: null });
  };
  const handleCloseUpload = () => {
    setShowUploadModal(null);
    setSelectedAppointment(null);
    setUploadForm({ result: "", file: null });
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadForm((prev) => ({ ...prev, file }));
  };
  const handleResultChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUploadForm((prev) => ({ ...prev, result: e.target.value }));
  };
  const handleUploadResult = async () => {
    if (!selectedAppointment) return;
    setIsUpdating(true);
    try {
      let fileUrl = null;
      if (uploadForm.file && user?.id) {
        const { publicUrl } = await uploadFile({
          file: uploadForm.file,
          userId: user.id,
          bucket: "lab-results",
        });
        fileUrl = publicUrl;
      }
      
      // Update the appointment with the result
      await appointmentService.updateAppointmentStatus(selectedAppointment.id, 'completed');
      
      // For now, we'll store the result in the notes field
      // In a real implementation, you'd want a separate results table
      if (uploadForm.result || fileUrl) {
        const resultText = uploadForm.result || '';
        const fileText = fileUrl ? `\nFile uploaded: ${fileUrl}` : '';
        const notes = `Result: ${resultText}${fileText}`;
        
        // Update appointment notes with result
        await supabase
          .from('appointments')
          .update({ notes })
          .eq('id', selectedAppointment.id);
      }
      
      handleCloseUpload();
      if (onRefresh) {
        onRefresh();
      }
      
      // Send notification to patient about results
      try {
        // Get the patient's user_id from the appointment
        const { data: appointmentData } = await supabase
          .from('appointments')
          .select('user_id')
          .eq('id', selectedAppointment.id)
          .single();
        
        if (appointmentData?.user_id) {
          await notificationService.sendLabResultNotification(
            appointmentData.user_id,
            selectedAppointment.testType,
            !!fileUrl
          );
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
      
      toast({
        title: "Result uploaded successfully",
        description: "Your result has been uploaded successfully.",
      });
    } catch (error) {
      alert("Failed to upload result");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Today's Appointments
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center text-gray-400">
              No appointments for today.
            </div>
          ) : appointments.map((appointment) => (
            <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{appointment.patientName}</h4>
                  <p className="text-gray-600">{appointment.testType}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  {appointment.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                {appointment.time}
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenDetails(appointment)}>
                  View Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenStatus(appointment)}>
                  Update Status
                </Button>
                {(appointment.status === 'in-progress' || appointment.status === 'completed') && (
                  <Button variant="outline" size="sm" onClick={() => handleOpenUpload(appointment)}>
                    Upload Result
                  </Button>
                )}
              </div>
              {/* Details Modal */}
              <Dialog open={showDetails === appointment.id} onOpenChange={handleCloseDetails}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Appointment Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <div><b>Patient:</b> {appointment.patientName}</div>
                    <div><b>Test Type:</b> {appointment.testType}</div>
                    <div><b>Date:</b> {appointment.date}</div>
                    <div><b>Time:</b> {appointment.time}</div>
                    <div><b>Status:</b> {appointment.status}</div>
                    <div><b>Priority:</b> {appointment.priority}</div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseDetails}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Update Status Modal */}
              <Dialog open={showStatusModal === appointment.id} onOpenChange={handleCloseStatus}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Appointment Status</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Label htmlFor="status">Status</Label>
                    <select id="status" className="w-full border rounded p-2" value={newStatus} onChange={handleStatusChange}>
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseStatus} disabled={isUpdating}>Cancel</Button>
                    <Button onClick={handleUpdateStatus} disabled={isUpdating}>{isUpdating ? "Updating..." : "Update"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Upload Result Modal */}
              <Dialog open={showUploadModal === appointment.id} onOpenChange={handleCloseUpload}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Test Result</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Label htmlFor="result">Result (text)</Label>
                    <Textarea id="result" value={uploadForm.result} onChange={handleResultChange} rows={3} />
                    <Label htmlFor="result-file">Result File (PDF/Image)</Label>
                    <Input id="result-file" type="file" accept="image/*,.pdf" onChange={handleFileSelect} />
                    {uploadForm.file && <div className="text-sm text-gray-600">Selected: {uploadForm.file.name}</div>}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseUpload} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleUploadResult} disabled={isUploading || (!uploadForm.result && !uploadForm.file)}>
                      {isUploading ? "Uploading..." : "Upload Result"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LabAppointmentsList;
