import { supabase } from '@/integrations/supabase/client';
import { comprehensiveNotificationService } from './comprehensiveNotificationService';

/**
 * Service to monitor inventory levels and send alerts
 */
class InventoryMonitorService {
  /**
   * Check product stock and send alert if below threshold
   */
  async checkAndAlertLowStock(productId: string): Promise<void> {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_user_id_fkey(id, email, name)
        `)
        .eq('id', productId)
        .single();

      if (error || !product) {
        console.error('Error fetching product:', error);
        return;
      }

      // Check if stock is below minimum threshold
      if (product.stock <= product.min_stock_level) {
        const owner = product.profiles;
        
        if (owner?.id && owner?.email) {
          await comprehensiveNotificationService.notifyLowStock(
            owner.id,
            owner.email,
            product.name,
            product.stock,
            product.min_stock_level
          );
        }
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  }

  /**
   * Monitor all products for a user
   */
  async monitorUserInventory(userId: string): Promise<void> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, stock, min_stock_level')
        .eq('user_id', userId)
        .lte('stock', supabase.rpc('min_stock_level'));

      if (error) {
        console.error('Error fetching low stock products:', error);
        return;
      }

      // Send alert for each low stock product
      for (const product of products || []) {
        await this.checkAndAlertLowStock(product.id);
      }
    } catch (error) {
      console.error('Error monitoring inventory:', error);
    }
  }
}

export const inventoryMonitorService = new InventoryMonitorService();