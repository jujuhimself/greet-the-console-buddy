
import { supabase } from '@/integrations/supabase/client';
import { auditService } from './auditService';
import { logError } from '@/utils/logger';

export interface AdminPolicyAction {
  action: 'approve_user' | 'reject_user' | 'suspend_user' | 'restore_user' | 'delete_user' | 'update_user_role' | 'system_backup' | 'data_export';
  targetUserId?: string;
  targetResource?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

type UserRole = 'admin' | 'individual' | 'retail' | 'wholesale' | 'lab';

class AdminPolicyService {
  private async verifyAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role === 'admin';
    } catch (error) {
      logError(error, 'Admin access verification failed');
      return false;
    }
  }

  async executeAdminAction(policyAction: AdminPolicyAction): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify admin access before any action
      const hasAccess = await this.verifyAdminAccess();
      if (!hasAccess) {
        const error = 'Unauthorized: Admin access required';
        await auditService.logAction('unauthorized_access', 'admin_policy', undefined, policyAction);
        return { success: false, error };
      }

      // Log the admin action attempt
      await auditService.logAction('admin_action_attempt', 'admin_policy', policyAction.targetUserId, policyAction);

      let result: { success: boolean; error?: string };

      switch (policyAction.action) {
        case 'approve_user':
          result = await this.approveUser(policyAction.targetUserId!, policyAction.reason);
          break;
        case 'reject_user':
          result = await this.rejectUser(policyAction.targetUserId!, policyAction.reason);
          break;
        case 'suspend_user':
          result = await this.suspendUser(policyAction.targetUserId!, policyAction.reason);
          break;
        case 'restore_user':
          result = await this.restoreUser(policyAction.targetUserId!, policyAction.reason);
          break;
        case 'update_user_role':
          result = await this.updateUserRole(policyAction.targetUserId!, policyAction.metadata?.newRole as UserRole, policyAction.reason);
          break;
        case 'system_backup':
          result = await this.initiateSystemBackup(policyAction.metadata);
          break;
        case 'data_export':
          result = await this.initiateDataExport(policyAction.targetResource!, policyAction.metadata);
          break;
        default:
          result = { success: false, error: 'Unknown admin action' };
      }

      // Log the result
      await auditService.logAction(
        result.success ? 'admin_action_success' : 'admin_action_failure',
        'admin_policy',
        policyAction.targetUserId,
        { ...policyAction, result }
      );

      return result;
    } catch (error) {
      logError(error, 'Admin policy enforcement failed');
      await auditService.logAction('admin_action_error', 'admin_policy', policyAction.targetUserId, { ...policyAction, error: error.message });
      return { success: false, error: 'Internal server error' };
    }
  }

  private async approveUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: beforeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      const { data: afterData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      await auditService.logAction('approve_user', 'user', userId, { before: beforeData, after: afterData, reason });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async rejectUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: beforeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_approved: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      const { data: afterData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      await auditService.logAction('reject_user', 'user', userId, { before: beforeData, after: afterData, reason });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async suspendUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: beforeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      const { data: afterData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      await auditService.logAction('suspend_user', 'user', userId, { before: beforeData, after: afterData, reason });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async restoreUser(userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: beforeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: false,
          suspended_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      const { data: afterData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      await auditService.logAction('restore_user', 'user', userId, { before: beforeData, after: afterData, reason });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async updateUserRole(userId: string, newRole: UserRole, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: beforeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      const { data: afterData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      await auditService.logAction('update_user_role', 'user', userId, { before: beforeData, after: afterData, reason });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async initiateSystemBackup(metadata?: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      await auditService.logAction('system_backup_initiated', 'system', undefined, metadata);
      // In a real implementation, this would trigger a backup process
      console.log('System backup initiated with metadata:', metadata);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async initiateDataExport(resource: string, metadata?: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      await auditService.logAction('data_export_initiated', resource, undefined, metadata);
      // In a real implementation, this would trigger a data export process
      console.log('Data export initiated for resource:', resource, 'with metadata:', metadata);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAdminActionHistory(limit: number = 50): Promise<any[]> {
    try {
      const hasAccess = await this.verifyAdminAccess();
      if (!hasAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      return await auditService.getAuditLogs('admin_policy');
    } catch (error) {
      logError(error, 'Failed to fetch admin action history');
      return [];
    }
  }
}

export const adminPolicyService = new AdminPolicyService();
