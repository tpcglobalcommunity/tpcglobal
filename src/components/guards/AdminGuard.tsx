import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentAdminUser } from '../../lib/adminAuth';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentAdminUser();
        if (user) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-secondary">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" title="Access Denied">
            You don't have permission to access this admin area. This page is restricted to authorized administrators only.
          </Alert>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Homepage
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
