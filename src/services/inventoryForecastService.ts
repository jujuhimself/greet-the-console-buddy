
import { supabase } from '@/integrations/supabase/client';

export interface InventoryForecast {
  id: string;
  user_id: string;
  product_id: string;
  forecast_date: string;
  forecasted_demand: number;
  actual?: number;
  created_at: string;
  updated_at: string;
}

class InventoryForecastService {
  async addForecast(forecast: Omit<InventoryForecast, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('inventory_forecasts')
      .insert(forecast)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async fetchForecasts() {
    const { data, error } = await supabase
      .from('inventory_forecasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateActual(id: string, actual: number) {
    const { data, error } = await supabase
      .from('inventory_forecasts')
      .update({ actual })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const inventoryForecastService = new InventoryForecastService();
