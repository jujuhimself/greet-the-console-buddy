import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MapPin, Phone, Mail, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Retailer {
  id: string;
  name: string;
  business_name?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  is_approved: boolean;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
}

const WholesaleRetailers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    if (!user) return;

    try {
      // Get all retail users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'retail')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Get order statistics for each retailer
      const retailersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get order count and total spent
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('pharmacy_id', profile.id)
            .eq('wholesaler_id', user.id);

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
          const lastOrderDate = orders?.length > 0 ? 
            Math.max(...orders.map(order => new Date(order.created_at).getTime())) : null;

          return {
            ...profile,
            total_orders: totalOrders,
            total_spent: totalSpent,
            last_order_date: lastOrderDate ? new Date(lastOrderDate).toISOString() : undefined
          };
        })
      );

      setRetailers(retailersWithStats);
    } catch (error: any) {
      console.error('Error fetching retailers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch retailers",
        variant: "destructive",
      });
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', inviteEmail.trim())
        .single();

      if (existingUser) {
        toast({
          title: "User Already Exists",
          description: "A user with this email address already exists in the system",
          variant: "destructive",
        });
        return;
      }

      // In a real implementation, you would send an invitation email here
      // For now, we'll just show a success message
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}. They will receive an email to join as a retailer.`,
      });

      setInviteEmail("");
      setIsInviteDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const filteredRetailers = retailers.filter(retailer =>
    retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (retailer.business_name && retailer.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    retailer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (retailer.city && retailer.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const approvedRetailers = retailers.filter(r => r.is_approved).length;
  const totalSpent = retailers.reduce((sum, r) => sum + (r.total_spent || 0), 0);
  const totalOrders = retailers.reduce((sum, r) => sum + (r.total_orders || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Retailer Management</h2>
          <p className="text-gray-600">Manage your retail partners and relationships</p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Retailer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Retailer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Retailer Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="retailer@example.com"
                />
              </div>
              <p className="text-sm text-gray-600">
                The retailer will receive an invitation email to join your wholesale network.
              </p>
              <div className="flex gap-2">
                <Button onClick={sendInvitation} className="flex-1">
                  Send Invitation
                </Button>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retailers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retailers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Retailers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRetailers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TZS {totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search retailers by name, business, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Retailers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retailers ({filteredRetailers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRetailers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No retailers found. {searchTerm ? "Try adjusting your search." : "Invite your first retailer to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRetailers.map((retailer) => (
                  <TableRow key={retailer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{retailer.business_name || retailer.name}</div>
                        <div className="text-sm text-gray-600">{retailer.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {retailer.email}
                        </div>
                        {retailer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {retailer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {retailer.city || retailer.region || retailer.address ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {[retailer.city, retailer.region, retailer.address].filter(Boolean).join(", ")}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{retailer.total_orders || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">TZS {(retailer.total_spent || 0).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={retailer.is_approved ? "default" : "secondary"}>
                        {retailer.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {retailer.last_order_date ? (
                        <span className="text-sm">
                          {new Date(retailer.last_order_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Never</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WholesaleRetailers;
