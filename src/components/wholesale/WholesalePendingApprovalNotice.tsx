
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";

interface PendingApprovalNoticeProps {
  logout: () => void;
}

const WholesalePendingApprovalNotice = ({ logout }: PendingApprovalNoticeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Account Pending Approval
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Your wholesale account is currently under review. Our team will verify your 
              business credentials and approve your account within 2-3 business days.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li>• We'll verify your business license and credentials</li>
                <li>• Our team will contact you if additional information is needed</li>
                <li>• You'll receive an email notification once approved</li>
                <li>• Full platform access will be granted immediately upon approval</li>
              </ul>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={logout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WholesalePendingApprovalNotice;
