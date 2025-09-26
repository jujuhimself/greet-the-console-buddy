
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/dataService';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'order' | 'inventory' | 'system' | 'appointment' | 'credit';
  priority: 'low' | 'medium' | 'high';
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Listen for storage changes
    const handleStorageChange = (event: CustomEvent) => {
      if (event.detail.key === 'notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('bepawa-storage-change', handleStorageChange as EventListener);
    return () => window.removeEventListener('bepawa-storage-change', handleStorageChange as EventListener);
  }, []);

  const loadNotifications = () => {
    const storedNotifications = dataService.getNotifications();
    setNotifications(storedNotifications);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    dataService.saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    dataService.saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    dataService.saveNotifications(updated);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Notification service for creating notifications
export class NotificationService {
  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    const existing = dataService.getNotifications();
    const updated = [newNotification, ...existing].slice(0, 100); // Keep only last 100
    dataService.saveNotifications(updated);

    // Show toast for high priority notifications
    if (notification.priority === 'high') {
      const { toast } = useToast();
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default'
      });
    }
  }

  static addOrderNotification(orderId: string, status: string) {
    this.addNotification({
      type: 'info',
      title: 'Order Update',
      message: `Order #${orderId} status changed to ${status}`,
      category: 'order',
      priority: 'medium'
    });
  }

  static addInventoryAlert(productName: string, currentStock: number) {
    this.addNotification({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${productName} is running low (${currentStock} remaining)`,
      category: 'inventory',
      priority: 'high'
    });
  }

  static addSystemNotification(message: string) {
    this.addNotification({
      type: 'info',
      title: 'System Update',
      message,
      category: 'system',
      priority: 'low'
    });
  }
}
