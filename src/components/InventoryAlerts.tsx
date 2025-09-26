import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Package, 
  Calendar, 
  TrendingDown,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Add InventoryAlert TS type if needed. For now, declare minimal type to avoid TS error.
type InventoryAlert = {
  id: string;
  productId: string;
  productName: string;
  minStock?: number;
  currentStock?: number;
  expiryDate?: string;
  alertType: string;
  severity: string;
  createdAt: string;
  resolved: boolean;
};

const InventoryAlerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [restockQuantity, setRestockQuantity] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // setAlerts(MockDataService.getInventoryAlerts());
    setAlerts([]); // No mock, empty by default
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'low-stock': return TrendingDown;
      case 'out-of-stock': return Package;
      case 'expiring-soon': return Calendar;
      case 'expired': return AlertTriangle;
      default: return Package;
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'low-stock': return 'bg-yellow-500';
      case 'out-of-stock': return 'bg-red-500';
      case 'expiring-soon': return 'bg-orange-500';
      case 'expired': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const handleRestock = (productId: string, alertId: string) => {
    const quantity = restockQuantity[productId];
    if (!quantity || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid restock quantity.",
        variant: "destructive"
      });
      return;
    }

    // Pretend the restock succeeds by updating alert as resolved
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    );
    setAlerts(updatedAlerts);

    toast({
      title: "Stock Restocked",
      description: `Successfully restocked ${quantity} units. Alert resolved.`,
    });

    setRestockQuantity(prev => ({ ...prev, [productId]: 0 }));
  };

  const handleResolveAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    );
    setAlerts(updatedAlerts);

    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved.",
    });
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const highCount = activeAlerts.filter(a => a.severity === 'high').length;
  const mediumCount = activeAlerts.filter(a => a.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">High</p>
                <p className="text-2xl font-bold text-orange-700">{highCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-700">{mediumCount}</p>
              </div>
              <Package className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-700">{resolvedAlerts.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Inventory Alerts ({activeAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">All Clear!</h3>
              <p className="text-gray-600">No active inventory alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => {
                const AlertIcon = getAlertTypeIcon(alert.alertType);
                return (
                  <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getAlertTypeColor(alert.alertType)}`}>
                          <AlertIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{alert.productName}</h4>
                          <p className="text-sm opacity-75 mb-2">
                            {alert.alertType === 'low-stock' && 
                              `Stock running low: ${alert.currentStock} units remaining (minimum: ${alert.minStock})`}
                            {alert.alertType === 'out-of-stock' && 
                              `Out of stock: 0 units remaining`}
                            {alert.alertType === 'expiring-soon' && 
                              `Expires soon: ${alert.expiryDate}`}
                            {alert.alertType === 'expired' && 
                              `Expired on: ${alert.expiryDate}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="text-xs">
                              {alert.alertType.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="opacity-75">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {alert.alertType === 'low-stock' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Restock
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restock {alert.productName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Current Stock: {alert.currentStock} units
                                  </label>
                                  <label className="block text-sm font-medium mb-2">
                                    Minimum Stock: {alert.minStock} units
                                  </label>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    New Stock Quantity
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="Enter new stock quantity"
                                    value={restockQuantity[alert.productId] || ''}
                                    onChange={(e) => setRestockQuantity(prev => ({
                                      ...prev,
                                      [alert.productId]: parseInt(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                                <Button 
                                  onClick={() => handleRestock(alert.productId, alert.id)}
                                  className="w-full"
                                >
                                  Update Stock
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Resolved */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recently Resolved ({resolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{alert.productName}</p>
                    <p className="text-sm text-gray-600">{alert.alertType.replace('-', ' ')}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Resolved
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryAlerts;
