import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const redirectTo = (location.state as any)?.redirectTo;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await handleLogin(data.email, data.password, redirectTo);
    setLoading(false);
  };

  const handleOAuth = (provider: string) => {
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      toast(`${provider} login — coming soon!`);
      return;
    }
    window.location.href = `/oauth2/authorization/${provider.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Atmospheric image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--gold)) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <Heart className="w-12 h-12 text-gold fill-gold mb-6" />
          <h2 className="font-display text-4xl font-semibold mb-4">WeddingInvites.in</h2>
          <p className="font-body text-muted-foreground font-light max-w-sm">
            Premium digital wedding invitations crafted for the modern Indian couple.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Heart className="w-8 h-8 text-gold fill-gold mx-auto mb-3" />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2">Welcome back</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Sign in to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Email</label>
              <input {...register('email')} type="email" className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" placeholder="you@example.com" />
              {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email.message}</p>}
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1 font-body">{errors.password.message}</p>}
            </div>
            <div className="text-right">
              <a href="#" className="font-body text-xs text-muted-foreground hover:text-gold">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 rounded-xl text-base disabled:opacity-50">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="font-body text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleOAuth('Google')} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors font-body text-sm">
              <span className="text-base">G</span>
            </button>
            <button onClick={() => handleOAuth('Facebook')} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors font-body text-sm">
              <span className="text-base">f</span>
            </button>
            <button onClick={() => handleOAuth('Apple')} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors font-body text-sm">
              <span className="text-base"></span>
            </button>
          </div>

          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold font-medium hover:underline">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
