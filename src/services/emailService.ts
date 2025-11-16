import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  async sendNotificationEmail(to: string, message: string): Promise<void> {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject: 'Notification from Bepawa Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Bepawa Platform</h1>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
              ${message}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is an automated notification from Bepawa Platform.
              </p>
            </div>
          </div>
        `,
      },
    });
    if (error) throw error;
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    const { error } = await supabase.functions.invoke('send-email', { body: emailData });
    if (error) throw error;
  }

  async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Bepawa Platform! 🎉',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome ${name}!</h1>
        <p>Thank you for joining as a ${role}.</p>
      </div>`,
    });
  }

  private getRoleBenefits(role: string): string {
    return '<li>Access platform features</li>';
  }
}

export const emailService = new EmailService();
