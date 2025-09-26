import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Phone, Mail, MessageCircle, Calendar, Search, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { customerService, Customer, CustomerCommunication } from "@/services/customerService";

const CustomerRelationshipManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingCommunication, setAddingCommunication] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    business_type: '',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [newCommunication, setNewCommunication] = useState({
    type: 'call' as 'call' | 'email' | 'sms' | 'meeting',
    subject: '',
    notes: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [customersData, communicationsData] = await Promise.all([
          customerService.getCustomers(user.id),
          customerService.getCommunications(user.id)
        ]);
        
        setCustomers(customersData);
        setCommunications(communicationsData);
      } catch (error: any) {
        console.error('Error fetching customer data:', error);
        if (error.message?.includes('Database tables not set up')) {
          toast({
            title: "Database Setup Required",
            description: "The customer management tables need to be created. Please contact support or run the database migration.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error loading customers",
            description: "Could not load customer data. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user]);

  // Search functionality
  useEffect(() => {
    const searchCustomers = async () => {
      if (!user || !searchTerm.trim()) {
        const allCustomers = await customerService.getCustomers(user?.id || '');
        setCustomers(allCustomers);
        return;
      }

      try {
        const searchResults = await customerService.searchCustomers(user.id, searchTerm);
        setCustomers(searchResults);
      } catch (error) {
        console.error('Error searching customers:', error);
      }
    };

    const debounceTimer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, user]);

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !user) return;

    setAddingCustomer(true);
    try {
      const customer = await customerService.addCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        business_type: newCustomer.business_type,
        notes: newCustomer.notes,
        status: newCustomer.status,
        total_orders: 0,
        total_spent: 0
      });

      if (customer) {
        setCustomers(prev => [customer, ...prev]);
        
        toast({
          title: "Customer Added",
          description: `${newCustomer.name} has been added successfully.`,
        });
        
        // Reset form
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          address: '',
          business_type: '',
          notes: '',
          status: 'active'
        });
        
        setShowAddCustomerDialog(false);
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
      if (error.message?.includes('Database tables not set up')) {
        toast({
          title: "Database Setup Required",
          description: "The customer management tables need to be created. Please contact support or run the database migration.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error adding customer",
          description: error.message || "Could not add customer to database.",
          variant: "destructive"
        });
      }
    }
    setAddingCustomer(false);
  };

  const addCommunication = async () => {
    if (!selectedCustomer || !newCommunication.subject || !user) return;

    setAddingCommunication(true);
    try {
      const communication = await customerService.addCommunication({
        customer_id: selectedCustomer.id,
        type: newCommunication.type,
        subject: newCommunication.subject,
        notes: newCommunication.notes,
        communication_date: new Date().toISOString().split('T')[0]
      });

      if (communication) {
        setCommunications(prev => [communication, ...prev]);
        
        toast({
          title: "Communication Logged",
          description: "Customer interaction has been recorded successfully.",
        });
        
        setNewCommunication({ type: 'call', subject: '', notes: '' });
      }
    } catch (error: any) {
      console.error('Error adding communication:', error);
      if (error.message?.includes('Database tables not set up')) {
        toast({
          title: "Database Setup Required",
          description: "The customer management tables need to be created. Please contact support or run the database migration.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error logging communication",
          description: error.message || "Could not save communication to database.",
          variant: "destructive"
        });
      }
    }
    setAddingCommunication(false);
  };

  const customerCommunications = communications.filter(c => c.customer_id === selectedCustomer?.id);

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageCircle className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer data...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Customer List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customers ({customers.length})
              </CardTitle>
              <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="name">Name *</label>
                      <Input
                        id="name"
                        placeholder="Customer name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="email">Email *</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="phone">Phone</label>
                      <Input
                        id="phone"
                        placeholder="+255123456789"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="address">Address</label>
                      <Textarea
                        id="address"
                        placeholder="Customer address"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="business_type">Business Type</label>
                      <Select value={newCustomer.business_type} onValueChange={(value) => 
                        setNewCustomer(prev => ({ ...prev, business_type: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="clinic">Clinic</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="notes">Notes</label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes about the customer"
                        value={newCustomer.notes}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="status">Status</label>
                      <Select value={newCustomer.status} onValueChange={(value: 'active' | 'inactive') => 
                        setNewCustomer(prev => ({ ...prev, status: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCustomer} disabled={addingCustomer || !newCustomer.name || !newCustomer.email}>
                      {addingCustomer ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {addingCustomer ? 'Adding...' : 'Add Customer'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {customers.length > 0 ? (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {customers.map(customer => (
                  <div
                    key={customer.id}
                    className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                      selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {customer.total_orders} orders • TZS {customer.total_spent.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{searchTerm ? 'No customers found matching your search.' : 'No customers found. Add your first customer to get started.'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Details and Communications */}
      <div className="lg:col-span-2 space-y-6">
        {selectedCustomer ? (
          <>
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedCustomer.name}</h3>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                      <p className="text-gray-600">{selectedCustomer.address}</p>
                      {selectedCustomer.business_type && (
                        <p className="text-sm text-gray-500">Business: {selectedCustomer.business_type}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedCustomer.total_orders}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          TZS {selectedCustomer.total_spent.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                      </div>
                    </div>
                    {selectedCustomer.last_order_date && (
                      <div className="text-sm text-gray-600">
                        Last Order: {new Date(selectedCustomer.last_order_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                {selectedCustomer.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium">Notes:</h4>
                    <p className="text-sm text-gray-600">{selectedCustomer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Communication History */}
            <Card>
              <CardHeader>
                <CardTitle>Communication History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add New Communication */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Log New Communication</h4>
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <select
                        className="border rounded px-3 py-2"
                        value={newCommunication.type}
                        onChange={(e) => setNewCommunication(prev => ({ 
                          ...prev, 
                          type: e.target.value as 'call' | 'email' | 'sms' | 'meeting' 
                        }))}
                      >
                        <option value="call">Phone Call</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="meeting">Meeting</option>
                      </select>
                      <Input
                        placeholder="Subject"
                        value={newCommunication.subject}
                        onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>
                    <Textarea
                      placeholder="Notes"
                      value={newCommunication.notes}
                      onChange={(e) => setNewCommunication(prev => ({ ...prev, notes: e.target.value }))}
                      className="mb-3"
                    />
                    <Button onClick={addCommunication} disabled={addingCommunication}>
                      {addingCommunication ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MessageCircle className="h-4 w-4 mr-2" />
                      )}
                      {addingCommunication ? 'Logging...' : 'Log Communication'}
                    </Button>
                  </div>

                  {/* Communication List */}
                  <div className="space-y-3">
                    {customerCommunications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No communications recorded yet for this customer.</p>
                      </div>
                    ) : (
                      customerCommunications.map(comm => (
                        <div key={comm.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getCommunicationIcon(comm.type)}
                            <span className="font-medium capitalize">{comm.type}</span>
                            <Badge variant="outline">{new Date(comm.communication_date).toLocaleDateString()}</Badge>
                          </div>
                          <h4 className="font-medium">{comm.subject}</h4>
                          {comm.notes && <p className="text-sm text-gray-600 mt-1">{comm.notes}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {customers.length > 0 ? 'Select a Customer' : 'No Customers Found'}
              </h3>
              <p className="text-gray-500">
                {customers.length > 0 
                  ? 'Choose a customer from the list to view details and communication history'
                  : 'Add your first customer to start managing customer relationships'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerRelationshipManagement;
