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
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Clock, 
  Mail, 
  MessageSquare, 
  Settings, 
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "appointment_reminder" | "result_ready" | "critical_result" | "follow_up" | "system_alert";
  title: string;
  message: string;
  user_id: string;
  recipient_name: string;
  status: "pending" | "sent" | "failed" | "read";
  channel: "email" | "sms" | "push" | "in_app";
  scheduled_at: string;
  sent_at?: string;
  created_at: string;
  metadata?: any;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  message: string;
  variables: string[];
  is_active: boolean;
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: "1",
    name: "Appointment Reminder",
    type: "appointment_reminder",
    subject: "Appointment Reminder - {test_type}",
    message: "Hi {patient_name}, this is a reminder for your {test_type} appointment on {appointment_date} at {appointment_time}. Please arrive 15 minutes early.",
    variables: ["patient_name", "test_type", "appointment_date", "appointment_time"],
    is_active: true
  },
  {
    id: "2",
    name: "Result Ready",
    type: "result_ready",
    subject: "Your Lab Results Are Ready",
    message: "Hi {patient_name}, your {test_type} results are now available. You can view them in your patient portal or contact us for assistance.",
    variables: ["patient_name", "test_type"],
    is_active: true
  },
  {
    id: "3",
    name: "Critical Result Alert",
    type: "critical_result",
    subject: "Critical Lab Result - Immediate Attention Required",
    message: "Hi {patient_name}, your {test_type} results require immediate attention. Please contact your healthcare provider as soon as possible.",
    variables: ["patient_name", "test_type"],
    is_active: true
  },
  {
    id: "4",
    name: "Follow-up Appointment",
    type: "follow_up",
    subject: "Follow-up Appointment Recommended",
    message: "Hi {patient_name}, based on your recent {test_type} results, we recommend scheduling a follow-up appointment. Please contact us to book.",
    variables: ["patient_name", "test_type"],
    is_active: true
  }
];

const SmartNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(notificationTemplates);
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: false,
    appointmentReminders: true,
    resultNotifications: true,
    criticalAlerts: true,
    followUpReminders: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // In a real app, this would fetch from the notifications table
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "appointment_reminder",
          title: "Appointment Reminder",
          message: "Reminder for CBC test tomorrow at 10:00 AM",
          user_id: "patient1",
          recipient_name: "John Doe",
          status: "sent",
          channel: "email",
          scheduled_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          type: "result_ready",
          title: "Results Ready",
          message: "Your lipid panel results are now available",
          user_id: "patient2",
          recipient_name: "Jane Smith",
          status: "pending",
          channel: "sms",
          scheduled_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleCreateNotification = () => {
    if (!formData.template || !formData.user_id || !formData.scheduledAt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const template = templates.find(t => t.id === formData.template);
    if (!template) return;

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: template.type as any,
      title: template.subject,
      message: template.message,
      user_id: formData.user_id,
      recipient_name: formData.recipientName || "Patient",
      status: "pending",
      channel: formData.channel,
      scheduled_at: formData.scheduledAt,
      created_at: new Date().toISOString(),
      metadata: formData.metadata
    };

    setNotifications(prev => [newNotification, ...prev]);
    setShowCreateNotification(false);
    setFormData({});
    
    toast({
      title: "Notification Created",
      description: "Notification has been scheduled successfully.",
    });
  };

  const handleSendNow = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId 
        ? { ...n, status: "sent", sent_at: new Date().toISOString() }
        : n
    ));
    
    toast({
      title: "Notification Sent",
      description: "Notification has been sent immediately.",
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification Deleted",
      description: "Notification has been removed.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_reminder": return <Clock className="h-4 w-4" />;
      case "result_ready": return <CheckCircle className="h-4 w-4" />;
      case "critical_result": return <AlertTriangle className="h-4 w-4" />;
      case "follow_up": return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      read: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="h-4 w-4" />;
      case "sms": return <MessageSquare className="h-4 w-4" />;
      case "push": return <Bell className="h-4 w-4" />;
      case "in_app": return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Smart Notifications</h2>
        <Button onClick={() => setShowCreateNotification(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          <span className="font-medium">{notification.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{notification.recipient_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getChannelIcon(notification.channel)}
                          <span className="capitalize">{notification.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(notification.scheduled_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {notification.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendNow(notification.id)}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) => {
                          setTemplates(prev => prev.map(t => 
                            t.id === template.id ? { ...t, is_active: checked } : t
                          ));
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                    <p className="text-xs text-gray-500 mb-3">{template.message}</p>
                    <div className="flex gap-1">
                      {template.variables.map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Delivery Channels</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailEnabled}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Send notifications via SMS</p>
                      </div>
                      <Switch
                        checked={settings.smsEnabled}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">Send push notifications to mobile app</p>
                      </div>
                      <Switch
                        checked={settings.pushEnabled}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Appointment Reminders</Label>
                        <p className="text-sm text-gray-600">Send reminders before appointments</p>
                      </div>
                      <Switch
                        checked={settings.appointmentReminders}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, appointmentReminders: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Result Notifications</Label>
                        <p className="text-sm text-gray-600">Notify when results are ready</p>
                      </div>
                      <Switch
                        checked={settings.resultNotifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, resultNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Critical Result Alerts</Label>
                        <p className="text-sm text-gray-600">Immediate alerts for critical results</p>
                      </div>
                      <Switch
                        checked={settings.criticalAlerts}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, criticalAlerts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Follow-up Reminders</Label>
                        <p className="text-sm text-gray-600">Remind about follow-up appointments</p>
                      </div>
                      <Switch
                        checked={settings.followUpReminders}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, followUpReminders: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Notification Dialog */}
      <Dialog open={showCreateNotification} onOpenChange={setShowCreateNotification}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.is_active).map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  value={formData.user_id || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                  placeholder="Enter patient user_id"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  value={formData.recipientName || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Scheduled At</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Data (JSON)</Label>
              <Textarea
                value={formData.metadata || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
                placeholder='{"key": "value"}'
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateNotification(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification}>
              Create Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartNotifications; 