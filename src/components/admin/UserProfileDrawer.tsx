
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAccount } from "@/types/userAccount";

interface UserProfileDrawerProps {
  user: UserAccount | null;
  open: boolean;
  onClose: () => void;
}

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ user, open, onClose }) => {
  if (!user) return null;
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{user.businessName || user.name}</DrawerTitle>
          <DrawerDescription>
            <div className="flex gap-2 items-center mb-2">
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
              <Badge variant="secondary" className="capitalize">{user.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 mb-2">Registered: {user.registeredAt}</p>
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-4 space-y-2">
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">Name:</span> {user.name}
          </div>
          {user.businessName && (
            <div>
              <span className="font-semibold">Business:</span> {user.businessName}
            </div>
          )}
          {/* Placeholders: You may wish to extend details here */}
          {/* e.g. phone, address, etc */}
        </div>
        <div className="px-6 pb-4 flex justify-end">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default UserProfileDrawer;
