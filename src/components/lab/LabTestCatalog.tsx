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
import { Search, Plus, Edit, Trash2, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { labService } from '@/services/labService';

interface LabTest {
  id: string;
  name: string;
  category: string;
  code: string;
  price: number;
  turnaround_time: string;
  preparation: string;
  description: string;
  is_active: boolean;
  insurance_codes: string[];
}

const defaultTests: LabTest[] = [
  {
    id: "1",
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    code: "CBC001",
    price: 45,
    turnaround_time: "24 hours",
    preparation: "Fasting required for 8-12 hours",
    description: "Measures red blood cells, white blood cells, and platelets",
    is_active: true,
    insurance_codes: ["85025", "85027"]
  },
  {
    id: "2",
    name: "Comprehensive Metabolic Panel",
    category: "Chemistry",
    code: "CMP001",
    price: 65,
    turnaround_time: "24 hours",
    preparation: "Fasting required for 12 hours",
    description: "Measures kidney function, liver function, and blood sugar",
    is_active: true,
    insurance_codes: ["80053"]
  },
  {
    id: "3",
    name: "Lipid Panel",
    category: "Chemistry",
    code: "LIP001",
    price: 35,
    turnaround_time: "24 hours",
    preparation: "Fasting required for 12-14 hours",
    description: "Measures cholesterol and triglyceride levels",
    is_active: true,
    insurance_codes: ["80061"]
  },
  {
    id: "4",
    name: "Thyroid Function Test",
    category: "Endocrinology",
    code: "THY001",
    price: 55,
    turnaround_time: "48 hours",
    preparation: "No special preparation required",
    description: "Measures thyroid hormone levels",
    is_active: true,
    insurance_codes: ["84443", "84439"]
  },
  {
    id: "5",
    name: "Hemoglobin A1C",
    category: "Diabetes",
    code: "A1C001",
    price: 40,
    turnaround_time: "24 hours",
    preparation: "No fasting required",
    description: "Measures average blood sugar over 3 months",
    is_active: true,
    insurance_codes: ["83036"]
  },
  {
    id: "6",
    name: "Urinalysis",
    category: "Urine Analysis",
    code: "URI001",
    price: 25,
    turnaround_time: "4 hours",
    preparation: "First morning urine preferred",
    description: "Analyzes urine for various substances",
    is_active: true,
    insurance_codes: ["81000"]
  },
  {
    id: "7",
    name: "Pregnancy Test",
    category: "Reproductive Health",
    code: "PRE001",
    price: 30,
    turnaround_time: "2 hours",
    preparation: "No special preparation",
    description: "Detects pregnancy hormone in blood or urine",
    is_active: true,
    insurance_codes: ["84702"]
  },
  {
    id: "8",
    name: "STD Panel",
    category: "Infectious Disease",
    code: "STD001",
    price: 120,
    turnaround_time: "72 hours",
    preparation: "No special preparation",
    description: "Comprehensive screening for sexually transmitted diseases",
    is_active: true,
    insurance_codes: ["86780", "86689", "87389"]
  }
];

const categories = [
  "Hematology",
  "Chemistry", 
  "Endocrinology",
  "Diabetes",
  "Urine Analysis",
  "Reproductive Health",
  "Infectious Disease",
  "Immunology",
  "Microbiology",
  "Molecular Diagnostics"
];

const LabTestCatalog = () => {
  const [tests, setTests] = useState<LabTest[]>([]); // Remove defaultTests from state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddTest, setShowAddTest] = useState(false);
  const [showEditTest, setShowEditTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [formData, setFormData] = useState<Partial<LabTest>>({});
  const { toast } = useToast();

  // On mount, fetch tests from DB
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const dbTests = await labService.getLabTests();
      const mappedTests = dbTests.map((t: any) => ({
        id: t.id,
        name: t.test_name || t.name || '',
        category: t.category || '',
        code: t.test_code || t.code || '',
        price: t.price || 0,
        turnaround_time: t.turnaround_time_hours ? `${t.turnaround_time_hours} hours` : (t.turnaround_time || ''),
        preparation: t.preparation_instructions || t.preparation || '',
        description: t.description || '',
        is_active: t.is_active !== false,
        insurance_codes: t.insurance_codes || [],
      }));
      setTests(mappedTests.length > 0 ? mappedTests : defaultTests);
    } catch {
      setTests(defaultTests);
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddTest = () => {
    setFormData({});
    setShowAddTest(true);
  };

  const handleEditTest = (test: LabTest) => {
    setSelectedTest(test);
    setFormData(test);
    setShowEditTest(true);
  };

  const handleDeleteTest = (testId: string) => {
    setTests(prev => prev.filter(test => test.id !== testId));
    toast({
      title: "Test Deleted",
      description: "Lab test has been removed from catalog.",
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.code || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (showAddTest) {
      try {
        await labService.createLabTest({
          test_name: formData.name!,
          test_code: formData.code!,
          category: formData.category!,
          description: formData.description || '',
          sample_type: '',
          preparation_instructions: formData.preparation || '',
          normal_range: '',
          price: Number(formData.price),
          turnaround_time_hours: Number(formData.turnaround_time) || 24,
          is_active: true,
          lab_id: undefined,
        });
        toast({ title: "Test Added", description: "Lab test has been added to the catalog." });
        setShowAddTest(false);
        fetchTests();
      } catch (e) {
        toast({ title: "Error", description: "Failed to add test.", variant: "destructive" });
      }
      return;
    } else if (showEditTest && selectedTest) {
      setTests(prev => prev.map(test => 
        test.id === selectedTest.id 
          ? { ...test, ...formData }
          : test
      ));
      toast({
        title: "Test Updated",
        description: "Lab test has been updated successfully.",
      });
    }

    setShowAddTest(false);
    setShowEditTest(false);
    setSelectedTest(null);
    setFormData({});
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Hematology": "bg-red-100 text-red-800",
      "Chemistry": "bg-blue-100 text-blue-800",
      "Endocrinology": "bg-green-100 text-green-800",
      "Diabetes": "bg-yellow-100 text-yellow-800",
      "Urine Analysis": "bg-purple-100 text-purple-800",
      "Reproductive Health": "bg-pink-100 text-pink-800",
      "Infectious Disease": "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lab Test Catalog</h2>
        <Button onClick={handleAddTest}>
          <Plus className="h-4 w-4 mr-2" />
          Add Test
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(Boolean).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600">
              {filteredTests.length} test(s) found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map(test => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <p className="text-sm text-gray-600">{test.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTest(test)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Badge className={getCategoryColor(test.category)}>
                {test.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{test.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">${test.price}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{test.turnaround_time}</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <span className="text-gray-600">{test.preparation}</span>
                </div>
                
                {test.insurance_codes.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Insurance codes: {test.insurance_codes.join(", ")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Test Dialog */}
      <Dialog open={showAddTest || showEditTest} onOpenChange={() => {
        setShowAddTest(false);
        setShowEditTest(false);
        setSelectedTest(null);
        setFormData({});
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {showAddTest ? "Add New Test" : "Edit Test"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test Name *</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter test name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Test Code *</Label>
                <Input
                  value={formData.code || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter test code"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={formData.category || "uncategorized"} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {categories.filter(Boolean).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  placeholder="Enter price"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Turnaround Time</Label>
                <Input
                  value={formData.turnaround_time || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, turnaround_time: e.target.value }))}
                  placeholder="e.g., 24 hours"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Insurance Codes</Label>
                <Input
                  value={formData.insurance_codes?.join(", ") || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    insurance_codes: e.target.value.split(",").map(code => code.trim())
                  }))}
                  placeholder="e.g., 85025, 85027"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Preparation Instructions</Label>
              <Textarea
                value={formData.preparation || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, preparation: e.target.value }))}
                placeholder="Enter preparation instructions"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter test description"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddTest(false);
              setShowEditTest(false);
              setSelectedTest(null);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {showAddTest ? "Add Test" : "Update Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabTestCatalog; 