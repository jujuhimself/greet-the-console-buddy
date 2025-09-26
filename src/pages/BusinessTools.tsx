import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "@/components/BarcodeScanner";
import FinancialManagement from "@/components/FinancialManagement";
import CustomerRelationshipManagement from "@/components/CustomerRelationshipManagement";
import DeliveryTracking from "@/components/DeliveryTracking";
import NotificationManagement from '@/components/NotificationManagement';
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { 
  Scan, 
  DollarSign, 
  Users, 
  Truck, 
  Bell, 
  BarChart3,
  Package,
  MessageCircle
} from "lucide-react";

const BusinessOperationsHub = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'retail' && user.role !== 'wholesale' && user.role !== 'admin'))) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'retail' && user.role !== 'wholesale' && user.role !== 'admin')) {
    return null;
  }

  const tools = [
    {
      id: "inventory",
      label: "Advanced Inventory",
      icon: <Scan className="h-4 w-4" />,
      description: "Barcode scanning and automated alerts"
    },
    {
      id: "financial",
      label: "Financial Management",
      icon: <DollarSign className="h-4 w-4" />,
      description: "Expense tracking and profit reports"
    },
    {
      id: "crm",
      label: "Customer Management",
      icon: <Users className="h-4 w-4" />,
      description: "Customer history and communication"
    },
    {
      id: "delivery",
      label: "Delivery Tracking",
      icon: <Truck className="h-4 w-4" />,
      description: "Real-time order tracking"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      description: "SMS/Email alerts management"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Business Operations Hub</h1>
          <p className="text-gray-600 text-lg">Enhanced tools to manage your healthcare business efficiently</p>
        </div>

        {/* Tools Overview */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {tools.map(tool => (
            <Card 
              key={tool.id}
              className={`cursor-pointer transition-all ${
                activeTab === tool.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => setActiveTab(tool.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">{tool.icon}</div>
                <h3 className="font-medium text-sm">{tool.label}</h3>
                <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tool Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            {tools.map(tool => (
              <TabsTrigger key={tool.id} value={tool.id}>{tool.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Advanced Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarcodeScanner />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Financial Management Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FinancialManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crm">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Customer Relationship Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerRelationshipManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Tracking System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryTracking />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Business Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsDashboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessOperationsHub;
