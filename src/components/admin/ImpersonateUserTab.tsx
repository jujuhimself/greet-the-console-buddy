
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, User as UserIcon } from "lucide-react";

const ImpersonateUserTab = () => {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleImpersonate = () => {
    setMessage("This feature is for demonstration. When implemented, you (admin) could temporarily access the platform as another user for troubleshooting.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <ArrowRightLeft className="h-5 w-5 text-gray-500" />
          Impersonate User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center mb-4">
          <Input
            placeholder="User ID to impersonate"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={handleImpersonate}>
            <UserIcon className="h-4 w-4 mr-1" />
            Impersonate
          </Button>
        </div>
        {message && (
          <div className="text-sm text-blue-500 mt-2">{message}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImpersonateUserTab;
