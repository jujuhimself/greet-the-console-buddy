
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import PrescriptionHistoryItem from "./PrescriptionHistoryItem";

export interface PrescriptionFile {
  id: string;
  fileName: string;
  uploadDate: string;
  doctorName: string;
  notes: string;
  filePath: string;
  viewUrl: string;
  status: string;
  pharmacyName?: string;
}

interface PrescriptionHistoryListProps {
  prescriptions: PrescriptionFile[];
  onDelete: (filePath: string) => void;
}

const PrescriptionHistoryList = ({ prescriptions, onDelete }: PrescriptionHistoryListProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Your Prescriptions</CardTitle>
    </CardHeader>
    <CardContent>
      {prescriptions.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No prescriptions uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionHistoryItem
              key={prescription.filePath}
              prescription={prescription}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default PrescriptionHistoryList;
