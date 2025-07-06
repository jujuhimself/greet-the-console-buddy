import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { BranchService } from '@/services/branchService';

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (branch: any) => void;
  initialValues?: any;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

const BranchFormDialog: React.FC<BranchFormDialogProps> = ({ open, onOpenChange, onSubmit, initialValues }) => {
  const { user } = useAuth();
  const [name, setName] = useState(initialValues?.name || '');
  const [address, setAddress] = useState(initialValues?.address || '');
  const [phone, setPhone] = useState(initialValues?.phone || '');
  const [type, setType] = useState(initialValues?.type || 'retail');
  const [managerId, setManagerId] = useState(initialValues?.manager_id || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (open) {
      fetchUsers();
      // Reset form when opening for new branch
      if (!initialValues) {
        setName('');
        setAddress('');
        setPhone('');
        setType('retail');
        setManagerId('');
        setError('');
      }
    }
  }, [open, initialValues]);

  const fetchUsers = async () => {
    try {
      if (!user) return;
      const usersData = await BranchService.getUsersForManagerSelection(user.id);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!name.trim()) {
      setError('Branch name is required.');
      setLoading(false);
      return;
    }

    if (!type) {
      setError('Branch type is required.');
      setLoading(false);
      return;
    }

    try {
      const branchData = {
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        type,
        manager_id: managerId === 'none' ? null : managerId,
        updated_at: new Date().toISOString(),
      };

      onSubmit(branchData);
      setLoading(false);
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" aria-describedby="branch-form-description">
        <span id="branch-form-description" className="sr-only">Fill in the branch details. Manager is optional.</span>
        <DialogHeader>
          <DialogTitle>{initialValues ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Branch Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter branch name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Branch Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail Pharmacy</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter branch address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Branch Manager (Optional)</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Manager</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? 'Saving...' : (initialValues ? 'Save Changes' : 'Add Branch')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BranchFormDialog; 