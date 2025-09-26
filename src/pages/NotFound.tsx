import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    const timer = setTimeout(() => navigate('/inventory'), 5000);
    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-blue-100">
        <svg width="120" height="120" fill="none" viewBox="0 0 120 120" className="mx-auto mb-6">
          <circle cx="60" cy="60" r="60" fill="#E0F2FE" />
          <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="48" fill="#38BDF8">404</text>
        </svg>
        <h1 className="text-4xl font-bold mb-2 text-blue-700">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-6">Oops! The page you are looking for does not exist.<br />You will be redirected to Inventory shortly.</p>
        <button
          onClick={() => navigate('/inventory')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg shadow hover:from-blue-700 hover:to-green-600 transition-all duration-200"
        >
          Go to Inventory
        </button>
      </div>
    </div>
  );
};

export default NotFound;
