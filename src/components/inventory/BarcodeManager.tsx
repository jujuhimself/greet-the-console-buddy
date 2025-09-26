
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Scan, 
  Download, 
  Upload, 
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package
} from "lucide-react";

const BarcodeManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeType, setBarcodeType] = useState("all");
  const [scannerActive, setScannerActive] = useState(false);

  // Sample barcode data
  const barcodes = [
    {
      id: '1',
      code: '1234567890123',
      type: 'EAN-13',
      productName: 'Paracetamol 500mg',
      productId: 'prod-001',
      status: 'active',
      created: '2024-01-15'
    },
    {
      id: '2',
      code: '9876543210987',
      type: 'EAN-13',
      productName: 'Ibuprofen 200mg',
      productId: 'prod-002',
      status: 'active',
      created: '2024-01-16'
    },
    {
      id: '3',
      code: 'QR-ANTIBIOT-001',
      type: 'QR Code',
      productName: 'Amoxicillin 250mg',
      productId: 'prod-003',
      status: 'active',
      created: '2024-01-17'
    }
  ];

  const filteredBarcodes = barcodes.filter(barcode => {
    const matchesSearch = barcode.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         barcode.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = barcodeType === 'all' || barcode.type.toLowerCase().includes(barcodeType.toLowerCase());
    return matchesSearch && matchesType;
  });

  const generateBarcode = () => {
    console.log('Generating new barcode');
    // TODO: Implement barcode generation
  };

  const startScanner = () => {
    setScannerActive(true);
    console.log('Starting barcode scanner');
    // TODO: Implement barcode scanner
    setTimeout(() => setScannerActive(false), 5000); // Auto stop after 5 seconds for demo
  };

  const exportBarcodes = () => {
    console.log('Exporting barcodes');
    // TODO: Implement export functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Barcode & QR Code Manager</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={startScanner} className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            {scannerActive ? 'Scanning...' : 'Scan Code'}
          </Button>
          <Button onClick={generateBarcode} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate Code
          </Button>
        </div>
      </div>

      {/* Scanner Status */}
      {scannerActive && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-blue-800">Scanner is active - Point camera at barcode or QR code</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by product name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={barcodeType} onValueChange={setBarcodeType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Barcode Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ean">EAN Barcodes</SelectItem>
                <SelectItem value="qr">QR Codes</SelectItem>
                <SelectItem value="code128">Code 128</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportBarcodes} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Barcode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="productSelect">Select Product</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paracetamol">Paracetamol 500mg</SelectItem>
                  <SelectItem value="ibuprofen">Ibuprofen 200mg</SelectItem>
                  <SelectItem value="antibiotics">Antibiotics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="codeType">Code Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ean13">EAN-13</SelectItem>
                  <SelectItem value="ean8">EAN-8</SelectItem>
                  <SelectItem value="qr">QR Code</SelectItem>
                  <SelectItem value="code128">Code 128</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">Generate Code</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barcode List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Barcodes & QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBarcodes.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No codes found</h3>
              <p className="text-gray-600">Generate your first barcode or QR code to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBarcodes.map((barcode) => (
                <div key={barcode.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {barcode.type === 'QR Code' ? (
                        <QrCode className="h-6 w-6 text-gray-600" />
                      ) : (
                        <Package className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{barcode.productName}</h4>
                      <p className="text-sm text-gray-600">{barcode.code}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{barcode.type}</Badge>
                        <Badge variant={barcode.status === 'active' ? 'default' : 'secondary'}>
                          {barcode.status}
                        </Badge>
                        <span className="text-xs text-gray-500">Created: {barcode.created}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Codes
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export All Codes
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Generate for All Products
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeManager;
