import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  User, 
  Heart, 
  Activity,
  Thermometer,
  Plus,
  Search,
  Download,
  TestTube,
  Package,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HealthRecord {
  id: string;
  type: 'consultation' | 'lab-test' | 'prescription' | 'vital-signs' | 'order';
  title: string;
  description: string;
  date: string;
  status: 'active' | 'completed' | 'pending' | 'cancelled';
  provider?: string;
  result_data?: any;
  result_file_url?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
}

const HealthRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchHealthRecords();
    }
  }, [user]);

  const fetchHealthRecords = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const records: HealthRecord[] = [];

      // Fetch lab appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider_type', 'lab')
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Transform appointments to health records
      appointments?.forEach(apt => {
        records.push({
          id: apt.id,
          type: 'lab-test',
          title: apt.service_type || 'Laboratory Test',
          description: apt.notes || 'Laboratory appointment',
          date: apt.appointment_date,
          status: apt.status === 'completed' ? 'completed' : 
                  apt.status === 'cancelled' ? 'cancelled' : 'pending',
          provider: 'Laboratory',
          result_data: apt.notes?.includes('Result:') ? apt.notes : undefined
        });
      });

      // Fetch lab order items (results)
      const { data: labResults, error: labResultsError } = await supabase
        .from('lab_order_items')
        .select(`
          *,
          lab_order:lab_orders(user_id, patient_name)
        `)
        .eq('lab_order.user_id', user.id)
        .order('created_at', { ascending: false });

      if (labResultsError) throw labResultsError;

      // Transform lab results to health records
      labResults?.forEach(result => {
        if (result.status === 'completed' && result.result) {
          records.push({
            id: result.id,
            type: 'lab-test',
            title: result.test_name,
            description: `Test result: ${result.result}`,
            date: result.result_date || result.created_at,
            status: 'completed',
            provider: 'Laboratory',
            result_data: result.result
          });
        }
      });

      // Fetch prescriptions
      const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      // Transform prescriptions to health records
      prescriptions?.forEach(prescription => {
        records.push({
          id: prescription.id,
          type: 'prescription',
          title: 'Medical Prescription',
          description: prescription.instructions || 'Prescription uploaded',
          date: prescription.created_at,
          status: prescription.status === 'completed' ? 'completed' : 
                  prescription.status === 'cancelled' ? 'cancelled' : 'pending',
          provider: 'Pharmacy'
        });
      });

      // Fetch orders (medication orders)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transform orders to health records
      orders?.forEach(order => {
        records.push({
          id: order.id,
          type: 'order',
          title: 'Medication Order',
          description: `Order for ${order.total_amount ? `TZS ${order.total_amount}` : 'medications'}`,
          date: order.created_at,
          status: order.status === 'completed' ? 'completed' : 
                  order.status === 'cancelled' ? 'cancelled' : 'pending',
          provider: 'Pharmacy'
        });
      });

      // Sort all records by date (newest first)
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRecords(records);
    } catch (error) {
      console.error('Error fetching health records:', error);
      toast({
        title: "Error",
        description: "Failed to load health records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <User className="h-5 w-5" />;
      case 'lab-test': return <TestTube className="h-5 w-5" />;
      case 'prescription': return <FileText className="h-5 w-5" />;
      case 'vital-signs': return <Heart className="h-5 w-5" />;
      case 'order': return <Package className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'lab-test': return 'bg-green-100 text-green-800';
      case 'prescription': return 'bg-purple-100 text-purple-800';
      case 'vital-signs': return 'bg-red-100 text-red-800';
      case 'order': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || record.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading health records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Health Records</h1>
            <p className="text-gray-600 text-lg">Your complete health history and medical records</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="lab-test">Lab Tests</option>
                <option value="prescription">Prescriptions</option>
                <option value="order">Medication Orders</option>
                <option value="consultation">Consultations</option>
                <option value="vital-signs">Vital Signs</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Records */}
        <div className="space-y-6">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(record.type).replace('text-', 'text-').replace('bg-', 'bg-opacity-20 bg-')}`}>
                      {getTypeIcon(record.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{record.title}</h3>
                      <div className="flex items-center gap-4 text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        {record.provider && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{record.provider}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{record.description}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={getTypeColor(record.type)}>
                      {record.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <br />
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Result Data Display */}
                {record.result_data && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Test Results
                    </h4>
                    <div className="text-sm text-gray-700">
                      {typeof record.result_data === 'string' ? record.result_data : JSON.stringify(record.result_data)}
                    </div>
                  </div>
                )}

                {/* Vital Signs Display */}
                {record.vitals && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Vital Signs
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {record.vitals.bloodPressure && (
                        <div>
                          <span className="text-gray-600">Blood Pressure:</span>
                          <div className="font-medium">{record.vitals.bloodPressure}</div>
                        </div>
                      )}
                      {record.vitals.heartRate && (
                        <div>
                          <span className="text-gray-600">Heart Rate:</span>
                          <div className="font-medium">{record.vitals.heartRate}</div>
                        </div>
                      )}
                      {record.vitals.temperature && (
                        <div>
                          <span className="text-gray-600">Temperature:</span>
                          <div className="font-medium">{record.vitals.temperature}</div>
                        </div>
                      )}
                      {record.vitals.weight && (
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <div className="font-medium">{record.vitals.weight}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                    View Details
                  </Button>
                  {record.result_file_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(record.result_file_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedType !== 'all' 
                  ? "No records match your search criteria." 
                  : "No health records available yet. Your lab results, prescriptions, and orders will appear here."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(selectedRecord.type)}
                <span className="font-semibold text-lg">{selectedRecord.title}</span>
                <Badge className={getTypeColor(selectedRecord.type)}>
                  {selectedRecord.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(selectedRecord.date).toLocaleDateString()}</span>
                {selectedRecord.provider && (
                  <>
                    <User className="h-4 w-4 ml-4" />
                    {selectedRecord.provider}
                  </>
                )}
              </div>
              <Badge className={getStatusColor(selectedRecord.status)}>
                {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
              </Badge>
              {/* Custom content by type */}
              {selectedRecord.type === 'lab-test' && (
                <div>
                  <h4 className="font-medium mb-2">Lab Test Details</h4>
                  <div className="text-gray-700 mb-2">{selectedRecord.description}</div>
                  {selectedRecord.result_data && (
                    <div className="bg-green-50 p-3 rounded mb-2">
                      <h5 className="font-semibold mb-1">Test Results</h5>
                      <div className="text-sm">{typeof selectedRecord.result_data === 'string' ? selectedRecord.result_data : JSON.stringify(selectedRecord.result_data)}</div>
                    </div>
                  )}
                  {selectedRecord.result_file_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(selectedRecord.result_file_url, '_blank')}
                      className="mt-2"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Result
                    </Button>
                  )}
                </div>
              )}
              {selectedRecord.type === 'prescription' && (
                <div>
                  <h4 className="font-medium mb-2">Prescription Details</h4>
                  <div className="text-gray-700 mb-2">{selectedRecord.description}</div>
                </div>
              )}
              {selectedRecord.type === 'order' && (
                <div>
                  <h4 className="font-medium mb-2">Medication Order</h4>
                  <div className="text-gray-700 mb-2">{selectedRecord.description}</div>
                </div>
              )}
              {selectedRecord.type === 'consultation' && (
                <div>
                  <h4 className="font-medium mb-2">Consultation Details</h4>
                  <div className="text-gray-700 mb-2">{selectedRecord.description}</div>
                </div>
              )}
              {selectedRecord.type === 'vital-signs' && selectedRecord.vitals && (
                <div>
                  <h4 className="font-medium mb-2">Vital Signs</h4>
                  {selectedRecord.vitals.bloodPressure && (
                    <div><span className="text-gray-600">Blood Pressure:</span> <span className="font-medium">{selectedRecord.vitals.bloodPressure}</span></div>
                  )}
                  {selectedRecord.vitals.heartRate && (
                    <div><span className="text-gray-600">Heart Rate:</span> <span className="font-medium">{selectedRecord.vitals.heartRate}</span></div>
                  )}
                  {selectedRecord.vitals.temperature && (
                    <div><span className="text-gray-600">Temperature:</span> <span className="font-medium">{selectedRecord.vitals.temperature}</span></div>
                  )}
                  {selectedRecord.vitals.weight && (
                    <div><span className="text-gray-600">Weight:</span> <span className="font-medium">{selectedRecord.vitals.weight}</span></div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthRecords;
