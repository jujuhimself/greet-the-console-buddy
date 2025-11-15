import { supabase } from '@/integrations/supabase/client';
import { comprehensiveNotificationService } from './comprehensiveNotificationService';

export interface Appointment {
  id: string;
  user_id: string;
  provider_id?: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  provider_type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  priority?: string;
}

class AppointmentService {
  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;

    // Send notification for new appointment
    try {
      const { data: userData } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', appointment.user_id)
        .single();

      if (userData?.email) {
        await comprehensiveNotificationService.notifyLabTestBooked(
          appointment.user_id,
          userData.email,
          appointment.service_type,
          appointment.appointment_date,
          appointment.appointment_time,
          appointment.provider_type
        );
      }
    } catch (notifError) {
      console.error('Failed to send appointment notification:', notifError);
    }

    return data;
  }

  async fetchUserAppointments(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(apt => ({
      ...apt,
      status: apt.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
      priority: apt.priority || 'routine',
    }));
  }

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Send notification for appointment status changes
    try {
      const { data: userData } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', data.user_id)
        .single();

      if (userData?.email && (status === 'confirmed' || status === 'cancelled')) {
        const title = status === 'confirmed' 
          ? '✅ Appointment Confirmed'
          : '❌ Appointment Cancelled';
        const message = status === 'confirmed'
          ? `Your ${data.service_type} appointment on ${data.appointment_date} at ${data.appointment_time} has been confirmed.`
          : `Your ${data.service_type} appointment has been cancelled.`;

        await comprehensiveNotificationService.notifyAppointmentStatusChange(
          data.user_id,
          userData.email,
          data.service_type,
          data.appointment_date,
          status
        );
      }
    } catch (notifError) {
      console.error('Failed to send appointment status notification:', notifError);
    }

    return data;
  }

  async fetchTodaysAppointments(providerType?: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', today);

    if (providerType) {
      query = query.eq('provider_type', providerType);
    }

    const { data, error } = await query.order('appointment_time', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Two-step fetch: get all user_ids
    const userIds = [...new Set(data.map((a: any) => a.user_id))];
    let profilesMap: Record<string, { name?: string; phone?: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, phone')
        .in('id', userIds);
      (profiles || []).forEach((p: any) => {
        profilesMap[p.id] = { name: p.name, phone: p.phone };
      });
    }

    return (data || []).map(apt => ({
      ...apt,
      status: apt.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
      patient_name: profilesMap[apt.user_id]?.name || undefined,
      patient_phone: profilesMap[apt.user_id]?.phone || undefined,
      priority: apt.priority || 'routine',
    }));
  }

  async updateAppointment(appointmentId: string, update: Partial<Omit<Appointment, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(update)
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export const appointmentService = new AppointmentService();
