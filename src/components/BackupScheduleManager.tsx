
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBackupSchedules, useUpsertBackupSchedule, useDeleteBackupSchedule } from "@/hooks/useBackupSchedule";
import { useState } from "react";
import { Loader2, Clock } from "lucide-react";
import type { BackupSchedule } from "@/services/backupScheduleService";

type Frequency = "daily" | "weekly" | "monthly";
type BackupType = "full" | "incremental" | "data_only";

interface FormState {
  frequency: Frequency;
  time: string;
  backup_type: BackupType;
  is_active: boolean;
  id?: string;
}

function frequencies() {
  return [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];
}
function backupTypes() {
  return [
    { value: "full", label: "Full" },
    { value: "incremental", label: "Incremental" },
    { value: "data_only", label: "Data Only" },
  ];
}

export default function BackupScheduleManager() {
  const { data, isLoading } = useBackupSchedules();
  const upsert = useUpsertBackupSchedule();
  const del = useDeleteBackupSchedule();
  const [form, setForm] = useState<FormState>({
    frequency: "daily",
    time: "02:00",
    backup_type: "full",
    is_active: true,
    id: undefined,
  });

  // For update mode
  function handleEdit(schedule: BackupSchedule) {
    setForm({
      frequency: schedule.frequency,
      time: schedule.time,
      backup_type: schedule.backup_type,
      is_active: schedule.is_active,
      id: schedule.id,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    upsert.mutate({
      ...form,
      is_active: !!form.is_active,
    });
    setForm({ frequency: "daily", time: "02:00", backup_type: "full", is_active: true, id: undefined });
  }

  function handleDelete(id: string) {
    del.mutate(id);
    if (form.id === id) setForm({ frequency: "daily", time: "02:00", backup_type: "full", is_active: true, id: undefined });
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          <Clock className="inline-block mr-1 h-5 w-5 text-blue-600" />
          Scheduled Backups
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col sm:flex-row gap-4 items-center mb-4" onSubmit={handleSubmit}>
          <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v as Frequency }))}>
            <SelectTrigger className="w-[110px]">
              <SelectValue>{frequencies().find(f => f.value === form.frequency)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {frequencies().map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            type="time"
            className="w-[105px]"
            value={form.time}
            onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
          />
          <Select value={form.backup_type} onValueChange={v => setForm(f => ({ ...f, backup_type: v as BackupType }))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue>{backupTypes().find(b => b.value === form.backup_type)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {backupTypes().map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Switch
              checked={form.is_active}
              onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
              id="is-active"
            />
            <label htmlFor="is-active" className="text-sm">Active</label>
          </div>
          <Button type="submit" disabled={upsert.isPending}>
            {form.id ? "Update" : "Add"}
          </Button>
          {form.id && (
            <Button size="sm" variant="ghost" onClick={() => setForm({ frequency: "daily", time: "02:00", backup_type: "full", is_active: true, id: undefined })}>Cancel</Button>
          )}
        </form>
        <div>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" /> Loading schedules...
            </div>
          ) : data && data.length === 0 ? (
            <div className="text-sm text-gray-500">No schedules set.</div>
          ) : (
            <div className="space-y-2">
              {data?.map(schedule => (
                <div key={schedule.id} className="border px-3 py-2 rounded flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}</span>{" "}
                    at <span className="font-mono">{schedule.time}</span>,{" "}
                    <span className="capitalize">{schedule.backup_type.replace("_", " ")}</span>{" "}
                    {schedule.is_active ? <span className="text-green-600 ml-1">(active)</span> : <span className="text-gray-400 ml-1">(inactive)</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(schedule.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
