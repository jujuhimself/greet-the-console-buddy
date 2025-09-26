
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePurchaseOrder, useSuppliers } from "@/hooks/useInventory";
import { Loader2, Calendar } from "lucide-react";

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePurchaseOrderDialog = ({ open, onOpenChange }: CreatePurchaseOrderDialogProps) => {
  const [formData, setFormData] = useState({
    po_number: `PO-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    total_amount: 0,
    notes: '',
    status: 'pending' as const
  });

  const { data: suppliers = [] } = useSuppliers();
  const createPurchaseOrder = useCreatePurchaseOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        supplier_id: formData.supplier_id || undefined,
        expected_delivery: formData.expected_delivery || undefined
      };
      await createPurchaseOrder.mutateAsync(submitData);
      onOpenChange(false);
      // Reset form
      setFormData({
        po_number: `PO-${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        total_amount: 0,
        notes: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="po_number">PO Number *</Label>
              <Input
                id="po_number"
                value={formData.po_number}
                onChange={(e) => handleChange('po_number', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select 
                value={formData.supplier_id} 
                onValueChange={(value) => handleChange('supplier_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order_date">Order Date *</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => handleChange('order_date', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="expected_delivery">Expected Delivery</Label>
              <Input
                id="expected_delivery"
                type="date"
                value={formData.expected_delivery}
                onChange={(e) => handleChange('expected_delivery', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total_amount">Total Amount (TZS)</Label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.total_amount}
              onChange={(e) => handleChange('total_amount', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Any special instructions or notes..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPurchaseOrder.isPending || !formData.po_number.trim()}
            >
              {createPurchaseOrder.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Purchase Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePurchaseOrderDialog;
