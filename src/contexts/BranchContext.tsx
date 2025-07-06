import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { BranchService, type Branch } from '@/services/branchService';

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  loading: boolean;
  error: string;
  refetchBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBranches = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const branchesData = await BranchService.getBranches(user.id);
      setBranches(branchesData);
      
      // Auto-select the first branch if none is selected
      if (branchesData.length > 0 && !selectedBranch) {
        setSelectedBranch(branchesData[0]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [user]);

  const value: BranchContextType = {
    branches,
    selectedBranch,
    setSelectedBranch,
    loading,
    error,
    refetchBranches: fetchBranches,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}; 