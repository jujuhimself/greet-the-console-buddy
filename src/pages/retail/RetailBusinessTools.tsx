import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RetailBusinessTools() {
  const { user } = useAuth();
  const location = useLocation();

  // Only allow retail users
  if (!user || user.role !== "retail") {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Not authorized.</div>;
  }

  // Redirect /business-tools-retail to default sub-page
  if (location.pathname === "/business-tools-retail") {
    return <Navigate to="/retail/pos" replace />;
  }

  // Show a simple business tools overview page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Tools</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Point of Sale</h3>
              <p className="text-gray-600 mb-4">Manage sales and transactions</p>
              <a href="/retail/pos" className="text-blue-600 hover:text-blue-800">Go to POS →</a>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Forecasting</h3>
              <p className="text-gray-600 mb-4">Analyze trends and predict demand</p>
              <a href="/retail/forecast" className="text-blue-600 hover:text-blue-800">Go to Forecast →</a>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Inventory Adjustment</h3>
              <p className="text-gray-600 mb-4">Adjust stock levels and counts</p>
              <a href="/retail/adjustment" className="text-blue-600 hover:text-blue-800">Go to Adjustments →</a>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Credit Management</h3>
              <p className="text-gray-600 mb-4">Manage customer credit and payments</p>
              <a href="/retail/credit" className="text-blue-600 hover:text-blue-800">Go to Credit →</a>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Audit Log</h3>
              <p className="text-gray-600 mb-4">View system activity and changes</p>
              <a href="/retail/audit-log" className="text-blue-600 hover:text-blue-800">Go to Audit Log →</a>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Reporting</h3>
              <p className="text-gray-600 mb-4">Generate reports and analytics</p>
              <a href="/retail/reporting" className="text-blue-600 hover:text-blue-800">Go to Reports →</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
