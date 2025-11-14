import { notificationService } from './notificationService';
import { emailService } from './emailService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive notification service that handles all platform notifications
 * Sends both in-app notifications and emails
 */
class ComprehensiveNotificationService {
  /**
   * Send notification via multiple channels
   */
  private async sendMultiChannel(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error',
    metadata?: any,
    emailData?: { to: string; subject: string; html: string }
  ): Promise<void> {
    // Send in-app notification
    await notificationService.createNotification({
      user_id: userId,
      title,
      message,
      type,
      metadata: {
        ...metadata,
        priority: type === 'error' ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
      },
    });

    // Send email if email data provided
    if (emailData) {
      try {
        await emailService.sendEmail(emailData);
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }
  }

  // ============= INDIVIDUAL NOTIFICATIONS =============

  async notifyLabTestBooked(
    userId: string,
    email: string,
    patientName: string,
    testType: string,
    appointmentDate: string,
    labName: string
  ): Promise<void> {
    await this.sendMultiChannel(
      userId,
      'Lab Test Appointment Booked 🔬',
      `Your ${testType} appointment at ${labName} is scheduled for ${appointmentDate}`,
      'success',
      {
        category: 'lab_appointment',
        testType,
        appointmentDate,
        labName,
      },
      {
        to: email,
        subject: `Lab Appointment Confirmed - ${testType}`,
        html: await this.getLabAppointmentEmailHtml(patientName, testType, appointmentDate, labName),
      }
    );
  }

  async notifyCircumcisionBooked(
    userId: string,
    email: string,
    appointmentDate: string,
    providerName: string
  ): Promise<void> {
    await this.sendMultiChannel(
      userId,
      'Circumcision Appointment Confirmed 🏥',
      `Your circumcision appointment at ${providerName} is scheduled for ${appointmentDate}`,
      'success',
      {
        category: 'appointment',
        type: 'circumcision',
        appointmentDate,
      }
    );
  }

  async notifyOrderPlaced(
    userId: string,
    email: string,
    orderNumber: string,
    totalAmount: number,
    items: any[]
  ): Promise<void> {
    await this.sendMultiChannel(
      userId,
      'Order Placed Successfully 📦',
      `Your order ${orderNumber} for TZS ${totalAmount.toLocaleString()} has been placed`,
      'success',
      {
        category: 'order',
        orderNumber,
        actionUrl: `/orders/${orderNumber}`,
        actionLabel: 'View Order',
      },
      {
        to: email,
        subject: `Order Confirmation - ${orderNumber}`,
        html: await this.getOrderEmailHtml(orderNumber, items, totalAmount),
      }
    );
  }

  async notifyOrderStatusChange(
    userId: string,
    email: string,
    orderNumber: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      pending: 'Your order is pending confirmation',
      confirmed: 'Your order has been confirmed',
      processing: 'Your order is being processed',
      ready: 'Your order is ready for pickup',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    await this.sendMultiChannel(
      userId,
      'Order Status Updated',
      statusMessages[newStatus] || `Order ${orderNumber} status: ${newStatus}`,
      newStatus === 'cancelled' ? 'warning' : 'info',
      {
        category: 'order',
        orderNumber,
        oldStatus,
        newStatus,
      }
    );
  }

  async notifyLabResultsReady(
    userId: string,
    email: string,
    patientName: string,
    testType: string,
    resultsUrl?: string
  ): Promise<void> {
    await this.sendMultiChannel(
      userId,
      'Lab Results Ready 📋',
      `Your ${testType} results are now available`,
      'success',
      {
        category: 'lab_result',
        testType,
        actionUrl: resultsUrl || '/health-records',
        actionLabel: 'View Results',
      },
      {
        to: email,
        subject: `Your Lab Results Are Ready - ${testType}`,
        html: await this.getLabResultsEmailHtml(patientName, testType, resultsUrl),
      }
    );
  }

  // ============= PHARMACY NOTIFICATIONS =============

  async notifyPharmacyNewOrder(
    pharmacyId: string,
    email: string,
    orderNumber: string,
    customerName: string,
    totalAmount: number
  ): Promise<void> {
    await this.sendMultiChannel(
      pharmacyId,
      'New Order Received 🛒',
      `New order ${orderNumber} from ${customerName} - TZS ${totalAmount.toLocaleString()}`,
      'info',
      {
        category: 'order',
        priority: 'high',
        orderNumber,
        actionUrl: `/orders/${orderNumber}`,
        actionLabel: 'View Order',
      }
    );
  }

  async notifyLowStock(
    pharmacyId: string,
    email: string,
    productName: string,
    currentStock: number,
    minThreshold: number
  ): Promise<void> {
    await this.sendMultiChannel(
      pharmacyId,
      'Low Stock Alert ⚠️',
      `${productName} is running low (${currentStock} units left, threshold: ${minThreshold})`,
      'warning',
      {
        category: 'inventory',
        priority: 'high',
        productName,
        currentStock,
        minThreshold,
      },
      {
        to: email,
        subject: `🚨 Low Stock Alert: ${productName}`,
        html: await this.getLowStockEmailHtml(productName, currentStock, minThreshold),
      }
    );
  }

  async notifyWholesaleOrderUpdate(
    pharmacyId: string,
    orderNumber: string,
    status: string
  ): Promise<void> {
    await this.sendMultiChannel(
      pharmacyId,
      'Wholesale Order Updated',
      `Your wholesale order ${orderNumber} status: ${status}`,
      'info',
      {
        category: 'wholesale_order',
        orderNumber,
        status,
      }
    );
  }

  // ============= WHOLESALER NOTIFICATIONS =============

  async notifyWholesalerNewOrder(
    wholesalerId: string,
    email: string,
    orderNumber: string,
    retailerName: string,
    totalAmount: number
  ): Promise<void> {
    await this.sendMultiChannel(
      wholesalerId,
      'New Retailer Order 📦',
      `${retailerName} placed order ${orderNumber} - TZS ${totalAmount.toLocaleString()}`,
      'info',
      {
        category: 'order',
        priority: 'high',
        orderNumber,
        actionUrl: `/wholesale/orders/${orderNumber}`,
        actionLabel: 'View Order',
      }
    );
  }

  async notifyCreditPaymentDue(
    wholesalerId: string,
    email: string,
    retailerName: string,
    amount: number,
    dueDate: string
  ): Promise<void> {
    await this.sendMultiChannel(
      wholesalerId,
      'Credit Payment Due 💳',
      `${retailerName} has payment of TZS ${amount.toLocaleString()} due on ${dueDate}`,
      'warning',
      {
        category: 'credit',
        priority: 'high',
        retailerName,
        amount,
        dueDate,
      }
    );
  }

  // ============= LAB NOTIFICATIONS =============

  async notifyLabNewAppointment(
    labId: string,
    email: string,
    patientName: string,
    testType: string,
    appointmentDate: string
  ): Promise<void> {
    await this.sendMultiChannel(
      labId,
      'New Appointment Scheduled 📅',
      `${patientName} booked ${testType} for ${appointmentDate}`,
      'info',
      {
        category: 'appointment',
        priority: 'high',
        patientName,
        testType,
        appointmentDate,
      }
    );
  }

  async notifyLabResultUploadDue(
    labId: string,
    appointmentId: string,
    patientName: string,
    testType: string
  ): Promise<void> {
    await this.sendMultiChannel(
      labId,
      'Result Upload Reminder ⏰',
      `Please upload results for ${patientName} - ${testType}`,
      'warning',
      {
        category: 'lab_result',
        priority: 'high',
        appointmentId,
        patientName,
        testType,
      }
    );
  }

  async notifyLabAppointmentCancelled(
    labId: string,
    patientName: string,
    testType: string,
    appointmentDate: string
  ): Promise<void> {
    await this.sendMultiChannel(
      labId,
      'Appointment Cancelled ❌',
      `${patientName} cancelled ${testType} appointment on ${appointmentDate}`,
      'warning',
      {
        category: 'appointment',
        patientName,
        testType,
        appointmentDate,
      }
    );
  }

  // ============= ADMIN NOTIFICATIONS =============

  async notifyAdminNewProviderRequest(
    adminId: string,
    providerName: string,
    providerType: string,
    userId: string
  ): Promise<void> {
    await this.sendMultiChannel(
      adminId,
      'New Provider Registration 🏥',
      `${providerName} (${providerType}) requested account approval`,
      'info',
      {
        category: 'admin_approval',
        priority: 'high',
        providerName,
        providerType,
        actionUrl: `/admin?tab=approvals`,
        actionLabel: 'Review Request',
      }
    );
  }

  async notifyAdminNewBranch(
    adminId: string,
    branchName: string,
    organizationName: string
  ): Promise<void> {
    await this.sendMultiChannel(
      adminId,
      'New Branch Added 🏢',
      `${organizationName} added branch: ${branchName}`,
      'info',
      {
        category: 'admin_info',
        branchName,
        organizationName,
      }
    );
  }

  async notifyAdminPaymentReceived(
    adminId: string,
    amount: number,
    payerName: string,
    paymentType: string
  ): Promise<void> {
    await this.sendMultiChannel(
      adminId,
      'Payment Received 💰',
      `${payerName} paid TZS ${amount.toLocaleString()} for ${paymentType}`,
      'success',
      {
        category: 'payment',
        amount,
        payerName,
        paymentType,
      }
    );
  }

  // ============= EMAIL HTML TEMPLATES =============

  private async getLabAppointmentEmailHtml(
    patientName: string,
    testType: string,
    appointmentDate: string,
    labName: string
  ): Promise<string> {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Lab Appointment Confirmed! 🔬</h1>
        <p>Hi ${patientName},</p>
        <p>Your lab appointment has been scheduled:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Test Type:</strong> ${testType}</p>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${appointmentDate}</p>
          <p style="margin: 5px 0;"><strong>Lab:</strong> ${labName}</p>
        </div>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;
  }

  private async getOrderEmailHtml(
    orderNumber: string,
    items: any[],
    totalAmount: number
  ): Promise<string> {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px;">${item.product_name || item.name}</td>
        <td style="padding: 8px;">${item.quantity}</td>
        <td style="padding: 8px;">TZS ${(item.total_price || item.price).toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmed! 📦</h1>
        <p>Your order <strong>${orderNumber}</strong> has been placed.</p>
        <table style="width: 100%;">
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot><tr><td colspan="2"><strong>Total</strong></td><td><strong>TZS ${totalAmount.toLocaleString()}</strong></td></tr></tfoot>
        </table>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;
  }

  private async getLabResultsEmailHtml(
    patientName: string,
    testType: string,
    resultsUrl?: string
  ): Promise<string> {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your Lab Results Are Ready! 📋</h1>
        <p>Hi ${patientName},</p>
        <p>Your <strong>${testType}</strong> results are now available.</p>
        ${resultsUrl ? `<a href="${resultsUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View Results</a>` : ''}
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;
  }

  private async getLowStockEmailHtml(
    productName: string,
    currentStock: number,
    minThreshold: number
  ): Promise<string> {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Low Stock Alert! ⚠️</h1>
        <p><strong>${productName}</strong> is running low.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626;">
          <p><strong>Current Stock:</strong> ${currentStock} units</p>
          <p><strong>Threshold:</strong> ${minThreshold} units</p>
        </div>
        <p>Please reorder soon.</p>
      </div>
    `;
  }
}

export const comprehensiveNotificationService = new ComprehensiveNotificationService();