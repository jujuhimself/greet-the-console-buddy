
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/utils/logger';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class CategoryService {
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        logError(error, 'Failed to fetch product categories');
        throw error;
      }

      return data || [];
    } catch (error) {
      logError(error, 'CategoryService.getCategories');
      throw error;
    }
  }

  async getCategoryById(id: string): Promise<ProductCategory | null> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No data found
        }
        logError(error, 'Failed to fetch category by ID');
        throw error;
      }

      return data;
    } catch (error) {
      logError(error, 'CategoryService.getCategoryById');
      throw error;
    }
  }

  async createCategory(category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ProductCategory> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        logError(error, 'Failed to create product category');
        throw error;
      }

      return data;
    } catch (error) {
      logError(error, 'CategoryService.createCategory');
      throw error;
    }
  }

  async updateCategory(id: string, updates: Partial<ProductCategory>): Promise<ProductCategory> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logError(error, 'Failed to update product category');
        throw error;
      }

      return data;
    } catch (error) {
      logError(error, 'CategoryService.updateCategory');
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        logError(error, 'Failed to delete product category');
        throw error;
      }
    } catch (error) {
      logError(error, 'CategoryService.deleteCategory');
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
