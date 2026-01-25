import { useEffect } from 'react';
import { useNavigate } from '@/components/Router';

interface RouteRedirectProps {
  to: string;
}

export default function RouteRedirect({ to }: RouteRedirectProps) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  // Return null while redirecting
  return null;
}
