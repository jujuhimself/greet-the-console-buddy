
import { supabase } from '@/integrations/supabase/client';

export interface BackupJob {
  id: string;
  user_id: string;
  backup_type: 'full' | 'incremental' | 'data_only';
  status: 'pending' | 'running' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

class BackupService {
  async createBackup(backupType: BackupJob['backup_type']): Promise<BackupJob> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('backup_jobs')
      .insert({
        user_id: user.id,
        backup_type: backupType,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating backup job:', error);
      throw error;
    }

    return {
      ...data,
      backup_type: data.backup_type as BackupJob['backup_type'],
      status: data.status as BackupJob['status'],
    };
  }

  async getBackupHistory(): Promise<BackupJob[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('backup_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching backup history:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      backup_type: item.backup_type as BackupJob['backup_type'],
      status: item.status as BackupJob['status'],
    }));
  }

  async downloadBackup(backupId: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('backups')
      .download(`backup_${backupId}.sql`);

    if (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }

    return data;
  }

  async scheduleBackup(schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    backupType: BackupJob['backup_type'];
    isActive: boolean;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('backup_schedules')
      .upsert({
        user_id: user.id,
        frequency: schedule.frequency,
        time: schedule.time,
        backup_type: schedule.backupType,
        is_active: schedule.isActive
      });

    if (error) {
      console.error('Error scheduling backup:', error);
      throw error;
    }
  }
}

export const backupService = new BackupService();
