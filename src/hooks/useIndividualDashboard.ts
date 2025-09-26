import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Returns summarized stats and lists for the individual dashboard
export function useIndividualDashboard() {
  const { user } = useAuth();

  const userId = user?.id;

  // Fetch all orders for the user
  const ordersQuery = useQuery({
    queryKey: ["individual-orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  // Fetch all prescriptions for the user
  const prescriptionsQuery = useQuery({
    queryKey: ["individual-prescriptions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  // Fetch lab appointments for the user
  const labAppointmentsQuery = useQuery({
    queryKey: ["individual-lab-appointments", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", userId)
        .eq("provider_type", "lab")
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  // Wishlist - not implemented in Supabase, show 0, prompt in the UI
  // const wishlistQuery = useQuery(...)

  // Gather computed stats
  const isLoading =
    ordersQuery.isLoading || prescriptionsQuery.isLoading || labAppointmentsQuery.isLoading;
  const isError =
    ordersQuery.isError || prescriptionsQuery.isError || labAppointmentsQuery.isError;

  let stats = {
    totalOrders: 0,
    pendingOrders: 0,
    savedItems: 0, // TODO: Fetch from Supabase if/when wishlist is implemented
    activePrescriptions: 0,
    labAppointments: 0,
    completedLabTests: 0,
  };

  let recentOrders: any[] = [];
  let orders: any[] = Array.isArray(ordersQuery.data) ? ordersQuery.data : [];
  let labAppointments: any[] = Array.isArray(labAppointmentsQuery.data) ? labAppointmentsQuery.data : [];

  if (!isLoading && !isError) {
    stats.totalOrders = orders.length;
    stats.pendingOrders = orders.filter((order) => order.status === "pending").length;
    // savedItems stays 0 for now
    const prescriptions = prescriptionsQuery.data || [];
    stats.activePrescriptions = prescriptions.filter(
      (p: any) => p.status === "pending" || p.status === "processed"
    ).length;
    stats.labAppointments = labAppointments.length;
    stats.completedLabTests = labAppointments.filter((apt) => apt.status === "completed").length;
    recentOrders = orders.slice(0, 5);
  }

  return {
    isLoading,
    isError,
    stats,
    recentOrders,
    labAppointments,
  };
}
