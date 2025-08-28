import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  max_stock?: number;
  buy_price: number;
  sell_price: number;
  requires_prescription?: boolean;
  expiry_date?: string;
  last_ordered?: string;
  is_wholesale_product?: boolean;
  is_retail_product?: boolean;
  is_public_product?: boolean;
  wholesaler_id?: string;
  wholesaler_name?: string;
  pharmacy_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  branch_id?: string;
  item_type_id?: string;
  sku?: string;
  barcode?: string;
  manufacturer?: string;
  dosage_form?: string;
  strength?: string;
  pack_size?: string;
  supplier?: string;
  batch_number?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  image_url?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id?: string;
  order_date: string;
  expected_delivery?: string;
  total_amount: number;
  notes?: string;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number;
  total_cost: number;
  received_quantity?: number;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  user_id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  created_at: string;
  created_by?: string;
}

class InventoryService {
  async getProducts(userRole?: string): Promise<Product[]> {
    let query = supabase.from('products').select('*');

    // Apply role-based filtering at query level for better performance
    if (userRole === 'individual') {
      query = query.or('is_retail_product.eq.true,is_public_product.eq.true');
    } else if (userRole === 'retail') {
      // Retail users see wholesale products, public products, and their own products
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const orQuery = `is_wholesale_product.eq.true,is_public_product.eq.true,user_id.eq.${user.id}`;
        console.log('Retailer product query:', orQuery, 'user.id:', user.id);
        query = query.or(orQuery);
      }
    } else if (userRole === 'wholesale') {
      // Wholesale users should only see their own products
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('wholesaler_id', user.id);
        console.log('Wholesaler product query - wholesaler_id:', user.id);
      }
    }
    // For other roles (admin, etc.), show all products (no additional filter needed)

    query = query.order('name');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} products for role: ${userRole}`);

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.sell_price || 0,
      stock: item.stock,
      min_stock: item.min_stock_level || 0,
      max_stock: item.max_stock,
      buy_price: item.buy_price || 0,
      sell_price: item.sell_price || 0,
      requires_prescription: item.requires_prescription,
      expiry_date: item.expiry_date,
      last_ordered: item.last_ordered,
      is_wholesale_product: item.is_wholesale_product,
      is_retail_product: item.is_retail_product,
      is_public_product: item.is_public_product,
      wholesaler_id: item.wholesaler_id,
      pharmacy_id: item.pharmacy_id,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      branch_id: item.branch_id,
      item_type_id: item.item_type_id,
      sku: item.sku,
      manufacturer: item.manufacturer,
      dosage_form: item.dosage_form,
      strength: item.strength,
      pack_size: item.pack_size,
      supplier: item.supplier,
      batch_number: item.batch_number,
      status: item.status as Product['status'],
      image_url: item.image_url
    }));
  }

  async getProduct(productId: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.sell_price || 0,
      stock: data.stock,
      min_stock: data.min_stock_level || 0,
      max_stock: data.max_stock,
      buy_price: data.buy_price || 0,
      sell_price: data.sell_price || 0,
      requires_prescription: data.requires_prescription,
      expiry_date: data.expiry_date,
      last_ordered: data.last_ordered,
      is_wholesale_product: data.is_wholesale_product,
      is_retail_product: data.is_retail_product,
      is_public_product: data.is_public_product,
      wholesaler_id: data.wholesaler_id,
      pharmacy_id: data.pharmacy_id,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      branch_id: data.branch_id,
      item_type_id: data.item_type_id,
      sku: data.sku,
      manufacturer: data.manufacturer,
      dosage_form: data.dosage_form,
      strength: data.strength,
      pack_size: data.pack_size,
      supplier: data.supplier,
      batch_number: data.batch_number,
      status: data.status as Product['status'],
      image_url: data.image_url
    };
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    // Get user role to set appropriate visibility flags
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be signed in to add a product. Please log in again.');
    }
    let insertObj: any = {
      name: product.name,
      description: product.description,
      category: product.category,
      stock: product.stock,
      min_stock_level: product.min_stock,
      max_stock: product.max_stock,
      buy_price: product.buy_price,
      sell_price: product.sell_price,
      requires_prescription: product.requires_prescription,
      expiry_date: product.expiry_date,
      branch_id: product.branch_id,
      sku: product.sku,
      manufacturer: product.manufacturer,
      dosage_form: product.dosage_form,
      strength: product.strength,
      pack_size: product.pack_size,
      supplier: product.supplier,
      batch_number: product.batch_number,
      status: product.status,
      image_url: product.image_url,
      user_id: user.id // Always set to current user
    };

    // Fetch user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'wholesale') {
      insertObj.is_wholesale_product = true;
      insertObj.is_retail_product = false;
      insertObj.is_public_product = !!product.is_public_product;
      insertObj.wholesaler_id = user.id;
    } else if (profile?.role === 'retail') {
      insertObj.is_wholesale_product = false;
      insertObj.is_retail_product = true;
      insertObj.is_public_product = !!product.is_public_product;
    }

    const { data, error } = await supabase
      .from('products')
      .insert(insertObj)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return {
      ...product,
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        stock: updates.stock,
        min_stock_level: updates.min_stock,
        max_stock: updates.max_stock,
        buy_price: updates.buy_price,
        sell_price: updates.sell_price,
        requires_prescription: updates.requires_prescription,
        expiry_date: updates.expiry_date,
        sku: updates.sku,
        manufacturer: updates.manufacturer,
        dosage_form: updates.dosage_form,
        strength: updates.strength,
        pack_size: updates.pack_size,
        supplier: updates.supplier,
        batch_number: updates.batch_number,
        status: updates.status,
        image_url: updates.image_url
      })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateStock(productId: string, newStock: number, reason?: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  async getInventoryMovements(productId?: string): Promise<InventoryMovement[]> {
    let query = supabase
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching inventory movements:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      movement_type: item.movement_type as InventoryMovement['movement_type']
    }));
  }

  async createInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement> {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert(movement)
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory movement:', error);
      throw error;
    }

    return {
      ...data,
      movement_type: data.movement_type as InventoryMovement['movement_type']
    };
  }

  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    return data || [];
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }

    return data;
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as PurchaseOrder['status']
    }));
  }

  async createPurchaseOrder(purchaseOrder: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(purchaseOrder)
      .select()
      .single();

    if (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }

    return {
      ...data,
      status: data.status as PurchaseOrder['status']
    };
  }

  async getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId)
      .order('created_at');

    if (error) {
      console.error('Error fetching purchase order items:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      unit_cost: item.unit_price,
      total_cost: item.total_price,
      received_quantity: 0
    }));
  }

  async createPurchaseOrderItem(item: Omit<PurchaseOrderItem, 'id' | 'created_at' | 'unit_cost' | 'total_cost' | 'received_quantity'>): Promise<PurchaseOrderItem> {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating purchase order item:', error);
      throw error;
    }

    return {
      ...data,
      unit_cost: data.unit_price,
      total_cost: data.total_price,
      received_quantity: 0
    };
  }

  async getLowStockProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', 'min_stock_level')
      .order('stock');

    if (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.sell_price || 0,
      stock: item.stock,
      min_stock: item.min_stock_level || 0,
      max_stock: item.max_stock,
      buy_price: item.buy_price || 0,
      sell_price: item.sell_price || 0,
      requires_prescription: item.requires_prescription,
      expiry_date: item.expiry_date,
      last_ordered: item.last_ordered,
      is_wholesale_product: item.is_wholesale_product,
      is_retail_product: item.is_retail_product,
      is_public_product: item.is_public_product,
      wholesaler_id: item.wholesaler_id,
      pharmacy_id: item.pharmacy_id,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      branch_id: item.branch_id,
      item_type_id: item.item_type_id,
      sku: item.sku,
      manufacturer: item.manufacturer,
      dosage_form: item.dosage_form,
      strength: item.strength,
      pack_size: item.pack_size,
      supplier: item.supplier,
      batch_number: item.batch_number,
      status: item.status as Product['status'],
      image_url: item.image_url
    }));
  }

  async getExpiringProducts(days: number = 30): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .order('expiry_date');

    if (error) {
      console.error('Error fetching expiring products:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.sell_price || 0,
      stock: item.stock,
      min_stock: item.min_stock_level || 0,
      max_stock: item.max_stock,
      buy_price: item.buy_price || 0,
      sell_price: item.sell_price || 0,
      requires_prescription: item.requires_prescription,
      expiry_date: item.expiry_date,
      last_ordered: item.last_ordered,
      is_wholesale_product: item.is_wholesale_product,
      is_retail_product: item.is_retail_product,
      is_public_product: item.is_public_product,
      wholesaler_id: item.wholesaler_id,
      pharmacy_id: item.pharmacy_id,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      branch_id: item.branch_id,
      item_type_id: item.item_type_id,
      sku: item.sku,
      manufacturer: item.manufacturer,
      dosage_form: item.dosage_form,
      strength: item.strength,
      pack_size: item.pack_size,
      supplier: item.supplier,
      batch_number: item.batch_number,
      status: item.status as Product['status'],
      image_url: item.image_url
    }));
  }

  async getSalesAnalytics(dateRange?: { from: Date; to: Date }): Promise<any[]> {
    let query = supabase
      .from('sales_analytics')
      .select('*')
      .order('date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('date', dateRange.from.toISOString().split('T')[0])
        .lte('date', dateRange.to.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }

    return data || [];
  }

  async getProductAnalytics(productId?: string, dateRange?: { from: Date; to: Date }): Promise<any[]> {
    let query = supabase
      .from('product_analytics')
      .select('*')
      .order('date', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (dateRange) {
      query = query
        .gte('date', dateRange.from.toISOString().split('T')[0])
        .lte('date', dateRange.to.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }

    return data || [];
  }
}

export const inventoryService = new InventoryService();
