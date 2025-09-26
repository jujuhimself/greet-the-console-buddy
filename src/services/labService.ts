import { supabase } from '@/integrations/supabase/client';

export interface LabTest {
  id: string;
  user_id: string;
  test_name: string;
  test_code: string;
  category: string;
  description?: string;
  sample_type: string;
  preparation_instructions?: string;
  normal_range?: string;
  price: number;
  turnaround_time_hours: number;
  is_active: boolean;
  lab_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LabOrder {
  id: string;
  user_id: string;
  patient_name: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: 'male' | 'female' | 'other';
  doctor_name: string;
  doctor_phone?: string;
  order_date: string;
  sample_collection_date?: string;
  sample_collection_time?: string;
  total_amount: number;
  status: 'pending' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  lab_id?: string;
  payment_status: 'unpaid' | 'paid' | 'partial';
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface LabOrderItem {
  id: string;
  lab_order_id: string;
  lab_test_id: string;
  test_name: string;
  test_price: number;
  result?: string;
  result_date?: string;
  status: 'pending' | 'processing' | 'completed';
  created_at: string;
}

class LabService {
  async getLabTests(): Promise<LabTest[]> {
    const { data, error } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('is_active', true)
      .order('test_name');

    if (error) {
      console.error('Error fetching lab tests:', error);
      throw error;
    }

    return data || [];
  }

  async createLabTest(test: Omit<LabTest, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<LabTest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('lab_tests')
      .insert({
        ...test,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lab test:', error);
      throw error;
    }

    return data;
  }

  async getLabOrders(): Promise<LabOrder[]> {
    const { data, error } = await supabase
      .from('lab_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lab orders:', error);
      throw error;
    }

    return (data || []).map(order => ({
      ...order,
      status: order.status as LabOrder['status'],
      payment_status: order.payment_status as LabOrder['payment_status'],
      patient_gender: order.patient_gender as LabOrder['patient_gender']
    }));
  }

  async createLabOrder(order: Omit<LabOrder, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<LabOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('lab_orders')
      .insert({
        ...order,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lab order:', error);
      throw error;
    }

    return {
      ...data,
      status: data.status as LabOrder['status'],
      payment_status: data.payment_status as LabOrder['payment_status'],
      patient_gender: data.patient_gender as LabOrder['patient_gender']
    };
  }

  async getLabOrderItems(labOrderId: string): Promise<LabOrderItem[]> {
    const { data, error } = await supabase
      .from('lab_order_items')
      .select('*')
      .eq('lab_order_id', labOrderId)
      .order('created_at');

    if (error) {
      console.error('Error fetching lab order items:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as LabOrderItem['status']
    }));
  }

  async createLabOrderItem(item: Omit<LabOrderItem, 'id' | 'created_at'>): Promise<LabOrderItem> {
    const { data, error } = await supabase
      .from('lab_order_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating lab order item:', error);
      throw error;
    }

    return {
      ...data,
      status: data.status as LabOrderItem['status']
    };
  }

  async updateLabOrderStatus(id: string, status: LabOrder['status']): Promise<LabOrder> {
    const { data, error } = await supabase
      .from('lab_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lab order status:', error);
      throw error;
    }

    return {
      ...data,
      status: data.status as LabOrder['status'],
      payment_status: data.payment_status as LabOrder['payment_status'],
      patient_gender: data.patient_gender as LabOrder['patient_gender']
    };
  }

  async updateLabOrderItemResult(id: string, result: string, fileUrl?: string): Promise<LabOrderItem> {
    const { data, error } = await supabase
      .from('lab_order_items')
      .update({ 
        result,
        result_file_url: fileUrl || null,
        result_date: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lab order item result:', error);
      throw error;
    }

    return {
      ...data,
      status: data.status as LabOrderItem['status']
    };
  }
}

export const labService = new LabService();
