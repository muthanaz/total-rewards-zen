import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && role) {
        navigate(role === 'employer' ? '/employer' : '/employee');
      } else if (!user) {
        navigate('/auth');
      }
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mx-auto shadow-glow">
          <span className="text-primary font-bold text-2xl">b</span>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary-foreground mx-auto" />
      </div>
    </div>
  );
};

export default Index;