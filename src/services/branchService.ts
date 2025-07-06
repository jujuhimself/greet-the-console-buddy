import { supabase } from '@/integrations/supabase/client';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  type: string;
  manager_id?: string;
  manager_name?: string;
  manager_email?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateBranchData {
  name: string;
  address?: string;
  phone?: string;
  type: string;
  manager_id?: string;
}

export interface UpdateBranchData extends CreateBranchData {
  updated_at?: string;
}

export class BranchService {
  static async getBranches(parentId: string): Promise<Branch[]> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch manager details separately if needed
      const branchesWithManagers = await Promise.all(
        (data || []).map(async (branch) => {
          if (branch.manager_id) {
            try {
              const { data: managerData } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', branch.manager_id)
                .single();

              return {
                ...branch,
                manager_name: managerData?.full_name,
                manager_email: managerData?.email,
              };
            } catch (error) {
              console.error('Error fetching manager details:', error);
              return branch;
            }
          }
          return branch;
        })
      );

      return branchesWithManagers;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw new Error('Failed to fetch branches');
    }
  }

  static async createBranch(branchData: CreateBranchData, userId: string): Promise<void> {
    try {
      // Generate a simple code from the branch name
      const code = branchData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 10);
      
      const payload = {
        name: branchData.name,
        type: branchData.type,
        code: code,
        address: branchData.address || null,
        phone: branchData.phone || null,
        manager_id: branchData.manager_id || null,
        parent_id: userId,
        created_at: new Date().toISOString(),
      };
      console.log('Inserting branch:', payload);
      const { error } = await supabase.from('branches').insert(payload);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw new Error('Failed to create branch');
    }
  }

  static async updateBranch(branchId: string, branchData: UpdateBranchData): Promise<void> {
    try {
      const { error } = await supabase
        .from('branches')
        .update({
          ...branchData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', branchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating branch:', error);
      throw new Error('Failed to update branch');
    }
  }

  static async deleteBranch(branchId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw new Error('Failed to delete branch');
    }
  }

  static async getUsersForManagerSelection(excludeUserId: string): Promise<Array<{id: string, email: string, full_name?: string, role: string}>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .in('role', ['retail', 'wholesale'])
        .neq('id', excludeUserId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users for manager selection:', error);
      throw new Error('Failed to fetch users');
    }
  }

  static async getBranchById(branchId: string): Promise<Branch | null> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Fetch manager details if needed
      if (data.manager_id) {
        try {
          const { data: managerData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', data.manager_id)
            .single();

          return {
            ...data,
            manager_name: managerData?.full_name,
            manager_email: managerData?.email,
          };
        } catch (error) {
          console.error('Error fetching manager details:', error);
          return data;
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw new Error('Failed to fetch branch');
    }
  }
} 