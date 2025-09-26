
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReportTemplate } from "@/services/reportingService";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ReportTemplate[];
  onGenerateReport: (opts: { templateId: string; parameters?: Record<string, any> }) => void;
  isLoading?: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onOpenChange, templates, onGenerateReport, isLoading }) => {
  const [selected, setSelected] = React.useState<string | undefined>();
  const [paramInput, setParamInput] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) {
      setSelected(undefined);
      setParamInput("");
    }
  }, [open]);

  const handleGenerate = () => {
    let params: Record<string, any> = {};
    if (paramInput) {
      try {
        params = JSON.parse(paramInput);
      } catch {
        // not valid JSON, ignore for simplicity
      }
    }
    if (selected) {
      onGenerateReport({ templateId: selected, parameters: Object.keys(params).length ? params : undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Automated Report Generation</DialogTitle>
        </DialogHeader>
        <div>
          <label className="block mb-2 font-medium">Select Report Template</label>
          <select
            className="w-full border rounded p-2 mb-4"
            value={selected || ""}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="" disabled>Select a template…</option>
            {templates.map(t => <option value={t.id} key={t.id}>{t.name}</option>)}
          </select>

          <label className="block mb-2 font-medium">Report Parameters (optional, JSON)</label>
          <Input
            placeholder={`{"dateRange":"last30days"}`}
            value={paramInput}
            onChange={e => setParamInput(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={!selected || isLoading}
            onClick={handleGenerate}
          >
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;

