import React from 'react';
import BranchInventoryManager from '@/components/BranchInventoryManager';
import { useBranch } from '@/contexts/BranchContext';

export default function RetailBranchInventoryPage() {
  const { selectedBranch } = useBranch();
  return (
    <div className="container mx-auto px-4 py-8">
      <BranchInventoryManager selectedBranch={selectedBranch} />
    </div>
  );
} 