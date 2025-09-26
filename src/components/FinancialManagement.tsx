import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { financialService, FinancialTransaction, FinancialSummary } from "@/services/financialService";

const FinancialManagement = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [transactionsData, summaryData] = await Promise.all([
          financialService.getTransactions(user.id),
          financialService.getFinancialSummary(user.id)
        ]);
        
        setTransactions(transactionsData);
        setFinancialSummary(summaryData);
      } catch (error) {
        toast({
          title: "Error loading financial data",
          description: "Could not fetch financial information from database.",
          variant: "destructive"
        });
      }
      setLoading(false);
    };

    fetchFinancialData();
  }, [user]);

  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.category || !user) return;
    
    setAddingTransaction(true);
    try {
      const transaction = await financialService.addTransaction({
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        description: newTransaction.description,
        transaction_date: newTransaction.transaction_date
      });

      if (transaction) {
        setTransactions(prev => [transaction, ...prev]);
        
        // Refresh summary
        const summary = await financialService.getFinancialSummary(user.id);
        setFinancialSummary(summary);
        
        toast({
          title: "Transaction Added",
          description: `${newTransaction.type} of TZS ${parseFloat(newTransaction.amount).toLocaleString()} added successfully.`,
        });
        
        // Reset form
        setNewTransaction({
          type: 'income',
          amount: '',
          category: '',
          description: '',
          transaction_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      toast({
        title: "Error adding transaction",
        description: "Could not add transaction to database.",
        variant: "destructive"
      });
    }
    setAddingTransaction(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading financial data...</span>
        </div>
      </div>
    );
  }

  const totalIncome = financialSummary?.totalIncome || 0;
  const totalExpenses = financialSummary?.totalExpenses || 0;
  const profit = financialSummary?.netProfit || 0;
  const monthlyData = financialSummary?.monthlyData || [];
  const categoryBreakdown = financialSummary?.categoryBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              <span className="text-2xl font-bold">TZS {totalIncome.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              <span className="text-2xl font-bold">TZS {totalExpenses.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${profit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Net Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              <span className="text-2xl font-bold">TZS {profit.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `TZS ${Number(value).toLocaleString()}`} />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Monthly financial data will appear here once you add transactions.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `TZS ${Number(value).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Expense categories will appear here once you add expense transactions.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') => 
              setNewTransaction(prev => ({ ...prev, type: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Amount"
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
            />

            <Input
              placeholder="Category"
              value={newTransaction.category}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
            />

            <Input
              placeholder="Description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
            />

            <Button onClick={addTransaction} disabled={addingTransaction}>
              {addingTransaction ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {addingTransaction ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 10).map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                        {transaction.type}
                      </Badge>
                      <span className="font-medium">{transaction.category}</span>
                    </div>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}TZS {transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No transactions found. Add your first transaction to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialManagement;
