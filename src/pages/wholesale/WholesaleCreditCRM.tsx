import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, DollarSign, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { creditService } from '@/services/creditService';

interface CreditAccount {
  id: string;
  retailer_id: string;
  credit_limit: number;
  current_balance: number;
  status: string;
  created_at: string;
  retailer_name?: string;
  retailer_email?: string;
}

interface CreditTransaction {
  id: string;
  credit_account_id: string;
  transaction_type: string;
  amount: number;
  reference?: string;
  transaction_date: string;
}

const WholesaleCreditCRM = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null);
  const [accountForm, setAccountForm] = useState({
    retailer_id: '',
    credit_limit: 0
  });
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: 'payment',
    amount: 0,
    reference: ''
  });
  const [showTransactionsFor, setShowTransactionsFor] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditAccounts();
    fetchRetailers();
  }, []);

  const fetchCreditAccounts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wholesale_credit_accounts')
        .select('*')
        .eq('wholesaler_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch retailer details
      const accountsWithRetailers = await Promise.all(
        (data || []).map(async (account) => {
          const { data: retailer } = await supabase
            .from('profiles')
            .select('name, email, business_name')
            .eq('id', account.retailer_id)
            .single();

          return {
            ...account,
            retailer_name: retailer?.business_name || retailer?.name || 'Unknown',
            retailer_email: retailer?.email || ''
          };
        })
      );

      setAccounts(accountsWithRetailers);
    } catch (error: any) {
      console.error('Error fetching credit accounts:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch credit accounts",
        variant: "destructive",
      });
    }
  };

  const fetchRetailers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, business_name, email')
        .eq('role', 'retail')
        .eq('is_approved', true);

      if (error) throw error;
      setRetailers(data || []);
    } catch (error: any) {
      console.error('Error fetching retailers:', error);
    }
  };

  const fetchTransactions = async (accountId: string) => {
    try {
      const result = await creditService.fetchTransactions(accountId);
      setTransactions(result.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const createCreditAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wholesale_credit_accounts')
        .insert({
          wholesaler_user_id: user.id,
          retailer_id: accountForm.retailer_id,
          credit_limit: accountForm.credit_limit,
          current_balance: 0,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Credit Account Created",
        description: "New credit account created successfully",
      });

      setAccountForm({ retailer_id: '', credit_limit: 0 });
      setIsAccountDialogOpen(false);
      fetchCreditAccounts();
    } catch (error: any) {
      console.error('Error creating credit account:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create credit account",
        variant: "destructive",
      });
    }
  };

  const createTransaction = async () => {
    if (!selectedAccount) return;

    try {
      const { error: transactionError } = await supabase
        .from('wholesale_credit_transactions')
        .insert({
          credit_account_id: selectedAccount.id,
          transaction_type: transactionForm.transaction_type,
          amount: transactionForm.amount,
          reference: transactionForm.reference,
          transaction_date: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      // Update account balance
      let newBalance = selectedAccount.current_balance;
      if (transactionForm.transaction_type === 'credit') {
        newBalance += transactionForm.amount;
      } else if (transactionForm.transaction_type === 'payment') {
        newBalance -= transactionForm.amount;
      }

      const { error: updateError } = await supabase
        .from('wholesale_credit_accounts')
        .update({ current_balance: newBalance })
        .eq('id', selectedAccount.id);

      if (updateError) throw updateError;

      toast({
        title: "Transaction Recorded",
        description: `${transactionForm.transaction_type} transaction recorded successfully`,
      });

      setTransactionForm({ transaction_type: 'payment', amount: 0, reference: '' });
      setIsTransactionDialogOpen(false);
      fetchCreditAccounts();
      fetchTransactions(selectedAccount.id);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to record transaction",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { variant: 'default' as const, label: 'Active' },
      'suspended': { variant: 'destructive' as const, label: 'Suspended' },
      'inactive': { variant: 'secondary' as const, label: 'Inactive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['active'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalCreditExtended = accounts.reduce((sum, account) => sum + account.credit_limit, 0);
  const totalOutstanding = accounts.reduce((sum, account) => sum + account.current_balance, 0);
  const activeAccounts = accounts.filter(account => account.status === 'active').length;

  return (
    <div className="container mx-auto px-4 py-8 w-full max-w-7xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Credit & CRM Management</h2>
          <p className="text-gray-600">Manage retailer credit accounts and relationships</p>
        </div>
        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Credit Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Credit Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Retailer</Label>
                <Select value={accountForm.retailer_id} onValueChange={(value) => setAccountForm({...accountForm, retailer_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose retailer" />
                  </SelectTrigger>
                  <SelectContent>
                    {retailers.map((retailer) => (
                      <SelectItem key={retailer.id} value={retailer.id}>
                        {retailer.business_name || retailer.name} ({retailer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit Limit (TZS)</Label>
                <Input
                  type="number"
                  value={accountForm.credit_limit}
                  onChange={(e) => setAccountForm({...accountForm, credit_limit: Number(e.target.value)})}
                  placeholder="Enter credit limit"
                />
              </div>
              <Button onClick={createCreditAccount} className="w-full">
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Extended</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {totalCreditExtended.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">TZS {totalOutstanding.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">TZS {(totalCreditExtended - totalOutstanding).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Accounts Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Retailer Credit Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-gray-500">No credit accounts found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Retailer</th>
                  <th>Credit Limit</th>
                  <th>Available Credit</th>
                  <th>Current Balance</th>
                  <th>Status</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id}>
                    <td>{acc.retailer_name}</td>
                    <td>TZS {acc.credit_limit.toLocaleString()}</td>
                    <td className="text-green-700">TZS {(acc.credit_limit - acc.current_balance).toLocaleString()}</td>
                    <td className="text-red-700">TZS {acc.current_balance.toLocaleString()}</td>
                    <td>{acc.status}</td>
                    <td>
                      <Dialog open={showTransactionsFor === acc.id} onOpenChange={open => setShowTransactionsFor(open ? acc.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => fetchTransactions(acc.id)}>
                            View History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg w-full">
                          <DialogHeader>
                            <DialogTitle>Credit History</DialogTitle>
                          </DialogHeader>
                          {transactions.length === 0 ? (
                            <p className="text-gray-500">No transactions found.</p>
                          ) : (
                            <table className="w-full text-xs">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Type</th>
                                  <th>Amount</th>
                                  <th>Reference</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions.map(tx => (
                                  <tr key={tx.id}>
                                    <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                    <td>{tx.transaction_type}</td>
                                    <td>TZS {tx.amount.toLocaleString()}</td>
                                    <td>{tx.reference || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Record Transaction - {selectedAccount?.retailer_name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">New Transaction</h3>
              <div>
                <Label>Transaction Type</Label>
                <Select value={transactionForm.transaction_type} onValueChange={(value) => setTransactionForm({...transactionForm, transaction_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (Loan/Sale)</SelectItem>
                    <SelectItem value="payment">Payment (Repayment)</SelectItem>
                    <SelectItem value="debit">Debit (Charge/Fee)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (TZS)</Label>
                <Input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({...transactionForm, amount: Number(e.target.value)})}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label>Reference (Optional)</Label>
                <Input
                  value={transactionForm.reference}
                  onChange={(e) => setTransactionForm({...transactionForm, reference: e.target.value})}
                  placeholder="Invoice number, payment reference, etc."
                />
              </div>
              <Button onClick={createTransaction} className="w-full">
                Record Transaction
              </Button>
            </div>
            <div>
              <h3 className="font-medium mb-4">Transaction History</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant={transaction.transaction_type === 'payment' ? 'default' : 'secondary'}>
                          {transaction.transaction_type}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                        {transaction.reference && (
                          <p className="text-sm text-gray-600">Ref: {transaction.reference}</p>
                        )}
                      </div>
                      <span className={`font-medium ${transaction.transaction_type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.transaction_type === 'payment' ? '-' : '+'}TZS {transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WholesaleCreditCRM;
