import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function WholesaleBusinessTools() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== "wholesale") {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Not authorized.</div>;
  }

  // Redirect /wholesale/business-tools to default sub-page
  if (location.pathname === "/wholesale/business-tools") {
    return <Navigate to="/wholesale/business-tools/pos" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      <div className="flex flex-1 w-full">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
