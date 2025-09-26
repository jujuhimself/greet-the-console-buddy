import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Server, Database, Users, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  recorded_at: string;
  metadata: any;
}

interface UserSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  ip_address?: string;
  user_agent?: string;
  device_info: any;
  location: any;
  is_active: boolean;
}

const AdminSystemMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSystemData();
    }
  }, [user]);

  const fetchSystemData = async () => {
    try {
      // Fetch system metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);

      // Fetch active user sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('session_start', { ascending: false });

      if (sessionsError) throw sessionsError;
      
      // Fix the type issue by properly handling the data
      const typedSessions: UserSession[] = (sessionsData || []).map(session => ({
        ...session,
        ip_address: session.ip_address as string || '',
      }));
      
      setActiveSessions(typedSessions);

    } catch (error) {
      console.error('Error fetching system data:', error);
      toast({
        title: "Error",
        description: "Failed to load system monitoring data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemHealthStatus = () => {
    // Mock system health calculation
    const criticalMetrics = metrics.filter(m => 
      m.metric_name.includes('error') || 
      m.metric_name.includes('failure')
    );
    
    if (criticalMetrics.length > 0) {
      return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    }
    return { status: 'healthy', color: 'text-green-600', icon: CheckCircle };
  };

  const healthStatus = getSystemHealthStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div>Loading system monitoring data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="System Monitoring"
          description="Monitor system health, performance, and user activity"
          badge={{ text: "Admin Portal", variant: "destructive" }}
        />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <healthStatus.icon className={`h-5 w-5 ${healthStatus.color}`} />
            <span className={`font-medium ${healthStatus.color}`}>
              System Status: {healthStatus.status}
            </span>
          </div>
          <Button onClick={fetchSystemData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* System Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {activeSessions.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                </div>
                <Server className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Database Health</p>
                  <p className="text-2xl font-bold text-green-600">Good</p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics.find(m => m.metric_name === 'response_time')?.metric_value || 120}ms
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No metrics available</p>
              ) : (
                <div className="space-y-3">
                  {metrics.slice(0, 10).map((metric) => (
                    <div key={metric.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{metric.metric_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(metric.recorded_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {metric.metric_value}
                          {metric.metric_unit && <span className="text-sm ml-1">{metric.metric_unit}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active User Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active sessions</p>
              ) : (
                <div className="space-y-3">
                  {activeSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">User: {session.user_id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-600">
                          Started: {new Date(session.session_start).toLocaleString()}
                        </p>
                        {session.ip_address && (
                          <p className="text-xs text-gray-500">IP: {session.ip_address}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          Active
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemMonitoring;
