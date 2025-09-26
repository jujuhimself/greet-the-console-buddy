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
import { Card, CardContent } from "@/components/ui/card";

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
        {/* Bepawa Care CTA */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-3">
                <div className="p-6 md:p-8 lg:col-span-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-3">
                    New • Mental Health Support
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Bepawa Care</h3>
                  <p className="text-gray-700 mb-4">Confidential, stigma-free therapy — anywhere in Tanzania. Chat 24/7 or book a licensed counselor.</p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/bepawa-care">
                      <Button className="bg-green-600 hover:bg-green-700">Explore Bepawa Care</Button>
                    </Link>
                    <a href="https://wa.me/255713434625" target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">WhatsApp</Button>
                    </a>
                  </div>
                </div>
                {/* Illustration */}
                <div className="relative bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-0 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&w=1400&q=80"
                    alt="Therapy session representing mental health support"
                    className="w-full h-[220px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <IndividualStatsCards stats={stats} />
        <IndividualQuickActions />
        <div className="grid lg:grid-cols-2 gap-8">
          <NearbyPharmacies pharmacies={nearbyPharmacies} />
          <HealthSummary totalOrders={stats.totalOrders} recentOrders={recentOrders} />
        </div>
        <div className="mt-8">
          <LabResults />
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
