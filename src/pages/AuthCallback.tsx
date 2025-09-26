import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDashboardRoute } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(error.message || 'Authentication failed');
          return;
        }

        if (data.session) {
          // Fetch user profile to determine dashboard route
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            setStatus('error');
            setMessage('Failed to load user profile');
            return;
          }

          // User is authenticated
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to your dashboard...');
          
          toast({
            title: "Email verified! 🎉",
            description: "Welcome to BEPAWA! You're now logged in.",
          });

          // Redirect to role-specific dashboard
          const dashboardRoute = getDashboardRoute({ 
            ...profile, 
            isApproved: profile.is_approved 
          } as any);
          
          setTimeout(() => {
            navigate(dashboardRoute, { replace: true });
          }, 2000);
        } else {
          // No session found
          setStatus('error');
          setMessage('No authentication session found. Please try logging in again.');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, getDashboardRoute]);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto mx-auto" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent mb-2">
            BEPAWA
          </h1>
          <p className="text-gray-600">Processing your authentication</p>
        </div>

        {/* Status Card */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl font-semibold ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              {message}
            </p>

            {status === 'loading' && (
              <div className="space-y-2">
                <div className="animate-pulse bg-gray-200 h-2 rounded-full"></div>
                <p className="text-sm text-gray-500">Please wait while we verify your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    You will be redirected to your dashboard automatically.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    Don't worry, you can still access your account by logging in normally.
                  </p>
                </div>
                <Button 
                  onClick={handleReturnToLogin}
                  variant="outline"
                  className="w-full border-2 border-primary-200 text-primary-700 hover:bg-primary-50"
                >
                  Return to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
