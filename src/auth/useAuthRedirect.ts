import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Redirects authenticated users away from the login page.
 * Use at the top of LoginPage to prevent logged-in users from seeing the form.
 */
export function useAuthRedirect() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate('/admin', { replace: true });
    }
  }, [session, loading, navigate]);

  return { loading };
}
