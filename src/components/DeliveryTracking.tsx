
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Package, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; }>;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'failed';
  estimatedDelivery: string;
  actualDelivery?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  trackingUpdates: Array<{
    status: string;
    timestamp: string;
    location: string;
    notes?: string;
  }>;
}

const DeliveryTracking = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);

  useEffect(() => {
    // Load sample delivery orders
    const sampleOrders: DeliveryOrder[] = [
      {
        id: 'DEL-001',
        customerName: 'Grace Pharmacy',
        customerAddress: 'Arusha Main Street, Tanzania',
        customerPhone: '+255987654321',
        items: [
          { name: 'Paracetamol 500mg', quantity: 100 },
          { name: 'Amoxicillin 250mg', quantity: 50 }
        ],
        status: 'in-transit',
        estimatedDelivery: '2024-06-06T14:00:00',
        driverName: 'Hassan Mohamed',
        driverPhone: '+255111222333',
        vehicleNumber: 'T123 ABC',
        trackingUpdates: [
          {
            status: 'Order Confirmed',
            timestamp: '2024-06-05T08:00:00',
            location: 'Warehouse - Dar es Salaam',
            notes: 'Order packed and ready for dispatch'
          },
          {
            status: 'Picked Up',
            timestamp: '2024-06-05T10:30:00',
            location: 'Warehouse - Dar es Salaam',
            notes: 'Driver picked up the package'
          },
          {
            status: 'In Transit',
            timestamp: '2024-06-05T11:00:00',
            location: 'En route to Arusha',
            notes: 'Package is on the way'
          },
          {
            status: 'Rest Stop',
            timestamp: '2024-06-05T16:30:00',
            location: 'Dodoma Service Station',
            notes: 'Driver taking mandatory rest break'
          }
        ]
      },
      {
        id: 'DEL-002',
        customerName: 'Dr. John Mwangi',
        customerAddress: 'Dar es Salaam Medical Center',
        customerPhone: '+255123456789',
        items: [
          { name: 'Insulin Injection', quantity: 20 },
          { name: 'Blood Glucose Strips', quantity: 200 }
        ],
        status: 'out-for-delivery',
        estimatedDelivery: '2024-06-06T11:00:00',
        driverName: 'Fatima Ali',
        driverPhone: '+255444555666',
        vehicleNumber: 'T456 DEF',
        trackingUpdates: [
          {
            status: 'Order Confirmed',
            timestamp: '2024-06-05T09:00:00',
            location: 'Warehouse - Dar es Salaam'
          },
          {
            status: 'Out for Delivery',
            timestamp: '2024-06-06T08:00:00',
            location: 'Dar es Salaam Distribution Center',
            notes: 'Package is out for delivery'
          }
        ]
      },
      {
        id: 'DEL-003',
        customerName: 'Central Hospital',
        customerAddress: 'Dodoma, Tanzania',
        customerPhone: '+255555666777',
        items: [
          { name: 'Surgical Masks', quantity: 1000 },
          { name: 'Hand Sanitizer', quantity: 50 }
        ],
        status: 'delivered',
        estimatedDelivery: '2024-06-04T15:00:00',
        actualDelivery: '2024-06-04T14:30:00',
        driverName: 'Ahmed Hassan',
        driverPhone: '+255777888999',
        vehicleNumber: 'T789 GHI',
        trackingUpdates: [
          {
            status: 'Order Confirmed',
            timestamp: '2024-06-03T10:00:00',
            location: 'Warehouse - Dar es Salaam'
          },
          {
            status: 'Delivered',
            timestamp: '2024-06-04T14:30:00',
            location: 'Central Hospital, Dodoma',
            notes: 'Package delivered and signed by Dr. Mkapa'
          }
        ]
      }
    ];

    setOrders(sampleOrders);
    setSelectedOrder(sampleOrders[0]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'picked-up': return 'bg-blue-500';
      case 'in-transit': return 'bg-purple-500';
      case 'out-for-delivery': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'picked-up': return <Package className="h-4 w-4" />;
      case 'in-transit': return <Truck className="h-4 w-4" />;
      case 'out-for-delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Orders List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Deliveries ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {orders.map(order => (
                <div
                  key={order.id}
                  className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                    selectedOrder?.id === order.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.items.length} items</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    ETA: {new Date(order.estimatedDelivery).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Details */}
      <div className="lg:col-span-2 space-y-6">
        {selectedOrder ? (
          <>
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Delivery Details - {selectedOrder.id}</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white flex items-center gap-1`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{selectedOrder.customerName}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.customerAddress}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mt-4 mb-2">Items ({selectedOrder.items.length})</h4>
                    <div className="space-y-1">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Driver & Vehicle</h3>
                    {selectedOrder.driverName ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{selectedOrder.driverName}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.driverPhone}</p>
                            <p className="text-sm text-gray-600">Vehicle: {selectedOrder.vehicleNumber}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          Contact Driver
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-500">Driver not yet assigned</p>
                    )}

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">Delivery Timeline</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Estimated: {new Date(selectedOrder.estimatedDelivery).toLocaleString()}</p>
                        {selectedOrder.actualDelivery && (
                          <p className="text-green-600 font-medium">
                            Delivered: {new Date(selectedOrder.actualDelivery).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOrder.trackingUpdates.map((update, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        {index < selectedOrder.trackingUpdates.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{update.status}</h4>
                            <p className="text-sm text-gray-600">{update.location}</p>
                            {update.notes && (
                              <p className="text-sm text-gray-500 mt-1">{update.notes}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(update.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Delivery</h3>
              <p className="text-gray-500">Choose a delivery from the list to view tracking details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
