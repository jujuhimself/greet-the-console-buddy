
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminAnalyticsTab = () => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Platform Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>New registrations this week</span>
            <Badge variant="default">+12</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Order volume growth</span>
            <Badge variant="default">+18%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Revenue growth</span>
            <Badge variant="default">+25%</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Server uptime</span>
            <Badge variant="default" className="bg-green-100 text-green-800">99.9%</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Average response time</span>
            <Badge variant="outline">120ms</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Active sessions</span>
            <Badge variant="outline">247</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminAnalyticsTab;
