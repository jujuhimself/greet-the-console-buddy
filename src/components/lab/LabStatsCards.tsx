
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, AlertCircle, CheckCircle } from "lucide-react";

interface LabStatsCardsProps {
  todayAppointmentsCount: number;
  pendingResultsCount: number;
  urgentTestsCount: number;
  completedTodayCount: number;
}

const LabStatsCards = ({
  todayAppointmentsCount,
  pendingResultsCount,
  urgentTestsCount,
  completedTodayCount,
}: LabStatsCardsProps) => (
  <div className="grid md:grid-cols-4 gap-6 mb-8">
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{todayAppointmentsCount}</div>
        <div className="flex items-center mt-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="text-sm text-blue-100">Scheduled tests</span>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-purple-100">Pending Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{pendingResultsCount}</div>
        <div className="flex items-center mt-2">
          <FileText className="h-4 w-4 mr-1" />
          <span className="text-sm text-purple-100">Ready to send</span>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-red-100">Urgent Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{urgentTestsCount}</div>
        <div className="flex items-center mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-sm text-red-100">Priority cases</span>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-green-100">Completed Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{completedTodayCount}</div>
        <div className="flex items-center mt-2">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="text-sm text-green-100">Tests finished</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default LabStatsCards;
