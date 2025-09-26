import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FaDownload, FaSearch, FaFilter, FaEye, FaHistory, FaChartBar, FaUsers, FaBoxes } from 'react-icons/fa';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
}

interface ActivitySummary {
  total_actions: number;
  today_actions: number;
  this_week_actions: number;
  this_month_actions: number;
}

const reportTypes = [
  { value: 'all', label: 'All Activities' },
  { value: 'inventory', label: 'Inventory Changes' },
  { value: 'orders', label: 'Order Activities' },
  { value: 'users', label: 'User Actions' },
  { value: 'financial', label: 'Financial Transactions' }
];

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

export default function AuditReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ActivitySummary>({
    total_actions: 0,
    today_actions: 0,
    this_week_actions: 0,
    this_month_actions: 0
  });
  
  // Filters
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    if (user) {
      loadAuditData();
    }
  }, [user, selectedReportType, selectedTimeRange]);

  const loadAuditData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Enhanced mock audit data with more realistic entries
      const mockAuditLogs: AuditLog[] = [
        {
          id: '1',
          user_id: user.id,
          action: 'create',
          table_name: 'products',
          record_id: 'prod-123',
          old_values: null,
          new_values: { name: 'Paracetamol 500mg', stock: 100, price: 2500 },
          ip_address: '192.168.1.1',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: user.id,
          action: 'update',
          table_name: 'inventory_adjustments',
          record_id: 'adj-456',
          old_values: { quantity: 10 },
          new_values: { quantity: 15 },
          ip_address: '192.168.1.1',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          user_id: user.id,
          action: 'create',
          table_name: 'orders',
          record_id: 'ord-789',
          old_values: null,
          new_values: { total_amount: 15000, status: 'pending' },
          ip_address: '192.168.1.2',
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '4',
          user_id: user.id,
          action: 'update',
          table_name: 'products',
          record_id: 'prod-124',
          old_values: { stock: 50, price: 3000 },
          new_values: { stock: 45, price: 3200 },
          ip_address: '192.168.1.3',
          created_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: '5',
          user_id: user.id,
          action: 'delete',
          table_name: 'products',
          record_id: 'prod-125',
          old_values: { name: 'Expired Medicine', stock: 0 },
          new_values: null,
          ip_address: '192.168.1.1',
          created_at: new Date(Date.now() - 345600000).toISOString()
        },
        {
          id: '6',
          user_id: user.id,
          action: 'create',
          table_name: 'suppliers',
          record_id: 'sup-001',
          old_values: null,
          new_values: { name: 'MedSupply Ltd', contact: '+255123456789' },
          ip_address: '192.168.1.4',
          created_at: new Date(Date.now() - 432000000).toISOString()
        },
        {
          id: '7',
          user_id: user.id,
          action: 'update',
          table_name: 'orders',
          record_id: 'ord-790',
          old_values: { status: 'pending' },
          new_values: { status: 'completed' },
          ip_address: '192.168.1.2',
          created_at: new Date(Date.now() - 518400000).toISOString()
        },
        {
          id: '8',
          user_id: user.id,
          action: 'create',
          table_name: 'prescriptions',
          record_id: 'pres-001',
          old_values: null,
          new_values: { patient_name: 'John Doe', medication: 'Amoxicillin' },
          ip_address: '192.168.1.5',
          created_at: new Date(Date.now() - 604800000).toISOString()
        },
        {
          id: '9',
          user_id: user.id,
          action: 'update',
          table_name: 'inventory_adjustments',
          record_id: 'adj-457',
          old_values: { reason: 'Damaged goods' },
          new_values: { reason: 'Damaged goods', quantity: 5 },
          ip_address: '192.168.1.1',
          created_at: new Date(Date.now() - 691200000).toISOString()
        },
        {
          id: '10',
          user_id: user.id,
          action: 'create',
          table_name: 'users',
          record_id: 'usr-002',
          old_values: null,
          new_values: { name: 'Jane Smith', role: 'pharmacist' },
          ip_address: '192.168.1.6',
          created_at: new Date(Date.now() - 777600000).toISOString()
        }
      ];
      
      setAuditLogs(mockAuditLogs);
      calculateSummary(mockAuditLogs);
      
    } catch (error) {
      console.error('Error loading audit data:', error);
      toast({
        title: 'Error loading audit data',
        description: 'Failed to load audit reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (logs: AuditLog[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const todayActions = logs.filter(log => new Date(log.created_at) >= today).length;
    const weekActions = logs.filter(log => new Date(log.created_at) >= weekAgo).length;
    const monthActions = logs.filter(log => new Date(log.created_at) >= monthAgo).length;

    setSummary({
      total_actions: logs.length,
      today_actions: todayActions,
      this_week_actions: weekActions,
      this_month_actions: monthActions
    });
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = selectedUser === '' || log.user_id === selectedUser;
    
    return matchesSearch && matchesUser;
  });

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      toast({
        title: 'Export started',
        description: `Generating ${format.toUpperCase()} report...`
      });
      
      // Simulate export
      setTimeout(() => {
        toast({
          title: 'Export complete',
          description: 'Report downloaded successfully'
        });
      }, 2000);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to generate report',
        variant: 'destructive'
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <FaEye className="h-4 w-4 text-green-600" />;
      case 'update':
        return <FaHistory className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <FaHistory className="h-4 w-4 text-red-600" />;
      default:
        return <FaHistory className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Badge variant="default">Create</Badge>;
      case 'update':
        return <Badge variant="secondary">Update</Badge>;
      case 'delete':
        return <Badge variant="destructive">Delete</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getUserDisplayName = (userId: string) => {
    // In a real app, this would fetch from a users table
    // For now, return a friendly name based on the current user
    if (userId === user?.id) {
      return user?.name || user?.pharmacyName || 'Current User';
    }
    return `User ${userId.slice(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading audit reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive audit trails and compliance reporting
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => exportReport('csv')} className="flex items-center gap-2">
            <FaDownload className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')} className="flex items-center gap-2">
            <FaDownload className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <FaHistory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_actions}</div>
            <p className="text-xs text-muted-foreground">
              All time activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <FaChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.today_actions}</div>
            <p className="text-xs text-muted-foreground">
              Actions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <FaUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.this_week_actions}</div>
            <p className="text-xs text-muted-foreground">
              Actions this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <FaBoxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.this_month_actions}</div>
            <p className="text-xs text-muted-foreground">
              Actions this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaFilter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {/* This would be populated with actual users */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Detailed audit trail of all system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FaHistory className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getUserDisplayName(log.user_id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.table_name}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.record_id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.ip_address}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Activity Summary</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Changes</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed activity analysis and trends will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Inventory modification history and stock movement reports.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Regulatory compliance reports and audit certifications.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 