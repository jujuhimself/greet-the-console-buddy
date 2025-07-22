
import { supabase } from '@/integrations/supabase/client';

export interface WholesaleCreditAccount {
  id: string;
  wholesaler_user_id: string;
  retailer_id: string;
  credit_limit: number;
  current_balance: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface WholesaleCreditTransaction {
  id: string;
  credit_account_id: string;
  transaction_type: 'credit' | 'debit' | 'payment';
  amount: number;
  reference?: string;
  transaction_date: string;
  created_at: string;
}

class CreditService {
  async createAccount(account: Omit<WholesaleCreditAccount, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase
      .from('wholesale_credit_accounts')
      .insert({
        ...account,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async fetchAccounts(): Promise<WholesaleCreditAccount[]> {
    const { data, error } = await supabase
      .from('wholesale_credit_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Cast the data to match our interface types
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'active' | 'inactive' | 'suspended'
    }));
  }

  async updateAccountBalance(accountId: string, newBalance: number) {
    const { data, error } = await supabase
      .from('wholesale_credit_accounts')
      .update({ current_balance: newBalance })
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createTransaction(transaction: Omit<WholesaleCreditTransaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('wholesale_credit_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async fetchTransactions(accountId: string) {
    const { data, error } = await supabase
      .from('wholesale_credit_transactions')
      .select('*')
      .eq('credit_account_id', accountId)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return { data };
  }
}

export const creditService = new CreditService();
