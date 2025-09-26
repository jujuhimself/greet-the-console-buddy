import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Appointment } from '@/components/lab/LabAppointmentsList';
import type { TestResult } from '@/components/lab/LabResultsList';

export function useLabDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['labDashboardData', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated.');

      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching lab data for lab_id:', user.id, 'and date:', today);
      
      // Fetch appointments from the appointments table for this lab
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('provider_id', user.id)
        .eq('provider_type', 'lab')
        .order('created_at', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Two-step fetch: get all user_ids
      const userIds = [...new Set((appointmentsData || []).map((a: any) => a.user_id))];
      let profilesMap: Record<string, { name?: string; email?: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
        (profiles || []).forEach((p: any) => {
          profilesMap[p.id] = { name: p.name, email: p.email };
        });
      }

      const transformedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id, // appointment.id
        patientName: profilesMap[apt.user_id]?.name || profilesMap[apt.user_id]?.email || 'Unknown Patient',
        testType: apt.service_type || 'Lab Test',
        date: apt.appointment_date || today,
        time: apt.appointment_time || '',
        status: apt.status || 'scheduled',
        priority: 'normal' // priority is not in the db, keeping as-is for now
      }));

      console.log('Transformed appointments:', transformedAppointments);
      
      // For now, use the same appointments as test results (since we don't have separate results yet)
      const transformedResults: TestResult[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        patientName: profilesMap[apt.user_id]?.name || profilesMap[apt.user_id]?.email || 'Unknown Patient',
        testType: apt.service_type || 'Lab Test',
        completedDate: apt.status === 'completed' ? new Date(apt.updated_at).toLocaleDateString() : 'Pending',
        status: apt.status || 'pending',
        values: {} // No result values yet
      }));

      // Calculate stats
      const todayAppointments = transformedAppointments.filter(apt => apt.date === today).length;
      const pendingResults = transformedResults.filter(r => r.status === 'pending' || r.status === 'scheduled').length;
      const urgentTests = transformedAppointments.filter(a => a.priority === 'urgent').length;
      const completedToday = transformedResults.filter(r => 
        r.status === 'completed' && 
        r.completedDate === new Date().toLocaleDateString()
      ).length;

      const stats = {
        todayAppointments,
        pendingResults,
        urgentTests,
        completedToday
      };

      return { stats, appointments: transformedAppointments, testResults: transformedResults };
    },
    enabled: !!user && user.role === 'lab',
  });
}
