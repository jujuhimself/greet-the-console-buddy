
import { supabase } from '@/integrations/supabase/client';

export interface PosSale {
  id: string;
  user_id: string;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  customer_name?: string;
  created_at: string;
}

export interface PosSaleItem {
  id: string;
  pos_sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

class PosService {
  async createSale(sale: Omit<PosSale, 'id' | 'created_at'>, items: Omit<PosSaleItem, 'id' | 'pos_sale_id'>[]) {
    const { data: saleData, error: saleError } = await supabase
      .from('pos_sales')
      .insert(sale)
      .select()
      .single();

    if (saleError) throw saleError;

    if (items.length > 0) {
      const saleItems = items.map(item => ({
        ...item,
        pos_sale_id: saleData.id
      }));

      const { error: itemsError } = await supabase
        .from('pos_sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;
    }

    return saleData;
  }

  async fetchSales() {
    const { data, error } = await supabase
      .from('pos_sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSaleById(id: string) {
    const { data, error } = await supabase
      .from('pos_sales')
      .select(`
        *,
        pos_sale_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

export const posService = new PosService();
