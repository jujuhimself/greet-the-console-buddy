import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar, 
  FileText, 
  TestTube, 
  BarChart3, 
  Bell, 
  Users,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Home,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useLabDashboard } from "@/hooks/useLabDashboard";
import { useTodaysAppointments } from "@/hooks/useAppointments";
import AppointmentScheduler from "@/components/lab/AppointmentScheduler";
import AppointmentCalendar from "@/components/lab/AppointmentCalendar";
import LabResultsManager from "@/components/lab/LabResultsManager";
import LabTestCatalog from "@/components/lab/LabTestCatalog";
import LabAnalytics from "@/components/lab/LabAnalytics";
import SmartNotifications from "@/components/lab/SmartNotifications";
import PatientManagement from "@/components/lab/PatientManagement";
import LabStatsCards from "@/components/lab/LabStatsCards";
import LabQuickActions from "@/components/lab/LabQuickActions";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';

const LabDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useLabDashboard();
  const { data: appointments, isLoading: appointmentsLoading } = useTodaysAppointments('lab');
  const [activeTab, setActiveTab] = useState("overview");
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const todayAppointments = appointments || [];
  const pendingResults = data?.testResults?.filter(result => 
    result.status === 'pending' || result.status === 'scheduled'
  ) || [];

  if (isLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading laboratory dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{(error as Error)?.message || "An unknown error occurred"}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { 
    todayAppointments: 0, 
    pendingResults: 0, 
    urgentTests: 0, 
    completedToday: 0 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Laboratory Dashboard</h1>
                  <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
                <span>•</span>
                <span>Laboratory</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setShowAppointmentScheduler(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto p-1">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="appointments" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Results</span>
              </TabsTrigger>
              <TabsTrigger 
                value="catalog" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <TestTube className="h-4 w-4" />
                <span className="hidden sm:inline">Catalog</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="patients" 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Patients</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <LabStatsCards
              todayAppointmentsCount={stats.todayAppointments}
              pendingResultsCount={stats.pendingResults}
              urgentTestsCount={stats.urgentTests}
              completedTodayCount={stats.completedToday}
            />

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Today's Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
                      <p className="text-sm text-gray-400 mt-1">All clear for today!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayAppointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{(appointment as any).patientName || 'Unknown Patient'}</p>
                            <p className="text-sm text-gray-600">{appointment.service_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{appointment.appointment_time}</p>
                            <Badge 
                              variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {todayAppointments.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab("appointments")}>
                            View all {todayAppointments.length} appointments
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Results */}
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Pending Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingResults.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">All results are up to date</p>
                      <p className="text-sm text-gray-400 mt-1">Great job staying on top of things!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingResults.slice(0, 5).map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{result.patientName || 'Unknown Patient'}</p>
                            <p className="text-sm text-gray-600">{result.testType}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {result.completedDate}
                            </p>
                            <Badge 
                              variant={result.status === 'pending' ? 'secondary' : 'default'}
                              className="mt-1"
                            >
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {pendingResults.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab("results")}>
                            View all {pendingResults.length} pending results
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
                  <p className="text-gray-600">Schedule and manage laboratory appointments</p>
                </div>
                <Button 
                  onClick={() => setShowAppointmentScheduler(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
              <AppointmentCalendar />
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lab Results Management</h2>
                <p className="text-gray-600">Create, manage, and track laboratory test results</p>
              </div>
              <LabResultsManager />
            </div>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lab Test Catalog</h2>
                <p className="text-gray-600">Manage available laboratory tests and their specifications</p>
              </div>
              <LabTestCatalog />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
                <p className="text-gray-600">Comprehensive insights into laboratory operations and performance</p>
              </div>
              <LabAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Smart Notifications</h2>
                <p className="text-gray-600">Configure and manage automated notifications for patients and staff</p>
              </div>
              <SmartNotifications />
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
                <p className="text-gray-600">Manage patient profiles, medical history, and laboratory records</p>
              </div>
              <PatientManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Appointment Scheduler Modal */}
      <AppointmentScheduler
        isOpen={showAppointmentScheduler}
        onClose={() => setShowAppointmentScheduler(false)}
        onAppointmentCreated={() => {
          refetch();
        }}
        lab={user ? { id: user.id, name: user.name || user.email } : undefined}
      />
    </div>
  );
};

export default LabDashboard;
