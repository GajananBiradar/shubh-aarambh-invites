import { useAuthStore } from '@/store/authStore';
import { loginApi, registerApi } from '@/api/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string, redirectTo?: string) => {
    try {
      // Dev mode mock login
      if (import.meta.env.VITE_DEV_MODE === 'true') {
        login('dev-token-123', { id: '1', name: 'Dev User', email });
        toast.success('Logged in! (Dev Mode)');
        navigate(redirectTo || '/dashboard');
        return;
      }
      const data = await loginApi(email, password);
      login(data.token, data.user);
      toast.success('Welcome back! 🎉');
      navigate(redirectTo || '/dashboard');
    } catch {
      toast.error('Invalid email or password');
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      if (import.meta.env.VITE_DEV_MODE === 'true') {
        login('dev-token-123', { id: '1', name, email });
        toast.success('Account created! (Dev Mode)');
        navigate('/dashboard');
        return;
      }
      const data = await registerApi(name, email, password);
      login(data.token, data.user);
      toast.success('Welcome to WeddingInvites.in! 🎉');
      navigate('/dashboard');
    } catch {
      toast.error('Registration failed. Try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  return { handleLogin, handleRegister, handleLogout, user, isAuthenticated };
};
