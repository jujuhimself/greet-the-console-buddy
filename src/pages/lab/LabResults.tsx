import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TestTube, Calendar, User, Search, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LabResultsManager from '@/components/lab/LabResultsManager';

interface LabOrderItem {
  id: string;
  lab_order_id: string;
  test_name: string;
  status: 'pending' | 'processing' | 'completed';
  result?: string;
  result_date?: string;
  test_price: number;
  patient_name: string;
  order_date: string;
}

const LabResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<LabOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_order_items')
        .select(`
          *,
          lab_order:lab_orders(patient_name, order_date)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const typedResults: LabOrderItem[] = (data || []).map(item => ({
        id: item.id,
        lab_order_id: item.lab_order_id,
        test_name: item.test_name,
        status: item.status as 'pending' | 'processing' | 'completed',
        result: item.result || undefined,
        result_date: item.result_date || undefined,
        test_price: item.test_price,
        patient_name: (item.lab_order as any)?.patient_name || 'Unknown Patient',
        order_date: (item.lab_order as any)?.order_date || ''
      }));

      setResults(typedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error",
        description: "Failed to load test results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResults = results.filter(result =>
    result.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div>Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Results
            <span className="ml-2"><Badge variant="outline">Lab Portal</Badge></span>
          </CardTitle>
          <div className="text-gray-600 mt-2">Manage and view laboratory test results</div>
        </CardHeader>
        <CardContent>
          <LabResultsManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default LabResults;
