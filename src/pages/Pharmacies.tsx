import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PharmacyFinder from "@/components/PharmacyFinder";
import PageHeader from "@/components/PageHeader";

const Pharmacies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'individual') {
    navigate('/login');
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Find Pharmacies"
          description="Locate nearby pharmacies and browse their products"
          badge={{ text: "Healthcare Directory", variant: "outline" }}
        />

        <PharmacyFinder />
      </div>
    </div>
  );
};

export default Pharmacies;
