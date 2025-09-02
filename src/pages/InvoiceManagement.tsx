import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceGenerator } from '@/components/invoice/InvoiceGenerator';
import { InvoiceList } from '@/components/invoice/InvoiceList';

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage your invoices</p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Saved Invoices</TabsTrigger>
          <TabsTrigger value="create">Create New Invoice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <InvoiceList />
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <InvoiceGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}