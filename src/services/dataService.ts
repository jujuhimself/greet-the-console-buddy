import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

interface StorageData {
  orders: any[];
  inventory: any[];
  prescriptions: any[];
  creditRequests: any[];
  notifications: any[];
  userPreferences: any;
  financialData: any;
}

class DataService {
  private static instance: DataService;
  private storagePrefix = 'bepawa_';
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Generic storage methods
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.storagePrefix + key, JSON.stringify(value));
      this.dispatchStorageEvent(key, value);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Storage quota exceeded or unavailable');
    }
  }

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.storagePrefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.storagePrefix + key);
    this.dispatchStorageEvent(key, null);
  }

  // Supabase Products Methods
  async getProducts(userId?: string, role?: string): Promise<Tables<'products'>[]> {
    try {
      let query = supabase.from('products').select('*');
      
      if (role === 'individual') {
        // Individuals see only public retail products
        query = query.eq('is_public_product', true).eq('is_retail_product', true);
      } else if (role === 'retail') {
        // Retail users see wholesale products and their own
        query = query.or(`wholesaler_id.is.not.null,user_id.eq.${userId}`);
      } else if (role === 'wholesale') {
        // Wholesale users see their own products
        query = query.eq('user_id', userId);
      } else if (role === 'admin') {
        // Admins see all products
        // Admins see all products - no additional filter needed
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async createProduct(product: TablesInsert<'products'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select('id')
        .single();
      
      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async updateProduct(id: string, updates: TablesUpdate<'products'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Supabase Orders Methods
  async getOrders(userId?: string, role?: string): Promise<Tables<'orders'>[]> {
    try {
      let query = supabase.from('orders').select('*');
      
      if (role === 'individual') {
        query = query.eq('user_id', userId);
      } else if (role === 'retail') {
        query = query.eq('pharmacy_id', userId);
      } else if (role === 'wholesale') {
        query = query.eq('wholesaler_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async createOrder(order: TablesInsert<'orders'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select('id')
        .single();
      
      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  // Supabase Inventory Methods
  async getInventoryAdjustments(userId?: string): Promise<Tables<'inventory_adjustments'>[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory adjustments:', error);
      return [];
    }
  }

  async createInventoryAdjustment(adjustment: TablesInsert<'inventory_adjustments'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory_adjustments')
        .insert(adjustment);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating inventory adjustment:', error);
      return false;
    }
  }

  // Supabase Staff Methods
  async getStaffMembers(pharmacyId: string): Promise<Tables<'staff_members'>[]> {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching staff members:', error);
      return [];
    }
  }

  async createStaffMember(staff: TablesInsert<'staff_members'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .insert(staff)
        .select('id')
        .single();
      
      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating staff member:', error);
      return null;
    }
  }

  // Supabase Credit Methods
  async getCreditAccounts(userId: string): Promise<Tables<'credit_accounts'>[]> {
    try {
      const { data, error } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching credit accounts:', error);
      return [];
    }
  }

  async createCreditAccount(account: TablesInsert<'credit_accounts'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('credit_accounts')
        .insert(account)
        .select('id')
        .single();
      
      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating credit account:', error);
      return null;
    }
  }

  // Specific data methods (keeping for backward compatibility)
  saveOrders(orders: any[]): void {
    this.setItem('orders', orders);
  }

  getOrdersLocal(): any[] {
    return this.getItem('orders', []);
  }

  saveInventory(inventory: any[]): void {
    this.setItem('inventory', inventory);
  }

  getInventoryLocal(): any[] {
    return this.getItem('inventory', []);
  }

  savePrescriptions(prescriptions: any[]): void {
    this.setItem('prescriptions', prescriptions);
  }

  getPrescriptions(): any[] {
    return this.getItem('prescriptions', []);
  }

  saveNotifications(notifications: any[]): void {
    this.setItem('notifications', notifications);
  }

  getNotifications(): any[] {
    return this.getItem('notifications', []);
  }

  // Backup and restore
  exportData(): string {
    const data: Partial<StorageData> = {
      orders: this.getOrdersLocal(),
      inventory: this.getInventoryLocal(),
      prescriptions: this.getPrescriptions(),
      creditRequests: this.getItem('creditRequests', []),
      notifications: this.getNotifications(),
      userPreferences: this.getItem('userPreferences', {}),
      financialData: this.getItem('financialData', {})
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data: Partial<StorageData> = JSON.parse(jsonData);
      
      if (data.orders) this.saveOrders(data.orders);
      if (data.inventory) this.saveInventory(data.inventory);
      if (data.prescriptions) this.savePrescriptions(data.prescriptions);
      if (data.creditRequests) this.setItem('creditRequests', data.creditRequests);
      if (data.notifications) this.saveNotifications(data.notifications);
      if (data.userPreferences) this.setItem('userPreferences', data.userPreferences);
      if (data.financialData) this.setItem('financialData', data.financialData);
      
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storagePrefix));
    keys.forEach(key => localStorage.removeItem(key));
  }

  private dispatchStorageEvent(key: string, value: any): void {
    window.dispatchEvent(new CustomEvent('bepawa-storage-change', {
      detail: { key, value }
    }));
  }
}

export const dataService = DataService.getInstance();
