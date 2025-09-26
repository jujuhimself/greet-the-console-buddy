import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, Calendar, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Patient {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient?: Patient | null;
}

const PatientSearch = ({ onPatientSelect, selectedPatient }: PatientSearchProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchPatients = async (term: string) => {
    const searchTerm = (term || '').trim();
    if (!searchTerm || searchTerm.length < 2) {
      setPatients([]);
      return;
    }

    setIsLoading(true);
    try {
      // Search by name, email, or phone in profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, role, created_at')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .eq('role', 'individual') // Only search for individual users (patients)
        .eq('is_approved', true) // Only approved profiles
        .limit(10);

      if (error) {
        // If full_name column does not exist, fallback to name
        if (error.message && error.message.includes("column 'full_name' does not exist")) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, email, name, phone, role, created_at')
            .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
            .eq('role', 'individual')
            .eq('is_approved', true)
            .limit(10);
          if (fallbackError) throw fallbackError;
          setPatients((fallbackData || []).map((p: any) => ({ ...p, full_name: p.name })));
        } else {
          throw error;
        }
      } else {
        setPatients(data || []);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPatients(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchTerm(patient.full_name);
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (patients.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pl-10"
          />
        </div>
      </div>

      {/* Search Results */}
      {showResults && (patients.length > 0 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">
                Searching...
              </div>
            ) : patients.length > 0 ? (
              <div className="space-y-1">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer border-b last:border-b-0"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{patient.full_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{patient.email}</span>
                          {patient.phone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        Patient
                      </Badge>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(patient.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-4 text-gray-500">
                No patients found. Try a different search term or create a new patient.
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Selected Patient Display */}
      {selectedPatient && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{selectedPatient.full_name}</div>
                <div className="text-xs text-gray-600">{selectedPatient.email}</div>
                {selectedPatient.phone && (
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedPatient.phone}
                  </div>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Selected
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearch; 