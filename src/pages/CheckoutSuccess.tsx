import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Order Success Page for /checkout-success
const CheckoutSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  let redirectPath = '/catalog';
  let buttonText = 'Go to Catalog';
  let message = 'Your order was successful. You will be redirected to your Catalog page shortly.';
  if (user?.role === 'retail') {
    redirectPath = '/pharmacy';
    buttonText = 'Go to Pharmacy Dashboard';
    message = 'Your order was successful. You will be redirected to your Pharmacy Dashboard shortly.';
  } else if (user?.role === 'wholesale') {
    redirectPath = '/inventory-dashboard';
    buttonText = 'Go to Inventory Dashboard';
    message = 'Your order was successful. You will be redirected to your Inventory Dashboard shortly.';
  }
  useEffect(() => {
    const timer = setTimeout(() => navigate(redirectPath), 6000);
    return () => clearTimeout(timer);
  }, [navigate, redirectPath]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-green-100">
        <svg className="mx-auto mb-6" width="100" height="100" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="#D1FAE5" />
          <path d="M30 52l15 15 25-30" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <h1 className="text-3xl font-bold mb-2 text-green-700">Thank you for your purchase!</h1>
        <p className="text-lg text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => navigate(redirectPath)}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-lg shadow hover:from-green-700 hover:to-blue-600 transition-all duration-200"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 