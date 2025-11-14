import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

class EmailService {
  /**
   * Send an email using Resend via edge function
   */
  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData,
      });

      if (error) throw error;

      console.log('Email sent successfully:', data);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
    const subject = 'Welcome to Bepawa Platform! 🎉';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Bepawa Platform!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining Bepawa as a <strong>${role}</strong>. We're excited to have you on board!</p>
        <p>You can now access all features of the platform:</p>
        <ul>
          ${this.getRoleBenefits(role)}
        </ul>
        <p>If you need any assistance, our support team is here to help.</p>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = 'Reset Your Bepawa Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>We received a request to reset your password for your Bepawa account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    email: string,
    orderNumber: string,
    items: any[],
    totalAmount: number
  ): Promise<void> {
    const subject = `Order Confirmation - ${orderNumber}`;
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">TZS ${item.total_price.toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmed! 📦</h1>
        <p>Your order <strong>${orderNumber}</strong> has been successfully placed.</p>
        
        <h2 style="color: #374151;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: left;">Quantity</th>
              <th style="padding: 8px; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 8px; font-weight: bold;">Total</td>
              <td style="padding: 12px 8px; font-weight: bold;">TZS ${totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 20px;">We'll notify you when your order is ready for pickup or delivery.</p>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send lab appointment confirmation
   */
  async sendLabAppointmentConfirmation(
    email: string,
    patientName: string,
    testType: string,
    appointmentDate: string,
    labName: string
  ): Promise<void> {
    const subject = `Lab Appointment Confirmed - ${testType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Lab Appointment Confirmed! 🔬</h1>
        <p>Hi ${patientName},</p>
        <p>Your lab appointment has been scheduled:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Test Type:</strong> ${testType}</p>
          <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${appointmentDate}</p>
          <p style="margin: 5px 0;"><strong>Lab:</strong> ${labName}</p>
        </div>
        
        <p><strong>Preparation Instructions:</strong></p>
        <ul>
          <li>Please arrive 10 minutes early</li>
          <li>Bring your ID and any relevant medical documents</li>
          <li>Fasting may be required for some tests</li>
        </ul>
        
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send lab results notification
   */
  async sendLabResultsNotification(
    email: string,
    patientName: string,
    testType: string,
    resultsUrl?: string
  ): Promise<void> {
    const subject = `Your Lab Results Are Ready - ${testType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your Lab Results Are Ready! 📋</h1>
        <p>Hi ${patientName},</p>
        <p>Your <strong>${testType}</strong> results are now available.</p>
        
        ${resultsUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resultsUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Results
            </a>
          </div>
        ` : '<p>Please log in to your account to view your results.</p>'}
        
        <p>If you have any questions about your results, please consult with your healthcare provider.</p>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send low stock alert
   */
  async sendLowStockAlert(
    email: string,
    productName: string,
    currentStock: number,
    minThreshold: number
  ): Promise<void> {
    const subject = `🚨 Low Stock Alert: ${productName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Low Stock Alert! ⚠️</h1>
        <p><strong>${productName}</strong> is running low on stock.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Current Stock:</strong> ${currentStock} units</p>
          <p style="margin: 5px 0;"><strong>Minimum Threshold:</strong> ${minThreshold} units</p>
        </div>
        
        <p>Please reorder soon to avoid stockouts.</p>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Send subscription payment reminder
   */
  async sendPaymentReminder(
    email: string,
    userName: string,
    amount: number,
    dueDate: string
  ): Promise<void> {
    const subject = 'Payment Reminder - Bepawa Subscription';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Payment Reminder 💳</h1>
        <p>Hi ${userName},</p>
        <p>This is a friendly reminder that your subscription payment is due.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Amount Due:</strong> TZS ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        
        <p>Please ensure payment is made by the due date to continue enjoying uninterrupted service.</p>
        <p>Best regards,<br>The Bepawa Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  /**
   * Get role-specific benefits for welcome email
   */
  private getRoleBenefits(role: string): string {
    const benefits: Record<string, string[]> = {
      individual: [
        'Browse and order from pharmacies',
        'Book lab tests and appointments',
        'Track prescriptions and health records',
        'Access therapy and counseling services',
      ],
      pharmacy: [
        'Manage inventory and orders',
        'Process prescriptions',
        'Track sales and analytics',
        'Connect with wholesalers and patients',
      ],
      wholesale: [
        'Manage product catalog',
        'Process retailer orders',
        'Track inventory across branches',
        'Manage credit and payments',
      ],
      lab: [
        'Manage appointments and tests',
        'Upload and manage lab results',
        'Track patient history',
        'Send automated notifications',
      ],
      retail: [
        'Point of sale system',
        'Inventory management',
        'Customer relationship management',
        'Sales analytics and reporting',
      ],
    };

    const roleBenefits = benefits[role.toLowerCase()] || benefits['individual'];
    return roleBenefits.map(benefit => `<li>${benefit}</li>`).join('');
  }
}

export const emailService = new EmailService();