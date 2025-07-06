import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BranchService, type Branch, type CreateBranchData, type UpdateBranchData } from '@/services/branchService';

export const useBranches = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBranches = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const branchesData = await BranchService.getBranches(user.id);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError('Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addBranch = async (branchData: CreateBranchData) => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await BranchService.createBranch(branchData, user.id);
      await fetchBranches();
    } catch (error) {
      console.error('Error adding branch:', error);
      setError('Failed to add branch. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBranch = async (branchId: string, branchData: UpdateBranchData) => {
    setLoading(true);
    setError('');
    
    try {
      await BranchService.updateBranch(branchId, branchData);
      await fetchBranches();
    } catch (error) {
      console.error('Error updating branch:', error);
      setError('Failed to update branch. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBranch = async (branchId: string) => {
    setLoading(true);
    setError('');
    
    try {
      await BranchService.deleteBranch(branchId);
      await fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      setError('Failed to delete branch. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [user]);

  return {
    branches,
    loading,
    error,
    addBranch,
    updateBranch,
    deleteBranch,
    refetch: fetchBranches,
  };
}; 