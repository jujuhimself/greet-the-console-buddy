import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { appointmentService } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  patientName: string;
  testType: string;
  date: string;
  time: string;
  status: string;
}

interface BulkAppointmentOperationsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointments: Appointment[];
  onOperationComplete: () => void;
}

const BulkAppointmentOperations = ({ 
  isOpen, 
  onClose, 
  selectedAppointments, 
  onOperationComplete 
}: BulkAppointmentOperationsProps) => {
  const [operation, setOperation] = useState<"reschedule" | "cancel" | "status">("reschedule");
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const statusOptions = ["scheduled", "confirmed", "in-progress", "completed", "cancelled"];

  const handleBulkOperation = async () => {
    if (selectedAppointments.length === 0) {
      toast({
        title: "No Appointments Selected",
        description: "Please select at least one appointment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const promises = selectedAppointments.map(async (appointment) => {
        switch (operation) {
          case "reschedule":
            if (!newDate || !newTime) {
              throw new Error("Please select new date and time");
            }
            const { error } = await supabase
              .from('appointments')
              .update({
                appointment_date: format(newDate, 'yyyy-MM-dd'),
                appointment_time: newTime,
                status: "scheduled"
              })
              .eq('id', appointment.id);
            
            if (error) throw error;
            return;

          case "cancel":
            return appointmentService.updateAppointmentStatus(appointment.id, "cancelled");

          case "status":
            if (!newStatus) {
              throw new Error("Please select new status");
            }
            return appointmentService.updateAppointmentStatus(appointment.id, newStatus);

          default:
            throw new Error("Invalid operation");
        }
      });

      await Promise.all(promises);

      toast({
        title: "Bulk Operation Completed",
        description: `Successfully processed ${selectedAppointments.length} appointment(s).`,
      });

      onOperationComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk operation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Bulk Appointment Operations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Appointments Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Selected Appointments ({selectedAppointments.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedAppointments.map((apt) => (
                <div key={apt.id} className="flex justify-between items-center text-sm">
                  <span>{apt.patientName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{apt.testType}</Badge>
                    <span className="text-gray-500">{apt.date} {apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operation Selection */}
          <div className="space-y-2">
            <Label>Operation Type</Label>
            <Select value={operation} onValueChange={(value: "reschedule" | "cancel" | "status") => setOperation(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reschedule">Reschedule</SelectItem>
                <SelectItem value="cancel">Cancel</SelectItem>
                <SelectItem value="status">Update Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Operation-specific fields */}
          {operation === "reschedule" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newDate ? format(newDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newDate}
                      onSelect={setNewDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>New Time *</Label>
                <Select value={newTime} onValueChange={setNewTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {operation === "status" && (
            <div className="space-y-2">
              <Label>New Status *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Warning for destructive operations */}
          {(operation === "cancel") && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Warning</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                This action will cancel {selectedAppointments.length} appointment(s). This cannot be undone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkOperation} 
            disabled={isProcessing || selectedAppointments.length === 0}
            variant={operation === "cancel" ? "destructive" : "default"}
          >
            {isProcessing ? "Processing..." : `Apply to ${selectedAppointments.length} Appointment(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAppointmentOperations; 