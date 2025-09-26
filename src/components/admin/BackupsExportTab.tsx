
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Repeat2 } from "lucide-react";

const BackupsExportTab = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex gap-2 items-center">
        <Repeat2 className="h-5 w-5 text-blue-600" />
        Platform Backups & Export
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Data
          </Button>
          <span className="text-sm text-gray-700">Export platform data as CSV or JSON</span>
        </div>
        <div className="flex gap-4 items-center mt-2">
          <Button variant="secondary" size="sm">
            <Repeat2 className="h-4 w-4 mr-1" />
            Run Backup
          </Button>
          <span className="text-sm text-gray-700">Trigger a backup of all key platform data</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default BackupsExportTab;
