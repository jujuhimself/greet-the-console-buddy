
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell } from "lucide-react";

const systemAlerts = [
  {
    id: 1,
    title: "Scheduled Maintenance",
    message: "The platform will be unavailable for maintenance on June 18th, 02:00-04:00.",
    severity: "info",
    created_at: "2025-06-14 13:10",
  },
  {
    id: 2,
    title: "Suspicious Login Detected",
    message: "Unusual login activity detected for user frank@bepawaa.com.",
    severity: "critical",
    created_at: "2025-06-14 10:16",
  },
];

const SystemAlertsTab = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex gap-2 items-center">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        System Alerts
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {systemAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg flex flex-col md:flex-row md:justify-between items-start md:items-center border
            ${alert.severity === 'critical'
                ? 'bg-red-50 border-red-400'
                : 'bg-yellow-50 border-yellow-400'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-semibold">
                {alert.severity === "critical"
                  ? <Badge variant="destructive">Critical</Badge>
                  : <Badge variant="secondary">Info</Badge>
                }
                <span>{alert.title}</span>
              </div>
              <div className="text-sm text-gray-700 mt-1">{alert.message}</div>
            </div>
            <div className="text-xs text-gray-500 mt-2 md:mt-0">
              {alert.created_at}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SystemAlertsTab;
