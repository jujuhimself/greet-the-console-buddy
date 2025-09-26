
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Edit, Phone, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSuppliers, useCreateSupplier } from "@/hooks/useInventory";

interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SupplierManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: suppliers = [], refetch: refetchSuppliers } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    payment_terms: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupplier) {
      // Update existing supplier
      try {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierForm)
          .eq('id', editingSupplier.id);

        if (error) throw error;

        toast({ title: "Supplier updated successfully" });
        refetchSuppliers();
      } catch (error: any) {
        console.error('Error updating supplier:', error);
        toast({
          title: "Error",
          description: "Failed to update supplier",
          variant: "destructive",
        });
      }
    } else {
      // Create new supplier
      createSupplierMutation.mutate({
        ...supplierForm,
        is_active: true
      });
    }

    closeDialog();
  };

  const toggleSupplierStatus = async (supplierId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: !currentStatus })
        .eq('id', supplierId);

      if (error) throw error;

      toast({
        title: `Supplier ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      refetchSuppliers();
    } catch (error: any) {
      console.error('Error updating supplier status:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier status",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      payment_terms: supplier.payment_terms || ''
    });
    setIsSupplierDialogOpen(true);
  };

  const closeDialog = () => {
    setIsSupplierDialogOpen(false);
    setEditingSupplier(null);
    setSupplierForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      payment_terms: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-gray-600">Manage your pharmaceutical suppliers and relationships</p>
        </div>
        <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={supplierForm.contact_person}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={supplierForm.payment_terms}
                  onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
                  placeholder="e.g., Net 30 days"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={createSupplierMutation.isPending}>
                  {editingSupplier ? 'Update' : 'Add'} Supplier
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
            <Building className="h-5 w-5" />
            Suppliers ({suppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No suppliers found. Add your first supplier to get started.
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        {supplier.address && (
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {supplier.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.contact_person || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.email && (
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.payment_terms || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.is_active ? "default" : "secondary"}>
                        {supplier.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSupplierStatus(supplier.id, supplier.is_active)}
                        >
                          {supplier.is_active ? 'Deactivate' : 'Activate'}
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

export default SupplierManagement;
