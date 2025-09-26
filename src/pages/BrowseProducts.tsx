
import PageHeader from "@/components/PageHeader";

const BrowseProducts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Browse Products"
          description="Find and order medicines and other products"
        />
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">Product catalog will be displayed here soon.</p>
        </div>
      </div>
    </div>
  );
};

export default BrowseProducts;
