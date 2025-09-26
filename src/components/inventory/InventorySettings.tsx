
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Package, 
  AlertTriangle,
  Mail,
  Smartphone,
  Calendar,
  Database
} from "lucide-react";

const InventorySettings = () => {
  const [settings, setSettings] = useState({
    // Stock Thresholds
    defaultMinStock: 10,
    defaultMaxStock: 100,
    lowStockThreshold: 20,
    autoReorderEnabled: false,
    reorderPoint: 15,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    expiryAlerts: true,
    reorderAlerts: true,
    
    // Data Management
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '12months',
    
    // Pricing
    defaultMarkup: 25,
    priceUpdateFrequency: 'weekly',
    currencyFormat: 'TZS',
    
    // Categories
    enableCategories: true,
    defaultCategory: 'General',
    requireCategory: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement save functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Inventory Settings</h2>
        </div>
        <Button onClick={handleSaveSettings}>
          Save Changes
        </Button>
      </div>

      {/* Stock Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultMinStock">Default Minimum Stock</Label>
              <Input
                id="defaultMinStock"
                type="number"
                value={settings.defaultMinStock}
                onChange={(e) => handleSettingChange('defaultMinStock', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="defaultMaxStock">Default Maximum Stock</Label>
              <Input
                id="defaultMaxStock"
                type="number"
                value={settings.defaultMaxStock}
                onChange={(e) => handleSettingChange('defaultMaxStock', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="reorderPoint">Auto Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                value={settings.reorderPoint}
                onChange={(e) => handleSettingChange('reorderPoint', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="autoReorder"
              checked={settings.autoReorderEnabled}
              onCheckedChange={(checked) => handleSettingChange('autoReorderEnabled', checked)}
            />
            <Label htmlFor="autoReorder">Enable Auto Reordering</Label>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                  <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lowStockAlerts"
                    checked={settings.lowStockAlerts}
                    onCheckedChange={(checked) => handleSettingChange('lowStockAlerts', checked)}
                  />
                  <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="expiryAlerts"
                    checked={settings.expiryAlerts}
                    onCheckedChange={(checked) => handleSettingChange('expiryAlerts', checked)}
                  />
                  <Label htmlFor="expiryAlerts">Expiry Alerts</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                SMS Notifications
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                  <Label htmlFor="smsNotifications">Enable SMS Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reorderAlerts"
                    checked={settings.reorderAlerts}
                    onCheckedChange={(checked) => handleSettingChange('reorderAlerts', checked)}
                  />
                  <Label htmlFor="reorderAlerts">Reorder Alerts</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select 
                value={settings.backupFrequency} 
                onValueChange={(value) => handleSettingChange('backupFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dataRetention">Data Retention</Label>
              <Select 
                value={settings.dataRetention} 
                onValueChange={(value) => handleSettingChange('dataRetention', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                  <SelectItem value="24months">24 Months</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currencyFormat">Currency Format</Label>
              <Select 
                value={settings.currencyFormat} 
                onValueChange={(value) => handleSettingChange('currencyFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TZS">TZS (Tanzanian Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="autoBackup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
            />
            <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input
                id="defaultMarkup"
                type="number"
                value={settings.defaultMarkup}
                onChange={(e) => handleSettingChange('defaultMarkup', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="priceUpdateFrequency">Price Update Frequency</Label>
              <Select 
                value={settings.priceUpdateFrequency} 
                onValueChange={(value) => handleSettingChange('priceUpdateFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultCategory">Default Category</Label>
              <Input
                id="defaultCategory"
                value={settings.defaultCategory}
                onChange={(e) => handleSettingChange('defaultCategory', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableCategories"
                checked={settings.enableCategories}
                onCheckedChange={(checked) => handleSettingChange('enableCategories', checked)}
              />
              <Label htmlFor="enableCategories">Enable Product Categories</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="requireCategory"
                checked={settings.requireCategory}
                onCheckedChange={(checked) => handleSettingChange('requireCategory', checked)}
              />
              <Label htmlFor="requireCategory">Require Category for New Products</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventorySettings;
