import { supabase } from '@/integrations/supabase/client';

export interface InventoryAdjustment {
  id: string;
  user_id: string;
  product_id: string;
  adjustment_type: string;
  quantity: number;
  reason?: string;
  created_at: string;
}

class InventoryAdjustmentService {
  async createAdjustment(adjustment: Omit<InventoryAdjustment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('inventory_adjustments')
      .insert(adjustment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async fetchAdjustments(): Promise<InventoryAdjustment[]> {
    const { data, error } = await supabase
      .from('inventory_adjustments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async fetchAdjustmentsByUser(userId: string): Promise<InventoryAdjustment[]> {
    const { data, error } = await supabase
      .from('inventory_adjustments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const inventoryAdjustmentService = new InventoryAdjustmentService();
