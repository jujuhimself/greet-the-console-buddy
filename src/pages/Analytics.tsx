import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg border-0">
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
} 