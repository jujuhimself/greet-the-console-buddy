import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type StaffMember = Database['public']['Tables']['staff_members']['Row'];
type StaffMemberInsert = Database['public']['Tables']['staff_members']['Insert'];

const defaultPermissions = {
  pos: false,
  inventory: false,
  orders: false,
  business_tools: false,
  analytics: false,
  credit_crm: false,
  audit: false,
  alerts: false,
};

const roleTemplates: Record<string, typeof defaultPermissions> = {
  'pos-only': { ...defaultPermissions, pos: true },
  'inventory-only': { ...defaultPermissions, inventory: true },
  'manager': { ...defaultPermissions, pos: true, inventory: true, orders: true, analytics: true },
  'admin': {
    pos: true,
    inventory: true, 
    orders: true,
    business_tools: true,
    analytics: true,
    credit_crm: true,
    audit: true,
    alerts: true
  },
};

const StaffManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'pos-only' as StaffMember['role'],
    permissions: { ...roleTemplates['pos-only'] },
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    setFormData(f => ({ ...f, permissions: { ...roleTemplates[f.role] } }));
    // eslint-disable-next-line
  }, [formData.role]);

  const fetchStaff = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('pharmacy_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staff members",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const staffData: StaffMemberInsert = {
        ...formData,
        pharmacy_id: user.id,
        created_by: user.id,
        is_active: true,
        permissions: formData.permissions,
      };

      if (editingStaff) {
        const { error } = await supabase
          .from('staff_members')
          .update(staffData)
          .eq('id', editingStaff.id);

        if (error) throw error;
        toast({ title: "Staff member updated successfully" });
      } else {
        const { error } = await supabase
          .from('staff_members')
          .insert(staffData);

        if (error) throw error;
        toast({ title: "Staff member added successfully" });
      }

      setFormData({ name: '', email: '', role: 'pos-only', permissions: { ...roleTemplates['pos-only'] } });
      setIsAddDialogOpen(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error: any) {
      console.error('Error saving staff member:', error);
      toast({
        title: "Error",
        description: "Failed to save staff member",
        variant: "destructive",
      });
    }
  };

  const toggleStaffStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ is_active: !currentStatus })
        .eq('id', staffId);

      if (error) throw error;
      
      toast({
        title: `Staff member ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      fetchStaff();
    } catch (error: any) {
      console.error('Error updating staff status:', error);
      toast({
        title: "Error",
        description: "Failed to update staff status",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'pos-only': { variant: 'secondary' as const, label: 'POS Only' },
      'inventory-only': { variant: 'outline' as const, label: 'Inventory Only' },
      'manager': { variant: 'default' as const, label: 'Manager' },
      'admin': { variant: 'destructive' as const, label: 'Admin' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig['pos-only'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const openEditDialog = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      permissions: (typeof staffMember.permissions === 'object' ? staffMember.permissions : { ...roleTemplates['pos-only'] }) as typeof defaultPermissions,
    });
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', role: 'pos-only', permissions: { ...roleTemplates['pos-only'] } });
  };

  const handlePermissionChange = (perm: keyof typeof defaultPermissions, value: boolean) => {
    setFormData(f => ({ ...f, permissions: { ...f.permissions, [perm]: value } }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-gray-600">Manage your pharmacy staff and their permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role Template</Label>
                <Select value={formData.role} onValueChange={(value: StaffMember['role']) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pos-only">POS Only - Can only use point of sale</SelectItem>
                    <SelectItem value="inventory-only">Inventory Only - Can manage products</SelectItem>
                    <SelectItem value="manager">Manager - POS + Inventory + Reports</SelectItem>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.keys(defaultPermissions).map((perm) => (
                    <label key={perm} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions[perm as keyof typeof defaultPermissions]}
                        onChange={e => handlePermissionChange(perm as keyof typeof defaultPermissions, e.target.checked)}
                      />
                      {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingStaff ? 'Update' : 'Add'} Staff Member
                </Button>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Staff Members ({staff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No staff members found. Add your first staff member to get started.
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(member.permissions || {}).filter(([_, v]) => v).map(([k]) => (
                          <Badge key={k} variant="secondary">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStaffStatus(member.id, member.is_active)}
                        >
                          {member.is_active ? (
                            <Trash2 className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;
