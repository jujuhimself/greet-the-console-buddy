import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function BusinessToolsRetail() {
  const { user } = useAuth();

  if (!user) {
    // Show access denied if not logged in.
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p>Please log in to access business tools.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If logged in, redirect to the retail business tools page
  return <Navigate to="/retail/pos" replace />;
}
