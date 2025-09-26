
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Search } from "lucide-react";

export interface TestResult {
  id: string;
  patientName: string;
  testType: string;
  completedDate: string;
  status: string;
  values: { [key: string]: string };
}
interface LabResultsListProps {
  testResults: TestResult[];
  getStatusColor: (status: string) => string;
}

const LabResultsList = ({ testResults, getStatusColor }: LabResultsListProps) => (
  <Card className="shadow-lg border-0">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl flex items-center">
          <FileText className="h-6 w-6 mr-2 text-purple-600" />
          Recent Test Results
        </CardTitle>
        <Button variant="outline" size="sm">
          <Search className="h-4 w-4 mr-1" />
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {testResults.length === 0 ? (
          <div className="text-center text-gray-400">No test results available.</div>
        ) : testResults.map((result) => (
          <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-lg">{result.patientName}</h4>
                <p className="text-gray-600">{result.testType}</p>
                <p className="text-sm text-gray-500">Completed: {result.completedDate}</p>
              </div>
              <Badge className={getStatusColor(result.status)}>
                {result.status}
              </Badge>
            </div>
            <div className="space-y-1">
              {Object.entries(result.values).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              {result.status === 'ready' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Send Results
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default LabResultsList;
