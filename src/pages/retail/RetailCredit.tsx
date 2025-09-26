
import { useState, useEffect } from "react";
import { creditService, WholesaleCreditAccount } from "@/services/creditService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ExportButton from "@/components/ExportButton";
import DateRangeFilter from "@/components/DateRangeFilter";
import UserSelect from "@/components/UserSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function RetailCredit() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<WholesaleCreditAccount[]>([]);
  const [filtered, setFiltered] = useState<WholesaleCreditAccount[]>([]);
  const [limit, setLimit] = useState("");
  const [retailer_id, setRetailerId] = useState("");
  // filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showTransactionsFor, setShowTransactionsFor] = useState<string | null>(null);

  useEffect(() => {
    creditService.fetchAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    setFiltered(
      accounts.filter(acc => {
        const dateOk = (!from || new Date(acc.created_at) >= new Date(from)) &&
          (!to || new Date(acc.created_at) <= new Date(to));
        const statOk = !status || acc.status === status;
        const userOk = !userId || acc.wholesaler_user_id === userId;
        return dateOk && statOk && userOk;
      })
    );
  }, [accounts, from, to, status, userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !limit || !retailer_id) return;

    try {
      await creditService.createAccount({
        wholesaler_user_id: user.id,
        retailer_id,
        credit_limit: Number(limit),
        current_balance: 0,
      });
      setLimit("");
      setRetailerId("");
      toast({ title: "Credit Account Created" });
      creditService.fetchAccounts().then(setAccounts);
    } catch {
      toast({ title: "Error creating account", variant: "destructive" });
    }
  }

  const fetchTransactions = async (accountId: string) => {
    try {
      const result = await creditService.fetchTransactions(accountId);
      setTransactions(result.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Create Credit/CRM Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Retailer ID"
              value={retailer_id}
              onChange={e => setRetailerId(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Credit Limit"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              min="0"
              required
            />
            <Button type="submit">Create Account</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Accounts (Preview)
            <span className="float-right">
              <ExportButton data={filtered} filename="credit_accounts.csv" disabled={filtered.length === 0} />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            <DateRangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />
            <UserSelect value={userId} onChange={setUserId} user={user} />
            <div>
              <label className="text-sm mr-1">Status:</label>
              <select className="border rounded px-2 py-1 text-sm"
                value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div>No credit accounts.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th>Retailer</th>
                    <th>Limit</th>
                    <th>Used</th>
                    <th>Status</th>
                    <th>Wholesaler</th>
                    <th>Date</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 20).map(acc => (
                    <tr key={acc.id}>
                      <td>{acc.retailer_id}</td>
                      <td>TZS {Number(acc.credit_limit).toLocaleString()}</td>
                      <td>TZS {Number(acc.current_balance).toLocaleString()}</td>
                      <td>{acc.status}</td>
                      <td className="text-blue-800">{acc.wholesaler_user_id}</td>
                      <td>{new Date(acc.created_at).toLocaleString()}</td>
                      <td>{acc.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Accounts Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Credit Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-gray-500">No credit accounts found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Wholesaler</th>
                  <th>Credit Limit</th>
                  <th>Available Credit</th>
                  <th>Current Balance</th>
                  <th>Status</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(acc => (
                  <tr key={acc.id}>
                    <td>{acc.wholesaler_user_id}</td>
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
    </div>
  );
}
