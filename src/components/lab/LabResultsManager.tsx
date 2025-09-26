import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Upload, CheckCircle, AlertCircle, Clock, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/services/storageService";
import { supabase } from "@/integrations/supabase/client";
import PatientSearch, { Patient } from "./PatientSearch";
import { labService } from '@/services/labService';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

interface LabResult {
  id: string;
  patient_id: string;
  patient_name: string;
  test_type: string;
  result_data: any;
  result_file_url?: string;
  status: "draft" | "review" | "final" | "approved";
  created_at: string;
  notes?: string;
}

interface ResultTemplate {
  id: string;
  name: string;
  test_type: string;
  fields: Array<{
    name: string;
    type: "text" | "number" | "select";
    label: string;
    unit?: string;
    normal_range?: string;
  }>;
}

const resultTemplates: ResultTemplate[] = [
  {
    id: "1",
    name: "Complete Blood Count (CBC)",
    test_type: "Hematology",
    fields: [
      { name: "wbc", type: "number", label: "White Blood Cells", unit: "K/µL", normal_range: "4.5-11.0" },
      { name: "rbc", type: "number", label: "Red Blood Cells", unit: "M/µL", normal_range: "4.5-5.9" },
      { name: "hemoglobin", type: "number", label: "Hemoglobin", unit: "g/dL", normal_range: "13.5-17.5" },
    ]
  },
  {
    id: "2",
    name: "Comprehensive Metabolic Panel",
    test_type: "Chemistry",
    fields: [
      { name: "glucose", type: "number", label: "Glucose", unit: "mg/dL", normal_range: "70-100" },
      { name: "creatinine", type: "number", label: "Creatinine", unit: "mg/dL", normal_range: "0.7-1.3" },
      { name: "sodium", type: "number", label: "Sodium", unit: "mEq/L", normal_range: "135-145" },
    ]
  }
];

const LabResultsManager = () => {
  const [results, setResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [labTests, setLabTests] = useState<any[]>([]); // All available lab tests
  const [selectedTest, setSelectedTest] = useState<any | null>(null); // Selected lab test
  const [showResultForm, setShowResultForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchResults();
    fetchLabTests();
  }, []);

  // Fetch all lab results
  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({ title: 'Error', description: 'Failed to load lab results', variant: 'destructive' });
    }
  };

  // Fetch all active lab tests
  const fetchLabTests = async () => {
    try {
      const tests = await labService.getLabTests();
      // Map to always have name and fields
      const mapped = tests.map((t: any) => ({
        ...t,
        name: t.test_name || t.name || '',
        fields: t.fields || [],
      }));
      setLabTests(mapped);
    } catch (e) {
      setLabTests([]);
    }
  };

  const handleFormChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResultFile(file);
  };

  // Submit: create new lab_result and notify patient
  const handleSubmitResult = async () => {
    if (!selectedPatient || !selectedTest) return;
    setIsSubmitting(true);
    try {
      let fileUrl = null;
      if (resultFile) {
        const { publicUrl } = await uploadFile({
          file: resultFile,
          userId: selectedPatient.id,
          bucket: 'lab-results',
        });
        fileUrl = publicUrl || null;
      }
      // Always send a valid result_data
      const safeResultData = formData && Object.keys(formData).length > 0 ? formData : {};
      const resultData = {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.full_name || selectedPatient.email,
        test_type: selectedTest.name,
        result_data: safeResultData,
        result_file_url: fileUrl,
        status: 'final',
        created_by: user?.id || null,
        notes: formData.notes || '',
        created_at: new Date().toISOString(),
      };
      console.log('Inserting lab result:', resultData);
      const { data, error } = await supabase.from('lab_results').insert(resultData);
      console.log('Supabase insert response:', { data, error });
      if (error) {
        console.error('Error creating result:', JSON.stringify(error, null, 2));
        throw error;
      }
      // Notify patient
      await notificationService.sendLabResultNotification(selectedPatient.id, selectedTest.name, !!fileUrl);
      toast({ title: 'Result Created', description: 'Lab result has been created and patient notified.' });
      setShowResultForm(false);
      setSelectedTest(null);
      setFormData({});
      setResultFile(null);
      fetchResults();
    } catch (error) {
      console.error('Error creating result (detailed):', error);
      toast({ title: 'Error', description: 'Failed to create lab result', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-yellow-100 text-yellow-800',
      final: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <FileText className="h-4 w-4" />;
      case "review": return <Clock className="h-4 w-4" />;
      case "final": return <CheckCircle className="h-4 w-4" />;
      case "approved": return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // UI: Patient search, test select, dynamic fields
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lab Results Management</h2>
        <Button onClick={() => setShowResultForm(true)}>Create Lab Result</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Result Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resultTemplates.map(template => (
                <div
                  key={template.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // This part needs to be updated to select an order item
                    // For now, it's a placeholder for a template selection
                    setSelectedPatient(null); // Clear any selected patient
                    setSelectedTest(template);
                    setShowResultForm(true);
                  }}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.test_type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientSearch
              onPatientSelect={setSelectedPatient}
              selectedPatient={selectedPatient}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.slice(0, 5).map(result => (
                <div
                  key={result.id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    // This part needs to be updated to select an order item
                    // For now, it's a placeholder for a result selection
                    setSelectedPatient(result);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{result.patient_name}</p>
                      <p className="text-xs text-gray-600">{result.test_type}</p>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Results</CardTitle>
            {/* Remove bulk status update buttons */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={results.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // No bulk action for results, so this checkbox is not directly useful
                      } else {
                        // No bulk action for results, so this checkbox is not directly useful
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map(result => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Checkbox
                      checked={false} // No bulk action for results
                      onCheckedChange={(checked) => {
                        // No bulk action for results
                      }}
                    />
                  </TableCell>
                  <TableCell>{result.patient_name}</TableCell>
                  <TableCell>{result.test_type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1">{result.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(result.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // This part needs to be updated to select an order item
                          // For now, it's a placeholder for a result selection
                          setSelectedPatient(result);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {result.result_file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(result.result_file_url, '_blank')}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showResultForm} onOpenChange={setShowResultForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Lab Result</DialogTitle>
          </DialogHeader>
          {/* 1. Patient Search */}
          <PatientSearch onPatientSelect={setSelectedPatient} selectedPatient={selectedPatient} />
          {/* 2. Select any test */}
          {selectedPatient && (
            <div className="mt-4">
              <Label>Select Test</Label>
              {labTests.length > 0 ? (
                <Select value={selectedTest?.id ? String(selectedTest.id) : ''} onValueChange={id => {
                  const test = labTests.find(t => String(t.id) === id);
                  setSelectedTest(test || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {labTests.map(test => (
                      <SelectItem key={String(test.id)} value={String(test.id)}>{test.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-500">No lab tests available. Please add tests in the Lab Test Catalog.</div>
              )}
            </div>
          )}
          {/* 3. Dynamic result fields from template */}
          {selectedTest && selectedTest.fields && (
            <div className="mt-4 space-y-2">
              <Label>Enter Results</Label>
              {selectedTest.fields.map((field: any) => (
                <div key={field.name} className="mb-2">
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.label}
                    value={formData[field.name] || ''}
                    onChange={e => handleFormChange(field.name, e.target.value)}
                  />
                  {field.unit && <span className="text-xs text-gray-500 ml-2">Unit: {field.unit}</span>}
                  {field.normal_range && <span className="text-xs text-gray-400 ml-2">Normal: {field.normal_range}</span>}
                </div>
              ))}
            </div>
          )}
          {/* 4. File upload */}
          <div className="mt-4">
            <Label>Result File (Optional)</Label>
            <Input type="file" onChange={handleFileSelect} />
          </div>
          {/* 5. Notes */}
          <div className="mt-4">
            <Label>Notes</Label>
            <Textarea value={formData.notes || ''} onChange={e => handleFormChange('notes', e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultForm(false)}>Cancel</Button>
            <Button onClick={handleSubmitResult} disabled={isSubmitting || !selectedPatient || !selectedTest}>Create Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove any Dialog for result details that is triggered by selecting a patient */}
      {/* Only set selectedPatient when searching/selecting a patient */}
      {/* Only show result details dialog when viewing an existing result, not during creation */}
    </div>
  );
};

export default LabResultsManager; 