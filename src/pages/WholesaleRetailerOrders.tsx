import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import WholesalePharmacyList from "@/components/wholesale/WholesalePharmacyList";
import WholesalePharmacyDetails from "@/components/wholesale/WholesalePharmacyDetails";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';
type PaymentStatus = 'pending' | 'paid' | 'partial';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

interface Pharmacy {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

const STATUS_VALUES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];
const PAYMENT_STATUS_VALUES: PaymentStatus[] = ['pending', 'paid', 'partial'];

const WholesaleRetailerOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'wholesale') {
      navigate('/login');
      return;
    }

    async function fetchRetailersAndOrders() {
      setLoading(true);

      // Fetch all retailers (pharmacies)
      const { data: pharmacyProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, business_name, name, email, phone, address, region, city')
        .eq('role', 'retail')
        .eq('is_approved', true);

      if (profilesError) {
        setPharmacies([]);
        setLoading(false);
        return;
      }

      // Fetch all orders for this wholesaler
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total_amount, status, payment_status, pharmacy_id')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch all order items for these orders
      const orderIds = (orders || []).map(o => o.id);
      let itemsByOrderId: Record<string, OrderItem[]> = {};
      if (orderIds.length > 0) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('id, order_id, product_name, quantity, unit_price')
          .in('order_id', orderIds);

        (orderItems || []).forEach(item => {
          if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
          itemsByOrderId[item.order_id].push({
            id: item.id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.quantity * item.unit_price,
          });
        });
      }

      // Map pharmacies and join in their orders (if any)
      const pharmacyMap: Record<string, Pharmacy> = {};
      (pharmacyProfiles || []).forEach(p => {
        pharmacyMap[p.id] = {
          id: p.id,
          name: p.business_name || p.name || "Retailer",
          contactPerson: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          location: [p.city, p.region, p.address].filter(Boolean).join(", "),
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: "",
          orders: []
        };
      });

      // Organize order list per pharmacy
      (orders || []).forEach(order => {
        if (!order.pharmacy_id || !pharmacyMap[order.pharmacy_id]) return;

        // Strict type handling for status & paymentStatus
        const status: OrderStatus = 
          STATUS_VALUES.includes(order.status as OrderStatus) 
            ? (order.status as OrderStatus) 
            : 'pending';
        const paymentStatus: PaymentStatus = 
          PAYMENT_STATUS_VALUES.includes(order.payment_status as PaymentStatus)
            ? (order.payment_status as PaymentStatus)
            : 'pending';

        const orderObj: Order = {
          id: order.id,
          orderNumber: order.order_number,
          date: order.created_at,
          items: itemsByOrderId[order.id] || [],
          total: Number(order.total_amount),
          status,
          paymentStatus,
        };
        pharmacyMap[order.pharmacy_id].orders.push(orderObj);
      });

      // Calculate stats
      Object.values(pharmacyMap).forEach(pharmacy => {
        pharmacy.totalOrders = pharmacy.orders.length;
        pharmacy.totalSpent = pharmacy.orders.reduce((sum, o) => sum + o.total, 0);
        pharmacy.lastOrderDate = pharmacy.orders.length ? pharmacy.orders[0].date : "";
      });

      setPharmacies(Object.values(pharmacyMap));
      setLoading(false);
    }
    fetchRetailersAndOrders();
  }, [user, navigate]);

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pharmacy.contactPerson && pharmacy.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Retailer Orders</h1>
          <p className="text-gray-600 text-lg">Manage orders from your retail pharmacy partners</p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search pharmacies by name or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WholesalePharmacyList 
              pharmacies={filteredPharmacies}
              selectedPharmacy={selectedPharmacy}
              onSelectPharmacy={setSelectedPharmacy}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-2">
            <WholesalePharmacyDetails pharmacy={selectedPharmacy} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleRetailerOrders;
