# Notification System Documentation

## Overview
The notification system is now **centralized and unified** using Supabase database with real-time updates.

## Architecture

### Components
- **NotificationCenter** (`src/components/NotificationSystem.tsx`): Bell icon in navbar, shows notifications dropdown
- **NotificationService** (`src/services/notificationService.ts`): Service class for managing notifications in database
- **useNotifications Hook** (`src/hooks/useNotifications.ts`): React hooks for fetching/updating notifications

### Database Table
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT ('info' | 'success' | 'warning' | 'error'),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

## How It Works

### 1. Creating Notifications
```typescript
import { notificationService } from '@/services/notificationService';

// Simple notification
await notificationService.createNotification({
  user_id: userId,
  title: 'Order Confirmed',
  message: 'Order #ORD-123 has been confirmed',
  type: 'success',
  metadata: {
    priority: 'high',
    category: 'order',
    actionUrl: '/orders/123',
    actionLabel: 'View Order'
  }
});

// Pre-built helpers
await notificationService.sendLabResultNotification(userId, 'CBC', true);
await notificationService.sendAppointmentReminder(userId, '2024-06-15', 'X-Ray');
```

### 2. Real-Time Updates
The system automatically:
- Subscribes to new notifications via Supabase real-time
- Shows toast notifications for new items
- Updates the bell icon badge count
- Refreshes the notification list

### 3. User Interface
- **Bell Icon**: Shows unread count badge
- **Dropdown**: Click bell to see notifications
- **Mark as Read**: Click notification or use "Mark all read"
- **Action Links**: Clickable links in notifications (e.g., "View Order")
- **Timestamps**: Shows "2m ago", "5h ago", etc.

## Integration Points

### Currently Integrated
✅ Lab Results (`LabResultsManager.tsx`, `LabAppointmentsList.tsx`)
✅ Prescription Status (`DatabasePrescriptionList.tsx`, `PrescriptionHistoryItem.tsx`)
✅ Admin Actions (`AdminDashboard.tsx`)
✅ Pharmacy Dashboard Welcome (`PharmacyDashboard.tsx`)

### Needs Integration
⚠️ Order status changes (wholesale/retail)
⚠️ Low inventory alerts (automatic threshold detection)
⚠️ Payment received/failed
⚠️ Credit limit warnings
⚠️ Delivery updates
⚠️ System maintenance alerts

## Adding Notifications to New Features

### Step 1: Import the service
```typescript
import { notificationService } from '@/services/notificationService';
```

### Step 2: Call at appropriate times
```typescript
// After successful order creation
await notificationService.createNotification({
  user_id: recipientId,
  title: 'New Order',
  message: `Order #${orderId} received`,
  type: 'info',
  metadata: {
    priority: 'high',
    category: 'order',
    actionUrl: `/orders/${orderId}`,
    actionLabel: 'View Order'
  }
});
```

### Step 3: Add toast for immediate feedback (optional)
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Immediate user feedback
toast({
  title: 'Order Created',
  description: 'We\'ll notify the customer',
});

// Also create persistent notification
await notificationService.createNotification({...});
```

## Notification Types

### Priority Levels
- `high`: Red badge, toast shown, appears at top
- `medium`: Orange badge, standard display
- `low`: Gray badge, minimal emphasis

### Categories
- `order`: Order-related notifications
- `inventory`: Stock alerts
- `payment`: Payment updates
- `system`: System messages
- `appointment`: Appointment reminders
- `lab_result`: Lab results ready
- `delivery`: Delivery updates
- `credit`: Credit warnings

## Best Practices

1. **Be Specific**: Include relevant IDs, amounts, dates in messages
2. **Add Actions**: Provide `actionUrl` and `actionLabel` when user can take action
3. **Set Priority**: Use `high` sparingly for urgent items only
4. **Include Metadata**: Store extra data in `metadata` for filtering/debugging
5. **Don't Spam**: Batch similar notifications when possible
6. **Expires**: Set `expires_at` for time-sensitive notifications

## Testing

### View notifications in database
```sql
SELECT * FROM notifications WHERE user_id = 'xxx' ORDER BY created_at DESC LIMIT 10;
```

### Test real-time
1. Open app in two browser tabs
2. Create notification in one tab
3. Should appear immediately in other tab

### Generate sample data
```typescript
await notificationService.createSampleNotifications(userId);
```
