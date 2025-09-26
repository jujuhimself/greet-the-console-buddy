import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PrescriptionUploadForm from "@/components/PrescriptionUploadForm";
import DatabasePrescriptionList from "@/components/DatabasePrescriptionList";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

const Prescriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user || user.role !== 'individual') {
    navigate('/login');
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Prescriptions"
          description="Upload and manage your medical prescriptions"
          badge={{ text: "Health Records", variant: "outline" }}
        />
        <PrescriptionUploadForm onUploadSuccess={() => setRefreshKey(k => k + 1)} />
        <DatabasePrescriptionList key={refreshKey} />
      </div>
    </div>
  );
};

export default Prescriptions;
