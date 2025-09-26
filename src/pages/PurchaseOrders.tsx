import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import PurchaseOrderManagement from "@/components/inventory/PurchaseOrderManagement";

const PurchaseOrdersPage = () => {
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
          title="Purchase Orders"
          description="Manage purchase orders and track supplier deliveries"
          badge={{ text: "Procurement", variant: "outline" }}
        />

        <PurchaseOrderManagement />
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;
