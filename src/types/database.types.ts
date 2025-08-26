export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'individual' | 'retail' | 'wholesale' | 'lab'
          phone?: string
          address?: string
          created_at?: string
          updated_at?: string
          
          // Individual user fields
          date_of_birth?: string
          emergency_contact?: string
          
          // Retail pharmacy fields
          pharmacy_name?: string
          license_number?: string
          pharmacist_name?: string
          
          // Wholesale pharmacy fields
          business_name?: string
          business_license?: string
          tax_id?: string
          
          // Subscription fields
          subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
          subscription_plan: 'basic' | 'medium' | 'premium'
          subscription_start_date: string
          subscription_trial_end_date: string
          subscription_period_end: string
          subscription_cancel_at_period_end: boolean
          subscription_last_payment_date?: string
          subscription_next_billing_date: string
          max_staff_accounts: number
          max_branches: number
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'admin' | 'individual' | 'retail' | 'wholesale' | 'lab'
          phone?: string
          address?: string
          created_at?: string
          updated_at?: string
          date_of_birth?: string
          emergency_contact?: string
          pharmacy_name?: string
          license_number?: string
          pharmacist_name?: string
          business_name?: string
          business_license?: string
          tax_id?: string
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
          subscription_plan?: 'basic' | 'medium' | 'premium'
          subscription_start_date?: string
          subscription_trial_end_date?: string
          subscription_period_end?: string
          subscription_cancel_at_period_end?: boolean
          subscription_last_payment_date?: string
          subscription_next_billing_date?: string
          max_staff_accounts?: number
          max_branches?: number
        }
        Update: {
          name?: string
          email?: string
          role?: 'admin' | 'individual' | 'retail' | 'wholesale' | 'lab'
          phone?: string
          address?: string
          updated_at?: string
          date_of_birth?: string
          emergency_contact?: string
          pharmacy_name?: string
          license_number?: string
          pharmacist_name?: string
          business_name?: string
          business_license?: string
          tax_id?: string
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled'
          subscription_plan?: 'basic' | 'medium' | 'premium'
          subscription_start_date?: string
          subscription_trial_end_date?: string
          subscription_period_end?: string
          subscription_cancel_at_period_end?: boolean
          subscription_last_payment_date?: string
          subscription_next_billing_date?: string
          max_staff_accounts?: number
          max_branches?: number
        }
      }
      // Add other tables here
    }
    Views: {
      [_ in never]: never
    }
  }
}
