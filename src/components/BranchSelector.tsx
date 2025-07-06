import React, { useEffect, useRef, useState } from 'react';
import { useBranch } from '@/contexts/BranchContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const BranchSelector: React.FC = () => {
  const { branches, selectedBranch, setSelectedBranch, loading, error } = useBranch();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Loading branches...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-red-200">
        <CardContent className="py-4">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (branches.length === 0) {
    return (
      <Card className="mb-6 border-yellow-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              No branches found. Contact your administrator to add branches.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (branches.length === 1) {
    const branch = branches[0];
    return (
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">{branch.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={branch.type === 'retail' ? 'default' : 'secondary'}>
                    {branch.type === 'retail' ? 'Retail Pharmacy' : 'Wholesale'}
                  </Badge>
                  {branch.address && (
                    <span className="text-sm text-gray-500">{branch.address}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed top-6 right-8 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-all focus:outline-none"
        aria-label="Switch Branch"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 3v18m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="fixed top-24 right-8 z-50 bg-white rounded-xl shadow-xl w-72 p-4 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">Switch Branch</h4>
          <ul className="space-y-2">
            {branches.map((branch) => (
              <li key={branch.id}>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 transition ${selectedBranch?.id === branch.id ? 'bg-blue-100 font-bold' : ''}`}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{branch.name}</span>
                    <Badge variant={branch.type === 'retail' ? 'default' : 'secondary'} className="text-xs">
                      {branch.type === 'retail' ? 'Retail' : 'Wholesale'}
                    </Badge>
                  </div>
                  {branch.address && (
                    <div className="text-xs text-gray-500">{branch.address}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default BranchSelector; 