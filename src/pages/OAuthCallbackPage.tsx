import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import { Heart, Loader2 } from 'lucide-react';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    const finishOAuthLogin = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        localStorage.setItem('token', token);
        const { data: user } = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        login(token, user);
        navigate('/dashboard');
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    finishOAuthLogin();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Heart className="w-10 h-10 text-gold fill-gold mb-6" />
      <Loader2 className="w-6 h-6 text-gold animate-spin mb-4" />
      <p className="font-display text-xl text-foreground">Signing you in...</p>
    </div>
  );
};

export default OAuthCallbackPage;
