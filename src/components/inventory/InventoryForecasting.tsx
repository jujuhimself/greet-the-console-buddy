
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  Target,
  AlertCircle,
  Download,
  RefreshCw
} from "lucide-react";

const InventoryForecasting = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [forecastPeriod, setForecastPeriod] = useState("30days");
  const [selectedProduct, setSelectedProduct] = useState("all");

  // Sample forecasting data
  const demandForecast = [
    { date: '2024-01', actual: 120, predicted: 115, confidence: 0.85 },
    { date: '2024-02', actual: 135, predicted: 128, confidence: 0.82 },
    { date: '2024-03', actual: 142, predicted: 145, confidence: 0.88 },
    { date: '2024-04', actual: null, predicted: 158, confidence: 0.75 },
    { date: '2024-05', actual: null, predicted: 162, confidence: 0.72 },
    { date: '2024-06', actual: null, predicted: 155, confidence: 0.68 }
  ];

  const stockProjection = [
    { date: '2024-01', current: 500, projected: 485, reorderPoint: 200 },
    { date: '2024-02', current: 485, projected: 450, reorderPoint: 200 },
    { date: '2024-03', current: 450, projected: 308, reorderPoint: 200 },
    { date: '2024-04', current: null, projected: 250, reorderPoint: 200 },
    { date: '2024-05', current: null, projected: 188, reorderPoint: 200 },
    { date: '2024-06', current: null, projected: 133, reorderPoint: 200 }
  ];

  const seasonalTrends = [
    { month: 'Jan', demand: 120, trend: 'stable' },
    { month: 'Feb', demand: 135, trend: 'increasing' },
    { month: 'Mar', demand: 142, trend: 'increasing' },
    { month: 'Apr', demand: 158, trend: 'peak' },
    { month: 'May', demand: 162, trend: 'peak' },
    { month: 'Jun', demand: 155, trend: 'decreasing' }
  ];

  const generateForecast = () => {
    console.log('Generating forecast for:', { dateRange, forecastPeriod, selectedProduct });
    // TODO: Implement forecast generation
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Inventory Forecasting</h2>
        </div>
        <Button onClick={generateForecast} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate Forecast
        </Button>
      </div>

      {/* Forecasting Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Forecasting Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            
            <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Forecast Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="paracetamol">Paracetamol</SelectItem>
                <SelectItem value="ibuprofen">Ibuprofen</SelectItem>
                <SelectItem value="antibiotics">Antibiotics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Predicted Demand</p>
                <p className="text-2xl font-bold text-gray-900">158</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% vs last month
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Stock Projection</p>
                <p className="text-2xl font-bold text-gray-900">188</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Below reorder point
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">82%</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  High confidence
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Reorder Alert</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Days until reorder
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demand Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={demandForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Actual Demand"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Projection */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stockProjection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Projected Stock"
                />
                <Line 
                  type="monotone" 
                  dataKey="reorderPoint" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="Reorder Point"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Seasonal Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Demand Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="demand" 
                  fill="#8884D8"
                  name="Monthly Demand"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Summary & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Key Insights</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    Demand expected to increase by 15% next month
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    Stock will reach reorder point in 7 days
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                    Peak season approaching in April-May
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-purple-600 mt-0.5" />
                    Increase safety stock by 20% for peak season
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="h-4 w-4 text-green-600 mt-0.5" />
                    Schedule reorder within next 3 days
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-indigo-600 mt-0.5" />
                    Monitor competitor pricing for optimal margins
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Forecast
              </Button>
              <Button className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Reorder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryForecasting;
