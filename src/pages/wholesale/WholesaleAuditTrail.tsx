import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shield, Activity, Package, DollarSign, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { auditService } from "@/services/auditService";
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  details?: any;
  category?: string;
  created_at: string;
}

const WholesaleAuditTrail = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const filteredSalesLogs = filteredLogs.filter(log => log.category === 'sales');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, categoryFilter, actionFilter, dateFilter]);

  useEffect(() => {
    if (filteredSalesLogs.length > 0) {
      const userIds = Array.from(new Set(filteredSalesLogs.map(log => log.user_id)));
      supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds)
        .then(({ data }) => {
          const map: Record<string, string> = {};
          (data || []).forEach((p: any) => {
            map[p.id] = p.name || p.email || p.id;
          });
          setUserProfiles(map);
        });
    }
  }, [filteredSalesLogs]);

  const fetchAuditLogs = async () => {
    try {
      if (!user) return;
      let logs = [];
      if (user.role === 'wholesale') {
        // Try to fetch org-wide logs by wholesaler_id (assume audit_logs table has wholesaler_id)
        logs = await auditService.getOrgActivity(user.id);
        // If no logs found, fallback to user-specific logs
        if (!logs || logs.length === 0) {
          logs = await auditService.getUserActivity(user.id);
        }
      } else {
        logs = await auditService.getUserActivity(user.id);
      }
      setAuditLogs(logs);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch audit logs",
        variant: "destructive",
      });
    }
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    if (actionFilter && actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredLogs(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return Package;
      case 'authentication': return Shield;
      case 'sales': return DollarSign;
      case 'staff': return Users;
      default: return Activity;
    }
  };

  const getCategoryBadge = (category: string) => {
    const config = {
      'inventory': { variant: 'default' as const, label: 'Inventory' },
      'authentication': { variant: 'secondary' as const, label: 'Auth' },
      'sales': { variant: 'destructive' as const, label: 'Sales' },
      'staff': { variant: 'outline' as const, label: 'Staff' },
      'settings': { variant: 'secondary' as const, label: 'Settings' },
      'general': { variant: 'outline' as const, label: 'General' }
    };

    const categoryConfig = config[category as keyof typeof config] || config['general'];
    return <Badge variant={categoryConfig.variant}>{categoryConfig.label}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const config = {
      'CREATE': { variant: 'default' as const, label: 'Created' },
      'UPDATE': { variant: 'secondary' as const, label: 'Updated' },
      'DELETE': { variant: 'destructive' as const, label: 'Deleted' },
      'LOGIN': { variant: 'outline' as const, label: 'Login' },
      'LOGOUT': { variant: 'outline' as const, label: 'Logout' },
      'STOCK_UPDATE': { variant: 'default' as const, label: 'Stock Updated' },
      'INVENTORY_MOVEMENT': { variant: 'secondary' as const, label: 'Stock Movement' }
    };

    const actionConfig = config[action as keyof typeof config] || { variant: 'outline' as const, label: action };
    return <Badge variant={actionConfig.variant}>{actionConfig.label}</Badge>;
  };

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return null;

    const changes = [];
    
    if (oldValues && newValues) {
      for (const key in newValues) {
        if (oldValues[key] !== newValues[key]) {
          changes.push(`${key}: ${oldValues[key]} → ${newValues[key]}`);
        }
      }
    } else if (newValues) {
      for (const key in newValues) {
        changes.push(`${key}: ${newValues[key]}`);
      }
    }

    return changes.length > 0 ? changes.join(', ') : null;
  };

  const categories = ['inventory', 'authentication', 'sales', 'staff', 'settings'];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STOCK_UPDATE', 'INVENTORY_MOVEMENT'];

  const inventoryLogs = filteredLogs.filter(log => log.category === 'inventory');
  const authLogs = filteredLogs.filter(log => log.category === 'authentication');

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(Boolean).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.filter(Boolean).map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Logs ({filteredLogs.length})</TabsTrigger>
          <TabsTrigger value="inventory">Inventory ({inventoryLogs.length})</TabsTrigger>
          <TabsTrigger value="auth">Authentication ({authLogs.length})</TabsTrigger>
          <TabsTrigger value="sales">Sales ({filteredSalesLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                All System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getCategoryBadge(log.category || 'general')}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.resource_type}</div>
                          {log.resource_id && (
                            <div className="text-sm text-gray-500">{log.resource_id}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm">
                          {formatChanges(log.old_values, log.new_values)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm">
                          {log.details?.message || JSON.stringify(log.details)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No audit logs found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Stock Changes</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryLogs.slice(0, 30).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>{log.resource_id}</TableCell>
                      <TableCell>
                        {log.old_values?.stock && log.new_values?.stock && (
                          <Badge variant="outline">
                            {log.old_values.stock} → {log.new_values.stock}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details?.message}
                      </TableCell>
                    </TableRow>
                  ))}
                  {inventoryLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No inventory activity found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authLogs.slice(0, 30).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-mono text-sm">{log.user_id}</TableCell>
                      <TableCell>{log.details?.message}</TableCell>
                    </TableRow>
                  ))}
                  {authLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No authentication activity found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Sales Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesLogs.slice(0, 30).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>{log.resource_type}</TableCell>
                      <TableCell>
                        {log.new_values?.total_amount && (
                          <span className="font-medium">
                            TZS {log.new_values.total_amount.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details?.message}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSalesLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No sales activity found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WholesaleAuditTrail;
