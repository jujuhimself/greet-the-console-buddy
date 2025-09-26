import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAppointments, useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import AppointmentScheduler from "@/components/lab/AppointmentScheduler";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LabDirectory from "./LabDirectory";
import PharmacyDirectory from "./PharmacyDirectory";
import PharmacyAppointmentScheduler from "@/components/pharmacy/PharmacyAppointmentScheduler";
import { supabase } from "@/integrations/supabase/client";

const Appointments = () => {
  const { user } = useAuth();
  const { data: appointments, isLoading, error } = useUserAppointments(user?.id || '');
  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showLabDirectory, setShowLabDirectory] = useState(false);
  const [showPharmacyDirectory, setShowPharmacyDirectory] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [showLabScheduler, setShowLabScheduler] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showPharmacyScheduler, setShowPharmacyScheduler] = useState(false);
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});
  const [providerPhones, setProviderPhones] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchProviderNames() {
      const providerIds = Array.from(new Set(appointments.map(a => a.provider_id).filter(Boolean)));
      if (providerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, business_name, name, phone')
          .in('id', providerIds);
        if (profiles) {
          const nameMap: Record<string, string> = {};
          const phoneMap: Record<string, string> = {};
          profiles.forEach((p: any) => {
            nameMap[p.id] = p.business_name || p.name || 'Unknown';
            phoneMap[p.id] = p.phone || '';
          });
          setProviderNames(nameMap);
          setProviderPhones(phoneMap);
        }
      }
    }
    fetchProviderNames();
  }, [appointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    updateAppointmentStatusMutation.mutate({ id: appointmentId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div>Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-red-600">Error loading appointments: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Appointments</h1>
            <p className="text-gray-600 text-lg">Manage your appointments</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowLabDirectory(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Find Lab
            </Button>
            <Button onClick={() => setShowPharmacyDirectory(true)}>
            <Plus className="h-5 w-5 mr-2" />
              Find Pharmacy
          </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {!appointments || appointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments scheduled</h3>
                <p className="text-gray-600 mb-6">Schedule your first appointment to get started</p>
                <Button onClick={() => setShowAppointmentDialog(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{appointment.service_type}</h3>
                        <div className="flex items-center gap-4 text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{appointment.provider_type}</span>
                            {appointment.provider_id && providerNames[appointment.provider_id] && (
                              <span className="ml-2 text-blue-700 font-semibold">{providerNames[appointment.provider_id]}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </div>
                      {['urgent', 'emergency'].includes(appointment.priority) && (
                        <div className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-bold ${appointment.priority === 'urgent' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)}
                        </div>
                      )}
                      {['urgent', 'emergency'].includes(appointment.priority) && (
                        <div className="mt-2">
                          {appointment.provider_id && providerNames[appointment.provider_id] ? (
                            <>
                              <span className="block text-xs text-red-700 font-semibold mb-1">This appointment requires immediate attention.</span>
                              {/* If provider phone is available, show a call button */}
                              {appointment.provider_id && providerPhones[appointment.provider_id] ? (
                                <a href={`tel:${providerPhones[appointment.provider_id]}`} className="inline-block px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 text-xs font-bold">
                                  Call Provider
                                </a>
                              ) : (
                                <span className="block text-xs text-gray-600">Please follow up with the provider by phone as soon as possible.</span>
                              )}
                            </>
                          ) : (
                            <span className="block text-xs text-gray-600">Please follow up with the provider by phone as soon as possible.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{appointment.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedAppointment(appointment); setShowDetailsDialog(true); }}>
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedAppointment(appointment); setShowRescheduleDialog(true); }}>
                      Reschedule
                    </Button>
                    {appointment.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        disabled={updateAppointmentStatusMutation.isPending}
                      >
                        Confirm
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        disabled={updateAppointmentStatusMutation.isPending}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { setAppointmentToCancel(appointment); setShowCancelDialog(true); }}
                        disabled={updateAppointmentStatusMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <AppointmentScheduler
        isOpen={showAppointmentDialog}
        onClose={() => setShowAppointmentDialog(false)}
        onAppointmentCreated={() => setShowAppointmentDialog(false)}
      />
      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-2">
              <div><strong>Service:</strong> {selectedAppointment.service_type}</div>
              <div><strong>Provider:</strong> {selectedAppointment.provider_type}</div>
              <div><strong>Date:</strong> {new Date(selectedAppointment.appointment_date).toLocaleDateString()}</div>
              <div><strong>Time:</strong> {selectedAppointment.appointment_time}</div>
              <div><strong>Status:</strong> {selectedAppointment.status}</div>
              {selectedAppointment.notes && <div><strong>Notes:</strong> {selectedAppointment.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Reschedule Dialog */}
      <AppointmentScheduler
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        onAppointmentCreated={() => setShowRescheduleDialog(false)}
        appointment={selectedAppointment}
        mode="edit"
      />
      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to cancel this appointment?</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>No</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (appointmentToCancel) {
                  updateAppointmentStatus(appointmentToCancel.id, 'cancelled');
                  setShowCancelDialog(false);
                }
              }}
              disabled={updateAppointmentStatusMutation.isPending}
            >
              Yes, Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Lab Directory Dialog */}
      <Dialog open={showLabDirectory} onOpenChange={setShowLabDirectory}>
        <DialogContent className="max-w-3xl w-full sm:w-[95vw] h-[90vh] sm:h-auto p-2 sm:p-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Lab</DialogTitle>
          </DialogHeader>
          <LabDirectory
            onSelectLab={(lab) => {
              setSelectedLab(lab);
              setShowLabDirectory(false);
              setShowLabScheduler(true);
            }}
            hideHeader
          />
        </DialogContent>
      </Dialog>
      {/* Lab Appointment Scheduler */}
      <AppointmentScheduler
        isOpen={showLabScheduler}
        onClose={() => setShowLabScheduler(false)}
        onAppointmentCreated={() => setShowLabScheduler(false)}
        lab={selectedLab}
      />
      {/* Pharmacy Directory Dialog */}
      <Dialog open={showPharmacyDirectory} onOpenChange={setShowPharmacyDirectory}>
        <DialogContent className="max-w-3xl w-full sm:w-[95vw] h-[90vh] sm:h-auto p-2 sm:p-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Pharmacy</DialogTitle>
          </DialogHeader>
          <PharmacyDirectory
            onSelectPharmacy={(pharmacy) => {
              setSelectedPharmacy(pharmacy);
              setShowPharmacyDirectory(false);
              setShowPharmacyScheduler(true);
            }}
            hideHeader
          />
        </DialogContent>
      </Dialog>
      {/* Pharmacy Appointment Scheduler */}
      <PharmacyAppointmentScheduler
        isOpen={showPharmacyScheduler}
        onClose={() => setShowPharmacyScheduler(false)}
        onAppointmentCreated={() => setShowPharmacyScheduler(false)}
        pharmacy={selectedPharmacy ? { id: selectedPharmacy.id, name: selectedPharmacy.name } : undefined}
      />
    </div>
  );
};

export default Appointments;
