import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Download, FileText, BarChart3, TrendingUp, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";

const InventoryReports = () => {
  const [reportType, setReportType] = useState("stock-levels");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [format, setFormat] = useState("pdf");
  const { toast } = useToast();

  const reportTypes = [
    { value: "stock-levels", label: "Current Stock Levels", icon: Package },
    { value: "movement-history", label: "Inventory Movement History", icon: TrendingUp },
    { value: "low-stock", label: "Low Stock Alert Report", icon: BarChart3 },
    { value: "expiry-report", label: "Product Expiry Report", icon: FileText },
    { value: "supplier-performance", label: "Supplier Performance", icon: BarChart3 },
    { value: "purchase-analysis", label: "Purchase Order Analysis", icon: TrendingUp },
  ];

  const formatOptions = [
    { value: "pdf", label: "PDF" },
    { value: "excel", label: "Excel" },
    { value: "csv", label: "CSV" },
  ];

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const generateReport = () => {
    const selectedReport = reportTypes.find(r => r.value === reportType);
    toast({
      title: "Report Generated",
      description: `${selectedReport?.label} report has been generated and will be downloaded shortly.`,
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Download Ready",
        description: `Your ${format.toUpperCase()} report is ready for download.`,
      });
    }, 2000);
  };

  const scheduleReport = () => {
    toast({
      title: "Report Scheduled",
      description: "Your report has been scheduled for automatic generation.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Inventory Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={handleDateRangeChange}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={generateReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={scheduleReport}>
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setReportType("stock-levels");
          generateReport();
        }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Current Stock</h3>
                <p className="text-sm text-gray-500">Real-time inventory levels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setReportType("low-stock");
          generateReport();
        }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">Low Stock Alert</h3>
                <p className="text-sm text-gray-500">Items below minimum</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setReportType("expiry-report");
          generateReport();
        }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Expiry Report</h3>
                <p className="text-sm text-gray-500">Products nearing expiry</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Stock Levels Report", date: "2024-01-15", format: "PDF", status: "Completed" },
              { name: "Movement History", date: "2024-01-14", format: "Excel", status: "Completed" },
              { name: "Low Stock Alert", date: "2024-01-13", format: "CSV", status: "Completed" },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.date} • {report.format}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">{report.status}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;
