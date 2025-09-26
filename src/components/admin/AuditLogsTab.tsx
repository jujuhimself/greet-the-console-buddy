import { useAuditLogs } from "@/hooks/useAudit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, Download, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

const AuditLogsTab = () => {
  const { data, isLoading, error, refetch } = useAuditLogs();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString?.substring(0, 16) || 'Unknown';
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'approve_user':
      case 'login':
        return 'default';
      case 'update':
      case 'modify':
        return 'secondary';
      case 'delete':
      case 'reject_user':
      case 'suspend_user':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Audit Logs
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-gray-600">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-red-600 text-center">Failed to load audit logs</p>
            <p className="text-sm text-gray-500 text-center">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {(!data || data.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <User className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-600 text-center">No audit logs found</p>
                  <p className="text-sm text-gray-500 text-center">
                    System activities will appear here once they occur.
                  </p>
                </div>
              ) : (
                data.map((log: any) => (
                  <div 
                    key={log.id} 
                    className="border-b pb-3 pt-3 last:border-0 hover:bg-gray-50 rounded-lg px-3 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                          {log.action}
                        </Badge>
                        <span className="font-medium text-sm capitalize">
                          {log.resource_type}
                        </span>
                        {log.category && (
                          <span className="bg-blue-50 px-2 py-0.5 rounded text-xs text-blue-900">
                            {log.category}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>User: {log.user_id?.slice(0, 8)}...</span>
                        {log.resource_id && (
                          <span className="text-gray-400">
                            | Resource: {log.resource_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                      {log.ip_address && (
                        <span className="text-gray-400">
                          IP: {log.ip_address}
                        </span>
                      )}
                    </div>

                    {(log.old_values || log.new_values) && (
                      <div className="mt-2 text-xs bg-gray-100 rounded p-2">
                        {log.old_values && (
                          <div className="mb-1">
                            <span className="font-medium text-red-600">Before: </span>
                            <span className="text-gray-700">
                              {JSON.stringify(log.old_values).slice(0, 100)}...
                            </span>
                          </div>
                        )}
                        {log.new_values && (
                          <div>
                            <span className="font-medium text-green-600">After: </span>
                            <span className="text-gray-700">
                              {JSON.stringify(log.new_values).slice(0, 100)}...
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogsTab;
