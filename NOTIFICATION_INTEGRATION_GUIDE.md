# Notification Integration Guide

## Overview
This guide explains how to use the comprehensive notification system across all platform features.

## Architecture

### Services
1. **notificationService** (`src/services/notificationService.ts`)
   - Handles in-app notifications in the database
   - Real-time updates via Supabase subscriptions

2. **emailService** (`src/services/emailService.ts`)
   - Sends emails via Resend
   - Pre-built email templates for common scenarios

3. **comprehensiveNotificationService** (`src/services/comprehensiveNotificationService.ts`)
   - **USE THIS SERVICE FOR ALL NOTIFICATIONS**
   - Combines in-app + email notifications
   - Handles all notification types across the platform

## Configuration

### 1. Resend Email Setup
1. Go to [Resend Dashboard](https://resend.com)
2. Create an API key
3. Verify your sending domain
4. Add to System Settings → Integrations:
   - **Resend API Key**: `re_xxxxx`
   - **From Email**: `notifications@bepawaa.com`

### 2. WhatsApp Setup (Optional)
Configure in System Settings → WhatsApp tab.

## Usage Examples

### Individual Notifications

#### Lab Test Booked
```typescript
import { comprehensiveNotificationService } from '@/services/comprehensiveNotificationService';

await comprehensiveNotificationService.notifyLabTestBooked(
  userId,
  email,
  'John Doe',
  'CBC Blood Test',
  '2024-02-15 10:00 AM',
  'Bepawa Medical Lab'
);
```

#### Order Placed
```typescript
await comprehensiveNotificationService.notifyOrderPlaced(
  userId,
  email,
  'ORD-12345',
  50000,
  [
    { product_name: 'Paracetamol', quantity: 2, total_price: 10000 },
    { product_name: 'Amoxicillin', quantity: 1, total_price: 40000 }
  ]
);
```

#### Lab Results Ready
```typescript
await comprehensiveNotificationService.notifyLabResultsReady(
  userId,
  email,
  'John Doe',
  'CBC Blood Test',
  '/health-records/results/123'
);
```

### Pharmacy Notifications

#### New Order Received
```typescript
await comprehensiveNotificationService.notifyPharmacyNewOrder(
  pharmacyId,
  pharmacyEmail,
  'ORD-12345',
  'John Doe',
  50000
);
```

#### Low Stock Alert
```typescript
await comprehensiveNotificationService.notifyLowStock(
  pharmacyId,
  pharmacyEmail,
  'Paracetamol 500mg',
  5, // current stock
  10 // minimum threshold
);
```

### Wholesaler Notifications

#### New Retailer Order
```typescript
await comprehensiveNotificationService.notifyWholesalerNewOrder(
  wholesalerId,
  email,
  'ORD-67890',
  'City Pharmacy',
  500000
);
```

#### Credit Payment Due
```typescript
await comprehensiveNotificationService.notifyCreditPaymentDue(
  wholesalerId,
  email,
  'City Pharmacy',
  250000,
  '2024-02-28'
);
```

### Lab Notifications

#### New Appointment
```typescript
await comprehensiveNotificationService.notifyLabNewAppointment(
  labId,
  labEmail,
  'Jane Smith',
  'HIV Test',
  '2024-02-15 14:00'
);
```

#### Result Upload Reminder
```typescript
await comprehensiveNotificationService.notifyLabResultUploadDue(
  labId,
  appointmentId,
  'Jane Smith',
  'HIV Test'
);
```

### Admin Notifications

#### New Provider Request
```typescript
await comprehensiveNotificationService.notifyAdminNewProviderRequest(
  adminId,
  'New Hope Pharmacy',
  'pharmacy',
  providerId
);
```

#### Payment Received
```typescript
await comprehensiveNotificationService.notifyAdminPaymentReceived(
  adminId,
  100000,
  'City Pharmacy',
  'subscription'
);
```

## Integration Checklist

### ✅ Currently Integrated
- [x] Lab results upload
- [x] Admin approvals
- [x] Order status updates
- [x] Prescription sharing

### ⚠️ Needs Integration

#### Individual Features
- [ ] Lab test booking confirmation
- [ ] Circumcision appointment booking
- [ ] HIV kit purchase confirmation
- [ ] Pharmacy order placement
- [ ] Order acceptance/rejection
- [ ] Therapy chatbot booking

#### Pharmacy Features
- [ ] New customer order notification
- [ ] Wholesale restock order updates
- [ ] Low stock automatic alerts (via inventory monitor)
- [ ] Price adjustment logs

#### Wholesaler Features
- [ ] New retailer order notification
- [ ] Credit payment reminders (scheduled)
- [ ] Restock confirmations

#### Lab Features
- [ ] New appointment notification
- [ ] Result upload reminder (24h after appointment)
- [ ] Appointment cancellation

#### Admin Features
- [ ] New provider registration
- [ ] New branch added
- [ ] Payment status updates

## Adding Notifications to New Features

### Step 1: Import the service
```typescript
import { comprehensiveNotificationService } from '@/services/comprehensiveNotificationService';
```

### Step 2: Call at the appropriate time
```typescript
// After successful action
try {
  await comprehensiveNotificationService.notifyXXX(
    userId,
    email,
    // ... other params
  );
} catch (error) {
  console.error('Failed to send notification:', error);
  // Don't throw - notification failure shouldn't break the main flow
}
```

### Step 3: Get user email
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('email, name')
  .eq('id', userId)
  .single();
```

## Automatic Monitoring

### Low Stock Monitor
The `inventoryMonitorService` can be set up to run periodically:

```typescript
import { inventoryMonitorService } from '@/services/inventoryMonitorService';

// Check specific product
await inventoryMonitorService.checkAndAlertLowStock(productId);

// Monitor all products for a user
await inventoryMonitorService.monitorUserInventory(userId);
```

Set up a cron job or edge function to run this daily.

## Email Templates

All email templates are defined in `comprehensiveNotificationService.ts`. They include:
- Welcome emails
- Order confirmations
- Lab appointment confirmations
- Lab results notifications
- Low stock alerts
- Payment reminders

Templates are responsive and include:
- Proper branding
- Clear call-to-action buttons
- Relevant details
- Professional styling

## Testing

### Test In-App Notifications
1. Trigger an action (e.g., create an order)
2. Check the bell icon in the navbar
3. Verify notification appears with correct details

### Test Emails
1. Ensure Resend is configured in System Settings
2. Trigger an action that sends email
3. Check recipient inbox
4. Verify email formatting and content

## Troubleshooting

### Notifications not appearing
1. Check Supabase logs: `SELECT * FROM notifications WHERE user_id = 'xxx'`
2. Verify user_id is correct
3. Check browser console for errors
4. Ensure NotificationCenter is mounted in navbar

### Emails not sending
1. Verify Resend API key is set correctly
2. Check domain is verified in Resend
3. Check Supabase edge function logs
4. Verify `from` email matches verified domain
5. Check spam folder

### Low stock alerts not triggering
1. Verify product `min_stock_level` is set
2. Check product `stock` value
3. Verify inventory monitor service is being called
4. Check user has valid email address

## Best Practices

1. **Always wrap in try-catch**: Don't let notification failures break main flow
2. **Log errors**: Always log notification errors for debugging
3. **Verify email addresses**: Ensure user profiles have valid emails
4. **Don't spam**: Be thoughtful about when to send notifications
5. **Test in staging**: Always test notification flows before production
6. **Monitor delivery**: Check Resend dashboard for email delivery stats

## Next Steps

1. **Integrate missing notifications**: Go through the checklist above
2. **Set up monitoring**: Create scheduled jobs for inventory monitoring
3. **Add SMS support**: Extend comprehensiveNotificationService for SMS via Twilio
4. **WhatsApp notifications**: Use WhatsApp Business API for critical alerts
5. **Push notifications**: Add web push for real-time mobile alerts
