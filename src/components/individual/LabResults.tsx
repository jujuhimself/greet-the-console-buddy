import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Clock, TestTube, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LabAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  status: string;
  notes?: string;
  created_at: string;
  provider_id: string;
}

interface LabResultsProps {
  labAppointments: LabAppointment[];
}

const LabResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setResults(data || []);
        setIsLoading(false);
      });
  }, [user]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      review: 'bg-blue-100 text-blue-800',
      final: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Lab Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Loading lab results...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Lab Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No lab results found.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatDate(result.created_at)}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <strong>Test:</strong> {result.test_type}
                </div>
                {result.result_data && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-800 mb-1">Results Available</div>
                        {/* Show notes as plain text if present */}
                        {result.result_data.notes ? (
                          <div className="text-sm text-green-700">{result.result_data.notes}</div>
                        ) : (
                          <div className="text-sm text-green-700">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(result.result_data, null, 2)}</pre>
                          </div>
                        )}
                        {result.result_file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(result.result_file_url, '_blank')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {result.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="flex items-start gap-1">
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{result.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LabResults; 