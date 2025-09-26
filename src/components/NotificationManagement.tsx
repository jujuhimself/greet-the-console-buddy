import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Settings,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification } from '@/services/notificationService';

interface NotificationWithMetadata extends Notification {
  priority?: 'low' | 'medium' | 'high';
  category?: 'order' | 'inventory' | 'payment' | 'system' | 'delivery' | 'promotion';
  actionUrl?: string;
  actionLabel?: string;
}

const NotificationManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showRead, setShowRead] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user.id, 100);
      
      // Transform the data to include metadata
      const transformedNotifications: NotificationWithMetadata[] = data.map(notification => ({
        ...notification,
        priority: notification.metadata?.priority || 'medium',
        category: notification.metadata?.category || 'system',
        actionUrl: notification.metadata?.actionUrl,
        actionLabel: notification.metadata?.actionLabel,
      }));
      
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error loading notifications",
        description: "Could not load notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string, category?: string) => {
    if (category) {
      switch (category) {
        case 'order':
          return <ShoppingCart className="h-5 w-5 text-blue-600" />;
        case 'inventory':
          return <Package className="h-5 w-5 text-orange-600" />;
        case 'payment':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'delivery':
          return <Package className="h-5 w-5 text-purple-600" />;
        case 'promotion':
          return <Star className="h-5 w-5 text-yellow-600" />;
        default:
          return <Info className="h-5 w-5 text-gray-600" />;
      }
    }
    
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      toast({
        title: "All Notifications Marked as Read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Could not mark all notifications as read.",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      toast({
        title: "Notification Deleted",
        description: "Notification has been removed.",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Tab filtering
    if (selectedTab === 'unread' && notification.is_read) return false;
    if (selectedTab !== 'all' && selectedTab !== 'unread' && notification.category !== selectedTab) return false;
    
    // Search filtering
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Priority filtering
    if (filterPriority !== 'all' && notification.priority !== filterPriority) return false;
    
    // Type filtering
    if (filterType !== 'all' && notification.type !== filterType) return false;
    
    // Read status filtering
    if (!showRead && notification.is_read) return false;
    
    return true;
  });

  const getTabCount = (type: string) => {
    if (type === 'all') return notifications.length;
    if (type === 'unread') return unreadCount;
    return notifications.filter(n => n.category === type).length;
  };

  const handleActionClick = (notification: NotificationWithMetadata) => {
    if (notification.actionUrl) {
      markAsRead(notification.id);
      window.location.href = notification.actionUrl;
    }
  };

  const createSampleNotifications = async () => {
    if (!user) return;
    
    try {
      await notificationService.createSampleNotifications(user.id);
      await loadNotifications();
      toast({
        title: "Sample Notifications Created",
        description: "Sample notifications have been added for demonstration.",
      });
    } catch (error) {
      console.error('Error creating sample notifications:', error);
      toast({
        title: "Error",
        description: "Could not create sample notifications.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter(n => n.priority === 'high' && !n.is_read).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => {
                    const today = new Date();
                    const notificationDate = new Date(n.created_at);
                    return today.toDateString() === notificationDate.toDateString();
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Notification Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Center
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadNotifications}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-read"
                  checked={showRead}
                  onCheckedChange={setShowRead}
                />
                <Label htmlFor="show-read">Show Read</Label>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-7">
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
              <TabsTrigger value="delivery" className="text-xs">
                Delivery ({getTabCount('delivery')})
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
                      <p className="text-sm mb-4">Try adjusting your filters or search terms</p>
                      {notifications.length === 0 && (
                        <Button 
                          variant="outline" 
                          onClick={createSampleNotifications}
                          className="mt-2"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Create Sample Notifications
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg ${
                          !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                        } hover:shadow-sm transition-shadow`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type, notification.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                <Badge className={`text-xs ${getPriorityColor(notification.priority || 'medium')}`}>
                                  {notification.priority || 'medium'}
                                </Badge>
                                {notification.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {notification.category}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.created_at)}
                                </span>
                                {notification.actionUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleActionClick(notification)}
                                  >
                                    {notification.actionLabel || 'View Details'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              {notification.is_read ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default NotificationManagement; 