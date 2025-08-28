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
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  FileText, 
  Plus,
  Edit,
  Eye,
  X,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PatientSearch, { Patient } from "./PatientSearch";

interface PatientProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  blood_type?: string;
  height?: number;
  weight?: number;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policy_number: string;
    group_number?: string;
  };
  allergies: string[];
  medications: string[];
  medical_history: string[];
  created_at: string;
  updated_at: string;
}

interface LabResult {
  id: string;
  test_type: string;
  result_data: any;
  status: string;
  created_at: string;
}

interface Appointment {
  id: string;
  test_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

const PatientManagement = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatientData = async (patientId: string) => {
    try {
      // Fetch patient profile
      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', patientId)
        .single();

      if (profile) {
        setPatientProfile(profile);
      } else {
        // Create default profile if none exists
        const defaultProfile: PatientProfile = {
          id: Date.now().toString(),
          user_id: patientId,
          full_name: selectedPatient?.full_name || selectedPatient?.email || "",
          email: selectedPatient?.email || "",
          phone: selectedPatient?.phone || "",
          date_of_birth: "",
          gender: "other",
          emergency_contact: {
            name: "",
            relationship: "",
            phone: ""
          },
          insurance: {
            provider: "",
            policy_number: "",
            group_number: ""
          },
          allergies: [],
          medications: [],
          medical_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPatientProfile(defaultProfile);
      }

      // Fetch lab results
      const { data: results } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      setLabResults(results || []);

      // Fetch appointments
      const { data: apts } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', patientId)
        .order('appointment_date', { ascending: false });

      setAppointments(apts || []);

    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!patientProfile) return;

    try {
      const { error } = await supabase
        .from('patient_profiles')
        .upsert({
          ...patientProfile,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPatientProfile(prev => prev ? { ...prev, ...formData } : null);
      setShowEditProfile(false);
      setFormData({});
      
      toast({
        title: "Profile Updated",
        description: "Patient profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient profile",
        variant: "destructive",
      });
    }
  };

  const handleAddAllergy = () => {
    if (!formData.allergy || !patientProfile) return;

    const updatedProfile = {
      ...patientProfile,
      allergies: [...patientProfile.allergies, formData.allergy]
    };
    setPatientProfile(updatedProfile);
    setShowAddAllergy(false);
    setFormData({});
  };

  const handleAddMedication = () => {
    if (!formData.medication || !patientProfile) return;

    const updatedProfile = {
      ...patientProfile,
      medications: [...patientProfile.medications, formData.medication]
    };
    setPatientProfile(updatedProfile);
    setShowAddMedication(false);
    setFormData({});
  };

  const handleRemoveAllergy = (allergy: string) => {
    if (!patientProfile) return;

    const updatedProfile = {
      ...patientProfile,
      allergies: patientProfile.allergies.filter(a => a !== allergy)
    };
    setPatientProfile(updatedProfile);
  };

  const handleRemoveMedication = (medication: string) => {
    if (!patientProfile) return;

    const updatedProfile = {
      ...patientProfile,
      medications: patientProfile.medications.filter(m => m !== medication)
    };
    setPatientProfile(updatedProfile);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!selectedPatient) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Patient Management</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600 mb-4">Search for a patient to view their profile and medical history</p>
              <PatientSearch
                onPatientSelect={setSelectedPatient}
                selectedPatient={selectedPatient}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Management</h2>
        <div className="flex gap-2">
          <PatientSearch
            onPatientSelect={setSelectedPatient}
            selectedPatient={selectedPatient}
          />
          <Button onClick={() => setShowEditProfile(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {patientProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{patientProfile.full_name}</h4>
                  <p className="text-sm text-gray-600">{patientProfile.email}</p>
                  <p className="text-sm text-gray-600">{patientProfile.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Date of Birth</Label>
                    <p>{patientProfile.date_of_birth ? format(new Date(patientProfile.date_of_birth), 'MMM dd, yyyy') : 'Not specified'}</p>
                    {patientProfile.date_of_birth && (
                      <p className="text-xs text-gray-500">Age: {calculateAge(patientProfile.date_of_birth)}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500">Gender</Label>
                    <p className="capitalize">{patientProfile.gender}</p>
                  </div>
                  {patientProfile.blood_type && (
                    <div>
                      <Label className="text-gray-500">Blood Type</Label>
                      <p>{patientProfile.blood_type}</p>
                    </div>
                  )}
                  {patientProfile.height && patientProfile.weight && (
                    <div>
                      <Label className="text-gray-500">BMI</Label>
                      <p>{((patientProfile.weight / Math.pow(patientProfile.height / 100, 2)).toFixed(1))}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-gray-500">Emergency Contact</Label>
                  <div className="mt-1 p-2 bg-red-50 rounded">
                    <p className="font-medium">{patientProfile.emergency_contact.name}</p>
                    <p className="text-sm text-gray-600">{patientProfile.emergency_contact.relationship}</p>
                    <p className="text-sm text-gray-600">{patientProfile.emergency_contact.phone}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Insurance</Label>
                  <div className="mt-1 p-2 bg-blue-50 rounded">
                    <p className="font-medium">{patientProfile.insurance.provider}</p>
                    <p className="text-sm text-gray-600">Policy: {patientProfile.insurance.policy_number}</p>
                    {patientProfile.insurance.group_number && (
                      <p className="text-sm text-gray-600">Group: {patientProfile.insurance.group_number}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-500">Allergies</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddAllergy(true)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {patientProfile.allergies.length === 0 ? (
                      <p className="text-sm text-gray-500">No allergies recorded</p>
                    ) : (
                      patientProfile.allergies.map((allergy, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm">{allergy}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAllergy(allergy)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-500">Current Medications</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddMedication(true)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {patientProfile.medications.length === 0 ? (
                      <p className="text-sm text-gray-500">No medications recorded</p>
                    ) : (
                      patientProfile.medications.map((medication, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">{medication}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedication(medication)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Medical History</Label>
                  <div className="mt-1 space-y-1">
                    {patientProfile.medical_history.length === 0 ? (
                      <p className="text-sm text-gray-500">No medical history recorded</p>
                    ) : (
                      patientProfile.medical_history.map((condition, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <span className="text-sm">{condition}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Recent Lab Results</Label>
                  <div className="mt-1 space-y-1">
                    {labResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{result.test_type}</span>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(new Date(result.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Recent Appointments</Label>
                  <div className="mt-1 space-y-1">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{appointment.test_type}</span>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')} at {appointment.appointment_time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient Profile</DialogTitle>
          </DialogHeader>
          
          {patientProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name || patientProfile.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.email || patientProfile.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || patientProfile.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth || patientProfile.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={formData.gender || patientProfile.gender} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Blood Type</Label>
                  <Select 
                    value={formData.blood_type || patientProfile.blood_type || "unknown"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, blood_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">Unknown</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height || patientProfile.height || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight || patientProfile.weight || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label>Emergency Contact</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Input
                    placeholder="Name"
                    value={formData.emergency_contact?.name || patientProfile.emergency_contact.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      emergency_contact: { 
                        ...prev.emergency_contact, 
                        name: e.target.value 
                      } 
                    }))}
                  />
                  <Input
                    placeholder="Relationship"
                    value={formData.emergency_contact?.relationship || patientProfile.emergency_contact.relationship}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      emergency_contact: { 
                        ...prev.emergency_contact, 
                        relationship: e.target.value 
                      } 
                    }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={formData.emergency_contact?.phone || patientProfile.emergency_contact.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      emergency_contact: { 
                        ...prev.emergency_contact, 
                        phone: e.target.value 
                      } 
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>Insurance Information</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Input
                    placeholder="Provider"
                    value={formData.insurance?.provider || patientProfile.insurance.provider}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { 
                        ...prev.insurance, 
                        provider: e.target.value 
                      } 
                    }))}
                  />
                  <Input
                    placeholder="Policy Number"
                    value={formData.insurance?.policy_number || patientProfile.insurance.policy_number}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { 
                        ...prev.insurance, 
                        policy_number: e.target.value 
                      } 
                    }))}
                  />
                  <Input
                    placeholder="Group Number"
                    value={formData.insurance?.group_number || patientProfile.insurance.group_number}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { 
                        ...prev.insurance, 
                        group_number: e.target.value 
                      } 
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>
              Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Allergy Dialog */}
      <Dialog open={showAddAllergy} onOpenChange={setShowAddAllergy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Allergy</Label>
              <Input
                value={formData.allergy || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, allergy: e.target.value }))}
                placeholder="Enter allergy"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAllergy(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAllergy}>
              Add Allergy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medication</Label>
              <Input
                value={formData.medication || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, medication: e.target.value }))}
                placeholder="Enter medication"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMedication(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMedication}>
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagement; 