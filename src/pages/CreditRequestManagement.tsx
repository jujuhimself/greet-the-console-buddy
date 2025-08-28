
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { creditRequestService } from '@/services/creditRequestService';
import { useAuth } from '@/contexts/AuthContext';
import { creditService } from '@/services/creditService';

interface CreditRequest {
  id: string;
  user_id: string;
  wholesaler_id?: string;
  business_name: string;
  requested_amount: number;
  business_type: string;
  monthly_revenue: number;
  years_in_business: number;
  credit_purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  documents: string[];
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  review_notes: string | null;
}

const CreditRequestManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchRequests() {
      if (!user) return;
      try {
        const requests = await creditRequestService.getCreditRequestsForWholesaler(user.id);
        setRequests(requests);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch credit requests', variant: 'destructive' });
      }
    }
    fetchRequests();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'under-review': return AlertTriangle;
      case 'approved': return CheckCircle;
      case 'rejected': return AlertTriangle;
      default: return FileText;
    }
  };

  const calculateCreditScore = async (retailerId: string, wholesalerId: string) => {
    // Fetch account
    const accounts = await creditService.fetchAccounts();
    const account = accounts.find(acc => acc.wholesaler_user_id === wholesalerId && acc.retailer_id === retailerId);
    if (!account) return 600; // base score if no account
    // Fetch transactions
    const { data: transactions } = await creditService.fetchTransactions(account.id);
    // Calculate utilization
    const utilization = account.current_balance / account.credit_limit;
    // Payment history: count payments and late payments
    const payments = (transactions || []).filter(tx => tx.transaction_type === 'payment');
    // For demo, assume all payments are on time
    // Account age in months
    const ageMonths = (new Date().getTime() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    // Simple formula: base + payments*10 - utilization*100 + ageMonths*2
    let score = 600 + payments.length * 10 - utilization * 100 + ageMonths * 2;
    score = Math.max(300, Math.min(850, Math.round(score)));
    return score;
  };

  const handleStatusUpdate = async (requestId: string, newStatus: CreditRequest['status']) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    let approvedLimit = approvedAmount;
    if (newStatus === 'approved') {
      // Check if account already exists
      const accounts = await creditService.fetchAccounts();
      const exists = accounts.some(acc => acc.wholesaler_user_id === request.wholesaler_id && acc.retailer_id === request.user_id);
      if (!exists) {
        await creditService.createAccount({
          wholesaler_user_id: request.wholesaler_id!,
          retailer_id: request.user_id,
          credit_limit: approvedLimit,
          current_balance: 0
        });
      }
    }
    // Update request status as before
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: newStatus,
          approvedAmount: newStatus === 'approved' ? approvedLimit : undefined,
          review_notes: reviewNotes || request.review_notes
        };
      }
      return request;
    });
    setRequests(updatedRequests);
    setSelectedRequest(null);
    setReviewNotes("");
    setApprovedAmount(0);
    toast({
      title: "Credit Request Updated",
      description: `Request ${requestId} has been ${newStatus}.`,
    });
  };

  const handleReviewOpen = async (request: CreditRequest) => {
    setSelectedRequest(request);
    setApprovedAmount(request.requested_amount);
    if (request.user_id && request.wholesaler_id) {
      const s = await calculateCreditScore(request.user_id, request.wholesaler_id);
      setScore(s);
    } else {
      setScore(null);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const reviewCount = requests.filter(r => r.status === 'under_review').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalRequested = requests.reduce((sum, r) => sum + r.requested_amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Credit Request Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{reviewCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requested</p>
                <p className="text-2xl font-bold text-primary-600">TZS {totalRequested.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => {
              const StatusIcon = getStatusIcon(request.status);
              return (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <StatusIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{request.business_name}</h3>
                          <p className="text-sm text-gray-600">Request ID: {request.id}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="font-medium">TZS {request.requested_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Purpose:</span>
                            <p className="font-medium">{request.credit_purpose}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <p className="font-medium">{request.status.replace('_', ' ').toUpperCase()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {request.status === 'pending' || request.status === 'under_review' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReviewOpen(request)}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Credit Request - {request.business_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Requested Amount</label>
                                  <p className="text-lg font-semibold">TZS {request.requested_amount.toLocaleString()}</p>
                                </div>
                                {score !== null && (
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Credit Score</label>
                                    <p className="text-lg font-semibold">{score}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Purpose</label>
                                <p>{request.credit_purpose}</p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Approved Amount</label>
                                <Input
                                  type="number"
                                  value={approvedAmount}
                                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                                  placeholder="Enter approved amount"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Review Notes</label>
                                <Textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="Add your review notes..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-3 pt-4">
                                <Button 
                                  onClick={() => handleStatusUpdate(request.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                  variant="destructive"
                                >
                                  Reject
                                </Button>
                                <Button 
                                  onClick={() => handleStatusUpdate(request.id, 'under_review')}
                                  variant="outline"
                                >
                                  Mark Under Review
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : null}
                    </div>
                  </div>
                  {request.review_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {request.review_notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditRequestManagement;
