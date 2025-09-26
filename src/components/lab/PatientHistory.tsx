import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "./PatientSearch";

interface PatientHistoryProps {
  patient: Patient;
}

interface AppointmentHistory {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  notes?: string;
  created_at: string;
}

const PatientHistory = ({ patient }: PatientHistoryProps) => {
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      if (!patient?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', patient.id)
          .eq('provider_type', 'lab')
          .order('appointment_date', { ascending: false })
          .limit(10);

        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching patient history:', error);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientHistory();
  }, [patient?.id]);

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Show HH:MM format
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Patient History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No previous appointments found for this patient.
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                    {appointment.appointment_time && (
                      <>
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{formatTime(appointment.appointment_time)}</span>
                      </>
                    )}
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <strong>Test:</strong> {appointment.service_type}
                </div>
                {appointment.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="flex items-start gap-1">
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{appointment.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientHistory; 