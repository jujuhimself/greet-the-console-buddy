
import PageHeader from "@/components/PageHeader";

const MyOrders = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="My Orders"
          description="View your order history"
        />
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">Your order history will be displayed here soon.</p>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
