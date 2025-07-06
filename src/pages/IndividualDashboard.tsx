import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIndividualDashboard } from "@/hooks/useIndividualDashboard";
import IndividualStatsCards from "@/components/individual/IndividualStatsCards";
import IndividualQuickActions from "@/components/individual/IndividualQuickActions";
import NearbyPharmacies from "@/components/individual/NearbyPharmacies";
import HealthSummary from "@/components/individual/HealthSummary";
import LabResults from "@/components/individual/LabResults";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationSubscription } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";

const IndividualDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLoading, isError, stats, recentOrders, labAppointments } = useIndividualDashboard();
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);

  // Enable notification subscription for individuals
  useNotificationSubscription();

  useEffect(() => {
    if (!user || user.role !== 'individual') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchNearbyPharmacies() {
      // Fetch pharmacies from profiles table (role=retail)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, business_name, name, region, city, phone, address, is_approved')
        .eq('role', 'retail')
        .eq('is_approved', true)
        .limit(5);

      if (!error && Array.isArray(data)) {
        setNearbyPharmacies(
          data.map((p: any) => ({
            id: p.id,
            name: p.business_name || p.name || "Pharmacy",
            location: p.address || ((p.city && p.region) ? `${p.city}, ${p.region}` : 'Location not set'),
            phone: p.phone || 'N/A',
            rating: 4.5,
            distance: 'N/A',
            open: true,
            hours: '8:00 AM - 8:00 PM',
          }))
        );
      }
    }
    fetchNearbyPharmacies();
  }, []);

  if (!user || user.role !== 'individual' || isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-600">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={`Welcome back, ${user?.name}`}
          description="Find nearby pharmacies and order your medicines"
          badge={{ text: "Patient Portal", variant: "outline" }}
        />
        <div className="mb-6 flex justify-end">
          <Link to="/dashboard/personal-health">
            <Button variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 font-semibold shadow">
              🌟 Personal Health: HIV Self-Test & Circumcision
            </Button>
          </Link>
        </div>
        <IndividualStatsCards stats={stats} />
        <IndividualQuickActions />
        <div className="grid lg:grid-cols-2 gap-8">
          <NearbyPharmacies pharmacies={nearbyPharmacies} />
          <HealthSummary totalOrders={stats.totalOrders} recentOrders={recentOrders} />
        </div>
        <div className="mt-8">
          <LabResults labAppointments={labAppointments} />
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
