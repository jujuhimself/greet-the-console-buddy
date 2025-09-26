
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Bell, 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  X,
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'inventory' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Load notifications from localStorage
      const stored = localStorage.getItem(`bepawa_notifications_${user.id}`);
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
      } else {
        // Create sample notifications for demo
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            type: 'order',
            title: 'New Order Confirmed',
            message: 'Order #ORD-2024-001 has been confirmed and is being processed.',
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'medium'
          },
          {
            id: '2',
            type: 'inventory',
            title: 'Low Stock Alert',
            message: 'Paracetamol 500mg is running low (5 units remaining).',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            priority: 'high'
          },
          {
            id: '3',
            type: 'delivery',
            title: 'Delivery Completed',
            message: 'Your order #ORD-2024-002 has been successfully delivered.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true,
            priority: 'low'
          }
        ];
        setNotifications(sampleNotifications);
        setUnreadCount(2);
        localStorage.setItem(`bepawa_notifications_${user.id}`, JSON.stringify(sampleNotifications));
      }
    }
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'delivery': return Truck;
      case 'inventory': return AlertTriangle;
      case 'payment': return CheckCircle;
      default: return Bell;
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem(`bepawa_notifications_${user?.id}`, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem(`bepawa_notifications_${user?.id}`, JSON.stringify(updated));
  };

  const removeNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem(`bepawa_notifications_${user?.id}`, JSON.stringify(updated));
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border shadow-xl z-50" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-gray-100 ${getIconColor(notification.priority)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.timestamp)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2">
                              <Badge 
                                variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {notification.priority} priority
                              </Badge>
                              {!notification.read && (
                                <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
