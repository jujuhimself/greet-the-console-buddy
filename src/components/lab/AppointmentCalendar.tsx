import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Clock, User, TestTube } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { appointmentService, Appointment } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";

interface AppointmentCalendarProps {
  onAppointmentClick?: (appointment: Appointment) => void;
}

const AppointmentCalendar = ({ onAppointmentClick }: AppointmentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.fetchTodaysAppointments("lab");
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.appointment_date), date)
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Appointment Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Appointments for {format(selectedDate, 'MMMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No appointments for this date</p>
              ) : (
                getAppointmentsForDate(selectedDate).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAppointmentClick(apt)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{apt.user_id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TestTube className="h-3 w-3" />
                          <span>{apt.service_type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{apt.appointment_time}</span>
                        </div>
                        <Badge className={getStatusColor(apt.status)}>
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Patient ID</h4>
                <p className="text-gray-600">{selectedAppointment.user_id}</p>
              </div>
              <div>
                <h4 className="font-medium">Service</h4>
                <p className="text-gray-600">{selectedAppointment.service_type}</p>
              </div>
              <div>
                <h4 className="font-medium">Date & Time</h4>
                <p className="text-gray-600">
                  {format(parseISO(selectedAppointment.appointment_date), 'MMMM dd, yyyy')} at {selectedAppointment.appointment_time}
                </p>
              </div>
              <Badge className={getStatusColor(selectedAppointment.status)}>
                {selectedAppointment.status}
              </Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar; 