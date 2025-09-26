
import { supabase } from "@/integrations/supabase/client";

export interface BackupSchedule {
  id: string;
  user_id: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  backup_type: "full" | "incremental" | "data_only";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class BackupScheduleService {
  async getSchedules(): Promise<BackupSchedule[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from("backup_schedules")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return (data || []) as BackupSchedule[];
  }

  async upsertSchedule(schedule: Omit<BackupSchedule, "id" | "user_id" | "created_at" | "updated_at"> & { id?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const record = {
      ...schedule,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("backup_schedules")
      .upsert(record, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data as BackupSchedule;
  }

  async deleteSchedule(id: string) {
    const { error } = await supabase.from("backup_schedules").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
}

export const backupScheduleService = new BackupScheduleService();

