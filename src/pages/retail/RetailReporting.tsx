
import React, { useMemo, useState } from "react";
import { useReportTemplates, useGeneratedReports, useGenerateReport } from "@/hooks/useReporting";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReportModal from "@/components/ReportModal";
import { Button } from "@/components/ui/button";
import ExportButton from "@/components/ExportButton";
import DateRangeFilter from "@/components/DateRangeFilter";

export default function RetailReporting() {
  const { data: templates = [], isLoading: loadingTemplates } = useReportTemplates();
  const { data: reports = [], isLoading: loadingReports } = useGeneratedReports();
  const generateReport = useGenerateReport();
  const [open, setOpen] = useState(false);

  // Filters for downloaded reports
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = useMemo(() =>
    reports.filter(r => {
      const dateOk = (!from || new Date(r.created_at) >= new Date(from)) &&
        (!to || new Date(r.created_at) <= new Date(to));
      return dateOk;
    }), [reports, from, to]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Automated Report Generation (Preview)</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)} disabled={loadingTemplates || templates.length === 0}>
            Generate Report
          </Button>
          <ReportModal
            open={open}
            onOpenChange={setOpen}
            templates={templates}
            onGenerateReport={(opts) => generateReport.mutate(opts)}
            isLoading={generateReport.isPending}
          />
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Generated Reports
            <span className="float-right">
              <ExportButton data={filtered} filename="generated_reports.csv" disabled={filtered.length === 0} />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap mb-2">
            <DateRangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />
          </div>
          {loadingReports ? (
            <div>Loading…</div>
          ) : filtered.length === 0 ? (
            <div>No generated reports yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Format</th>
                    <th>Parameters</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 20).map(r => (
                    <tr key={r.id}>
                      <td>{r.file_path}</td>
                      <td className="capitalize">{r.status}</td>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                      <td>{r.file_format}</td>
                      <td className="break-all">{r.parameters ? JSON.stringify(r.parameters) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
