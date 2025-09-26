import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { appointmentService } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";
import PatientSearch, { Patient } from "../lab/PatientSearch";
import { useAuth } from "@/contexts/AuthContext";

interface PharmacyAppointmentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: () => void;
  pharmacy?: { id: string; name: string };
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

const PharmacyAppointmentScheduler = ({ isOpen, onClose, onAppointmentCreated, pharmacy }: PharmacyAppointmentSchedulerProps) => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [serviceType, setServiceType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [priority, setPriority] = useState<"routine" | "urgent" | "emergency">("routine");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots);
  const { toast } = useToast();

  // Check availability when date changes
  useEffect(() => {
    if (selectedDate) {
      checkAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const checkAvailability = async () => {
    if (!selectedDate) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      // Use fetchTodaysAppointments and filter by date and provider_type
      const appointments = await appointmentService.fetchTodaysAppointments('pharmacy');
      const sameDayAppointments = appointments.filter(
        apt => apt.appointment_date === dateStr
      );
      const bookedSlots = sameDayAppointments.map(apt => apt.appointment_time);
      const available = timeSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(available);
      if (selectedTime && !available.includes(selectedTime)) {
        setSelectedTime("");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !serviceType || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const providerId = pharmacy?.id || user?.id;
      if (!providerId) {
        toast({
          title: "Error",
          description: "Pharmacy ID is missing. Cannot schedule appointment.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      const appointmentData = {
        user_id: selectedPatient.id,
        provider_id: providerId,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        service_type: serviceType,
        provider_type: "pharmacy",
        status: "scheduled" as 'scheduled',
        notes,
        priority,
      };
      await appointmentService.createAppointment(appointmentData);
      toast({
        title: "Appointment Scheduled",
        description: `Appointment scheduled for ${selectedPatient.full_name || selectedPatient.email} on ${format(selectedDate, 'MMM dd, yyyy')} at ${selectedTime}`,
      });
      setSelectedPatient(null);
      setServiceType("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setPriority("routine");
      setNotes("");
      onAppointmentCreated();
      onClose();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "routine": return "bg-gray-100 text-gray-800";
      case "urgent": return "bg-yellow-100 text-yellow-800";
      case "emergency": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule New Pharmacy Appointment
            {pharmacy && (
              <span className="ml-2 text-base text-blue-700 font-semibold">with {pharmacy.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient *
            </Label>
            <PatientSearch
              onPatientSelect={setSelectedPatient}
              selectedPatient={selectedPatient}
            />
            {selectedPatient && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium">{selectedPatient.full_name || selectedPatient.email}</p>
                <p className="text-sm text-gray-600">{selectedPatient.phone}</p>
              </div>
            )}
          </div>
          {/* Service Type */}
          <div className="space-y-2">
            <Label>Service Type *</Label>
            <Input
              placeholder="e.g. Medication Consultation, Vaccination, Blood Pressure Check"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
            />
          </div>
          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={date => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {slot}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Priority Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Priority
            </Label>
            <div className="flex gap-2">
              {(["routine", "urgent", "emergency"] as const).map(priorityOption => (
                <Button
                  key={priorityOption}
                  variant={priority === priorityOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority(priorityOption)}
                  className={cn(
                    priority === priorityOption && getPriorityColor(priorityOption)
                  )}
                >
                  {priorityOption.charAt(0).toUpperCase() + priorityOption.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Any special instructions or notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          {/* Summary */}
          {selectedPatient && serviceType && selectedDate && selectedTime && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Appointment Summary</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Patient:</strong> {selectedPatient.full_name || selectedPatient.email}</p>
                <p><strong>Service:</strong> {serviceType}</p>
                <p><strong>Date:</strong> {format(selectedDate, 'MMM dd, yyyy')}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPatient || !serviceType || !selectedDate || !selectedTime}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyAppointmentScheduler; 