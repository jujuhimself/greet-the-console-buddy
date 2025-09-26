import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Mail,
  Trash2,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'payment' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

const NotificationPanel = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD-2024-001 for TZS 45,000 from Mwalimu Pharmacy',
      timestamp: '2024-06-09T10:30:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/wholesale/orders',
      actionLabel: 'View Order'
    },
    {
      id: '2',
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Paracetamol 500mg is running low (5 units remaining)',
      timestamp: '2024-06-09T09:15:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/wholesale/inventory',
      actionLabel: 'Restock Now'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of TZS 78,500 received from City Pharmacy',
      timestamp: '2024-06-09T08:45:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/wholesale/business-tools',
      actionLabel: 'View Payment'
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on June 15th from 2:00 AM to 4:00 AM',
      timestamp: '2024-06-08T16:00:00Z',
      read: true,
      priority: 'low',
    },
    {
      id: '5',
      type: 'promotion',
      title: 'Monthly Report Ready',
      message: 'Your May 2024 sales report is now available for download',
      timestamp: '2024-06-01T09:00:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/wholesale/analytics',
      actionLabel: 'Download Report'
    },
    {
      id: '6',
      type: 'order',
      title: 'Order Shipped',
      message: 'Order #ORD-2024-002 has been shipped to Kilimani Pharmacy',
      timestamp: '2024-06-08T14:20:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/wholesale/orders',
      actionLabel: 'Track Shipment'
    }
  ]);

  const [selectedTab, setSelectedTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'inventory':
        return <Package className="h-5 w-5 text-orange-600" />;
      case 'payment':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-600" />;
      case 'promotion':
        return <Bell className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: false }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: "Notification Deleted",
      description: "Notification has been removed.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "All Notifications Marked as Read",
      description: "All notifications have been marked as read.",
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "All Notifications Cleared",
      description: "All notifications have been removed.",
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unread') return !notification.read;
    return notification.type === selectedTab;
  });

  const getTabCount = (type: string) => {
    if (type === 'all') return notifications.length;
    if (type === 'unread') return unreadCount;
    return notifications.filter(n => n.type === type).length;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              All ({getTabCount('all')})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({getTabCount('unread')})
            </TabsTrigger>
            <TabsTrigger value="order" className="text-xs">
              Orders ({getTabCount('order')})
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">
              Stock ({getTabCount('inventory')})
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">
              Payments ({getTabCount('payment')})
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs">
              System ({getTabCount('system')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                      } hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                              {notification.actionUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    // Navigate to action URL
                                    window.location.href = notification.actionUrl!;
                                  }}
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => 
                              notification.read 
                                ? markAsUnread(notification.id) 
                                : markAsRead(notification.id)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
