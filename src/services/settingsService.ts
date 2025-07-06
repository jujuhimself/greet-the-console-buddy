import { supabase } from '@/integrations/supabase/client';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'business_only' | 'private';
    data_sharing: boolean;
    analytics_tracking: boolean;
  };
  business_settings?: {
    auto_reorder: boolean;
    low_stock_threshold: number;
    default_markup_percentage: number;
    tax_rate: number;
  };
  created_at: string;
  updated_at: string;
}

// Helper to normalize JSON and enum fields
function normalizeSettings(data: any): UserSettings {
  return {
    ...data,
    theme: 
      data.theme === 'light' || data.theme === 'dark' || data.theme === 'system'
        ? data.theme
        : 'system',
    notifications: typeof data.notifications === 'string'
      ? JSON.parse(data.notifications)
      : data.notifications,
    privacy: typeof data.privacy === 'string'
      ? JSON.parse(data.privacy)
      : data.privacy,
    business_settings: data.business_settings
      ? (typeof data.business_settings === 'string'
        ? JSON.parse(data.business_settings)
        : data.business_settings)
      : undefined,
  };
}

class SettingsService {
  async getUserSettings(): Promise<UserSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default settings
        return this.createDefaultSettings();
      }
      console.error('Error fetching user settings:', error);
      throw error;
    }

    if (!data) {
      return this.createDefaultSettings();
    }

    return normalizeSettings(data);
  }

  async createDefaultSettings(): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const defaultSettings = {
      user_id: user.id,
      theme: 'system' as const,
      language: 'en',
      timezone: 'UTC',
      currency: 'TZS',
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: false,
      },
      privacy: {
        profile_visibility: 'business_only' as const,
        data_sharing: false,
        analytics_tracking: true,
      },
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error('Error creating default settings:', error);
      throw error;
    }

    return normalizeSettings(data);
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }

    return normalizeSettings(data);
  }

  async updateNotificationSettings(notifications: UserSettings['notifications']): Promise<UserSettings> {
    return this.updateSettings({ notifications });
  }

  async updatePrivacySettings(privacy: UserSettings['privacy']): Promise<UserSettings> {
    return this.updateSettings({ privacy });
  }

  async updateBusinessSettings(business_settings: UserSettings['business_settings']): Promise<UserSettings> {
    return this.updateSettings({ business_settings });
  }

  async exportUserData(): Promise<Blob> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Collect all user data
    const [profile, settings, products, orders] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('products').select('*').eq('user_id', user.id),
      supabase.from('orders').select('*').eq('user_id', user.id),
    ]);

    const userData = {
      profile: profile.data,
      settings: settings.data,
      products: products.data,
      orders: orders.data,
      exported_at: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(userData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }
}

export const settingsService = new SettingsService();
