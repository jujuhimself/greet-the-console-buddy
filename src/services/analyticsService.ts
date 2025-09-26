
import { supabase } from '@/integrations/supabase/client';

export interface SalesAnalytics {
  id: string;
  user_id: string;
  date: string;
  total_sales: number;
  total_orders: number;
  total_items_sold: number;
  average_order_value: number;
  top_selling_category?: string;
  new_customers: number;
  prescription_orders: number;
  lab_orders: number;
  created_at: string;
  updated_at: string;
}

export interface ProductAnalytics {
  id: string;
  user_id: string;
  product_id: string;
  date: string;
  quantity_sold: number;
  revenue: number;
  profit_margin: number;
  stock_turnover_rate: number;
  created_at: string;
}

export interface CustomerAnalytics {
  id: string;
  user_id: string;
  customer_id: string;
  first_order_date?: string;
  last_order_date?: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_category?: string;
  customer_lifetime_value: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

class AnalyticsService {
  async getSalesAnalytics(startDate?: string, endDate?: string): Promise<SalesAnalytics[]> {
    let query = supabase
      .from('sales_analytics')
      .select('*')
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }

    return data || [];
  }

  async getProductAnalytics(productId?: string, startDate?: string, endDate?: string): Promise<ProductAnalytics[]> {
    let query = supabase
      .from('product_analytics')
      .select('*')
      .order('date', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }

    return data || [];
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics[]> {
    const { data, error } = await supabase
      .from('customer_analytics')
      .select('*')
      .order('total_spent', { ascending: false });

    if (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }

    return data || [];
  }

  async getDashboardMetrics(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
  }> {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const { data: salesData, error: salesError } = await supabase
      .from('sales_analytics')
      .select('total_sales, total_orders, average_order_value')
      .gte('date', lastMonth.toISOString().split('T')[0]);

    if (salesError) {
      console.error('Error fetching dashboard metrics:', salesError);
      throw salesError;
    }

    const { data: customerData, error: customerError } = await supabase
      .from('customer_analytics')
      .select('customer_id')
      .gte('last_activity_date', lastMonth.toISOString().split('T')[0]);

    if (customerError) {
      console.error('Error fetching customer metrics:', customerError);
      throw customerError;
    }

    const totalSales = salesData?.reduce((sum, day) => sum + Number(day.total_sales), 0) || 0;
    const totalOrders = salesData?.reduce((sum, day) => sum + day.total_orders, 0) || 0;
    const totalCustomers = customerData?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      totalCustomers,
      averageOrderValue
    };
  }
}

export const analyticsService = new AnalyticsService();
