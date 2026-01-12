import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type UserRole = 'employee' | 'employer' | 'admin' | 'vendor';

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && role) {
        // Redirect based on actual role
        const roleRedirects: Record<UserRole, string> = {
          employee: '/employee',
          employer: '/employer',
          admin: '/admin',
          vendor: '/vendor',
        };
        navigate(roleRedirects[role] || '/employee');
      } else if (!user) {
        navigate('/auth');
      }
    }
  }, [user, role, loading, navigate]);

  return <LoadingSpinner fullScreen size="lg" />;
};

export default Index;