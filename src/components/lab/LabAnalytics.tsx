import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  TestTube, 
  Clock, 
  DollarSign, 
  Download,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalAppointments: number;
  completedTests: number;
  pendingTests: number;
  revenue: number;
  avgTurnaroundTime: number;
  patientSatisfaction: number;
}

interface TestMetrics {
  testType: string;
  count: number;
  revenue: number;
  avgTurnaroundTime: number;
}

interface DailyMetrics {
  date: string;
  appointments: number;
  completed: number;
  revenue: number;
}

const LabAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalAppointments: 0,
    completedTests: 0,
    pendingTests: 0,
    revenue: 0,
    avgTurnaroundTime: 0,
    patientSatisfaction: 0
  });
  const [testMetrics, setTestMetrics] = useState<TestMetrics[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), days);

      // Fetch appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .eq('provider_type', 'lab');

      // Fetch lab results
      const { data: results } = await supabase
        .from('lab_results')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Calculate metrics
      const totalAppointments = appointments?.length || 0;
      const completedTests = results?.filter(r => r.status === 'approved').length || 0;
      const pendingTests = results?.filter(r => r.status === 'draft').length || 0;
      
      // Mock revenue calculation (in real app, this would come from billing)
      const revenue = completedTests * 50; // Average $50 per test
      
      // Mock turnaround time (in real app, this would be calculated from actual data)
      const avgTurnaroundTime = 24; // hours
      
      // Mock patient satisfaction (in real app, this would come from surveys)
      const patientSatisfaction = 4.2; // out of 5

      setAnalyticsData({
        totalAppointments,
        completedTests,
        pendingTests,
        revenue,
        avgTurnaroundTime,
        patientSatisfaction
      });

      // Generate test metrics
      const testTypes = ['CBC', 'CMP', 'Lipid Panel', 'Thyroid', 'A1C', 'Urinalysis'];
      const mockTestMetrics: TestMetrics[] = testTypes.map(type => ({
        testType: type,
        count: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 2000) + 500,
        avgTurnaroundTime: Math.floor(Math.random() * 48) + 12
      }));
      setTestMetrics(mockTestMetrics);

      // Generate daily metrics
      const dailyData: DailyMetrics[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        dailyData.push({
          date: format(date, 'MMM dd'),
          appointments: Math.floor(Math.random() * 20) + 5,
          completed: Math.floor(Math.random() * 15) + 3,
          revenue: Math.floor(Math.random() * 1000) + 200
        });
      }
      setDailyMetrics(dailyData);

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    toast({
      title: "Report Exported",
      description: "Analytics report has been downloaded.",
    });
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-green-600";
    if (current < previous) return "text-red-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completedTests}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgTurnaroundTime}h</div>
            <p className="text-xs text-muted-foreground">
              -2h from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyMetrics.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{day.appointments} appointments</span>
                        <span className="text-sm text-gray-600">{day.completed} completed</span>
                        <span className="text-sm font-medium">${day.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="text-sm font-medium">{analyticsData.completedTests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-sm font-medium">{analyticsData.pendingTests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">In Progress</span>
                    </div>
                    <span className="text-sm font-medium">{analyticsData.totalAppointments - analyticsData.completedTests - analyticsData.pendingTests}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Performance by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg Turnaround</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testMetrics.map((test) => (
                    <TableRow key={test.testType}>
                      <TableCell className="font-medium">{test.testType}</TableCell>
                      <TableCell>{test.count}</TableCell>
                      <TableCell>${test.revenue.toLocaleString()}</TableCell>
                      <TableCell>{test.avgTurnaroundTime}h</TableCell>
                      <TableCell>
                        <Badge variant={test.avgTurnaroundTime <= 24 ? "default" : "secondary"}>
                          {test.avgTurnaroundTime <= 24 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyMetrics.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm">{day.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${day.revenue}</span>
                        {getTrendIcon(day.revenue, day.revenue - 50)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyMetrics.slice(-7).map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm">{day.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{day.appointments}</span>
                        {getTrendIcon(day.appointments, day.appointments - 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Daily Summary Report</h4>
                  <p className="text-sm text-gray-600 mb-3">Overview of daily activities, appointments, and revenue</p>
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Test Performance Report</h4>
                  <p className="text-sm text-gray-600 mb-3">Detailed analysis of test types and turnaround times</p>
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Revenue Analysis</h4>
                  <p className="text-sm text-gray-600 mb-3">Financial performance and revenue trends</p>
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Quality Metrics</h4>
                  <p className="text-sm text-gray-600 mb-3">Quality indicators and patient satisfaction</p>
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LabAnalytics; 