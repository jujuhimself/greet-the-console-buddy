
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TestTube, Search, Clock, DollarSign, Plus } from "lucide-react";
import { useLabTests, useCreateLabTest } from "@/hooks/useLab";
import { useToast } from "@/hooks/use-toast";
import type { LabTest } from "@/services/labService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

const LabTestCatalog = () => {
  const { toast } = useToast();
  const { data: tests, isLoading, error } = useLabTests();
  const createLabTestMutation = useCreateLabTest();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    test_name: '',
    category: '',
    price: '',
    sample_type: '',
    preparation_instructions: '',
    normal_range: '',
    turnaround_time_hours: '',
    description: ''
  });

  // Get unique categories from tests
  const categories = ['all', ...Array.from(new Set(tests?.map(test => test.category) || []))];

  const filteredTests = (tests || []).filter(test => {
    const matchesSearch = test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (test.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const fetchTests = async () => {
    const { data } = await supabase.from('lab_tests').select('*');
    // setTests(data || []); // This line was removed as per the edit hint
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleAddTest = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    const test_code = form.test_name.replace(/\s+/g, '_').toUpperCase();
    await supabase.from('lab_tests').insert({
      test_name: form.test_name,
      test_code,
      category: form.category,
      price: Number(form.price),
      sample_type: form.sample_type,
      preparation_instructions: form.preparation_instructions,
      normal_range: form.normal_range,
      turnaround_time_hours: Number(form.turnaround_time_hours),
      description: form.description,
      is_active: true,
      user_id: userData.user.id
    });
    setShowAdd(false);
    setForm({ test_name: '', category: '', price: '', sample_type: '', preparation_instructions: '', normal_range: '', turnaround_time_hours: '', description: '' });
    fetchTests();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div>Loading test catalog...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-red-600">Error loading tests: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Laboratory Test Catalog</h1>
          <p className="text-gray-600 text-lg">Browse available laboratory tests and services</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Test Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TestTube className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{test.test_name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {test.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{test.description || 'No description available'}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">TZS {test.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Results in {test.turnaround_time_hours} hours</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Sample Type:</h4>
                  <p className="text-xs text-gray-600">{test.sample_type}</p>
                  
                  {test.preparation_instructions && (
                    <>
                      <h4 className="text-sm font-medium mb-1 mt-2">Preparation:</h4>
                      <p className="text-xs text-gray-600">{test.preparation_instructions}</p>
                    </>
                  )}
                  
                  {test.normal_range && (
                    <>
                      <h4 className="text-sm font-medium mb-1 mt-2">Normal Range:</h4>
                      <p className="text-xs text-gray-600">{test.normal_range}</p>
                    </>
                  )}
                </div>

                {/* Remove any <Button> or <button> elements for Book Test and Details inside the test card */}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? "No tests match your search criteria." 
                  : "No tests are currently available."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
          </DialogHeader>
          <Input placeholder="Test Name" value={form.test_name} onChange={e => setForm({ ...form, test_name: e.target.value })} />
          <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <Input placeholder="Sample Type" value={form.sample_type} onChange={e => setForm({ ...form, sample_type: e.target.value })} />
          <Input placeholder="Normal Range" value={form.normal_range} onChange={e => setForm({ ...form, normal_range: e.target.value })} />
          <Input placeholder="Turnaround Time (hours)" type="number" value={form.turnaround_time_hours} onChange={e => setForm({ ...form, turnaround_time_hours: e.target.value })} />
          <Textarea placeholder="Preparation Instructions" value={form.preparation_instructions} onChange={e => setForm({ ...form, preparation_instructions: e.target.value })} />
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Button onClick={handleAddTest}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabTestCatalog;
