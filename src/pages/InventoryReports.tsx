import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import InventoryReports from "@/components/inventory/InventoryReports";

const InventoryReportsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'retail' && user.role !== 'wholesale')) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'retail' && user.role !== 'wholesale')) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Inventory Reports"
          description="Generate comprehensive reports and analytics for your inventory"
          badge={{ text: "Analytics", variant: "outline" }}
        />

        <InventoryReports />
      </div>
    </div>
  );
};

export default InventoryReportsPage;
