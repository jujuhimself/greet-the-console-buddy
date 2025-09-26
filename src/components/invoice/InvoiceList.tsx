import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Eye, Download, Search, Filter } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  invoice_date: string;
  created_at: string;
  notes: string;
}

interface InvoiceWithItems extends Invoice {
  invoice_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export function InvoiceList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error fetching invoices',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInvoices();
    }
  }, [user?.id]);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Download PDF for invoice
  const downloadInvoicePDF = async (invoiceId: string) => {
    try {
      const { generateInvoicePDF } = await import('@/utils/pdfGenerator');
      
      // Fetch full invoice details with items
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      await generateInvoicePDF(invoice as InvoiceWithItems);
      
      toast({
        title: 'Success',
        description: 'Invoice PDF downloaded successfully.',
      });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error downloading PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return <LoadingState message="Loading invoices..." />;
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center gap-2 text-primary">
          <span role="img" aria-label="Invoices">📄</span>
          Saved Invoices
        </CardTitle>
        <p className="text-sm text-muted-foreground">View and manage your saved invoices</p>
        
        {/* Search and Filter */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by invoice number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No invoices found"
            description={searchTerm || statusFilter !== 'all' 
              ? "No invoices match your search criteria" 
              : "You haven't created any invoices yet"}
          />
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <p><strong>Customer:</strong> {invoice.customer_name}</p>
                    <p><strong>Date:</strong> {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</p>
                    <p><strong>Total:</strong> TZS {invoice.total_amount.toLocaleString()}</p>
                  </div>
                  {invoice.customer_email && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Email:</strong> {invoice.customer_email}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoicePDF(invoice.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}