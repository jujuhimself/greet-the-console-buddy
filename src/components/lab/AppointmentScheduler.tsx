import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User, TestTube, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { appointmentService } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";
import PatientSearch, { Patient } from "./PatientSearch";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: () => void;
  lab?: {
    id: string;
    name: string;
    location?: string;
    phone?: string;
  };
  appointment?: any;
  mode?: string;
}

interface LabTest {
  id: string;
  name: string;
  category: string;
  duration: number; // in minutes
  preparation: string;
  price: number;
}

const labTests: LabTest[] = [
  { id: "1", name: "Complete Blood Count (CBC)", category: "Hematology", duration: 30, preparation: "Fasting required for 8-12 hours", price: 45 },
  { id: "2", name: "Comprehensive Metabolic Panel", category: "Chemistry", duration: 45, preparation: "Fasting required for 12 hours", price: 65 },
  { id: "3", name: "Lipid Panel", category: "Chemistry", duration: 30, preparation: "Fasting required for 12-14 hours", price: 35 },
  { id: "4", name: "Thyroid Function Test", category: "Endocrinology", duration: 30, preparation: "No special preparation required", price: 55 },
  { id: "5", name: "Hemoglobin A1C", category: "Diabetes", duration: 20, preparation: "No fasting required", price: 40 },
  { id: "6", name: "Urinalysis", category: "Urine Analysis", duration: 15, preparation: "First morning urine preferred", price: 25 },
  { id: "7", name: "Pregnancy Test", category: "Reproductive Health", duration: 15, preparation: "No special preparation", price: 30 },
  { id: "8", name: "STD Panel", category: "Infectious Disease", duration: 45, preparation: "No special preparation", price: 120 },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

const AppointmentScheduler = ({ isOpen, onClose, onAppointmentCreated, lab, appointment, mode }: AppointmentSchedulerProps) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [priority, setPriority] = useState<"routine" | "urgent" | "emergency">("routine");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots);
  const { toast } = useToast();

  // Filter tests by category
  const testCategories = [...new Set(labTests.map(test => test.category))];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTests = selectedCategory === "all" 
    ? labTests 
    : labTests.filter(test => test.category === selectedCategory);

  // Check availability when date changes
  useEffect(() => {
    if (selectedDate && lab?.id) {
      checkAvailability();
    }
  }, [selectedDate, lab]);

  useEffect(() => {
    if (appointment) {
      setSelectedPatient({
        id: appointment.user_id,
        full_name: appointment.patientName || "",
        email: appointment.patientEmail || "",
        phone: appointment.patientPhone || "",
        role: "individual",
        created_at: appointment.created_at || new Date().toISOString(),
      });
      setSelectedTest(labTests.find(test => test.name === appointment.service_type) || null);
      setSelectedDate(appointment.appointment_date ? new Date(appointment.appointment_date) : undefined);
      setSelectedTime(appointment.appointment_time || "");
      setNotes(appointment.notes || "");
    }
  }, [appointment]);

  const checkAvailability = async () => {
    if (!selectedDate || !lab?.id) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', dateStr)
        .eq('provider_id', lab.id);
      if (error) throw error;
      const bookedSlots = (existingAppointments || []).map((apt: any) => apt.appointment_time);
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
    if (!selectedPatient || !selectedTest || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === "edit" && appointment) {
        // Update existing appointment
        await appointmentService.updateAppointment(appointment.id, {
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          service_type: selectedTest.name,
          notes: notes || `Test: ${selectedTest.name}\nPreparation: ${selectedTest.preparation}`,
        });
        toast({
          title: "Appointment Rescheduled",
          description: `Appointment rescheduled to ${format(selectedDate, 'MMM dd, yyyy')} at ${selectedTime}`,
        });
      } else {
        // Create new appointment
        if (!lab?.id) {
          toast({
            title: "Error",
            description: "Lab ID is missing. Cannot schedule appointment.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        const appointmentData = {
          user_id: selectedPatient.id,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          service_type: selectedTest.name,
          provider_id: lab.id,
          provider_type: "lab",
          status: "scheduled" as 'scheduled',
          notes: notes || `Test: ${selectedTest.name}\nPreparation: ${selectedTest.preparation}`,
          priority,
        };
        await appointmentService.createAppointment(appointmentData);
        toast({
          title: "Appointment Scheduled",
          description: `Appointment scheduled for ${selectedPatient.full_name || selectedPatient.email} on ${format(selectedDate, 'MMM dd, yyyy')} at ${selectedTime}`,
        });
      }
      setSelectedPatient(null);
      setSelectedTest(null);
      setSelectedDate(undefined);
      setSelectedTime("");
      setPriority("routine");
      setNotes("");
      onAppointmentCreated();
      onClose();
    } catch (error) {
      console.error("Error creating/updating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule or update appointment. Please try again.",
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
            Schedule New Appointment
          </DialogTitle>
        </DialogHeader>
        {lab && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="font-medium">Booking with: {lab.name}</div>
            {lab.location && <div className="text-sm text-gray-600">{lab.location}</div>}
            {lab.phone && <div className="text-sm text-gray-600">Phone: {lab.phone}</div>}
          </div>
        )}
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

          {/* Test Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Lab Test *
            </Label>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {testCategories.filter(Boolean).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Test List */}
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {filteredTests.map(test => (
                <div
                  key={test.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedTest?.id === test.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-gray-600">{test.category}</p>
                      <p className="text-xs text-gray-500">{test.preparation}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${test.price}</p>
                      <p className="text-xs text-gray-500">{test.duration} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    disabled={(date) => date < new Date()}
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
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedPatient && selectedTest && selectedDate && selectedTime && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Appointment Summary</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Patient:</strong> {selectedPatient.full_name || selectedPatient.email}</p>
                <p><strong>Test:</strong> {selectedTest.name}</p>
                <p><strong>Date:</strong> {format(selectedDate, 'MMM dd, yyyy')}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> {selectedTest.duration} minutes</p>
                <p><strong>Cost:</strong> ${selectedTest.price}</p>
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
            disabled={isSubmitting || !selectedPatient || !selectedTest || !selectedDate || !selectedTime}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentScheduler; 