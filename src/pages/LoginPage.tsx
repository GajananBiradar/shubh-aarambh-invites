import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await handleLogin(data.email, data.password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted animate-gradient-shift p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-lg">
        <div className="text-center mb-8">
          <Heart className="w-8 h-8 text-primary fill-primary mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold">Welcome Back</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="font-body text-sm font-medium block mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email.message}</p>}
          </div>
          <div>
            <label className="font-body text-sm font-medium block mb-1.5">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1 font-body">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-xl text-base disabled:opacity-50">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button className="w-full mt-3 py-3 rounded-xl border border-border bg-card font-body text-sm text-muted-foreground hover:bg-muted transition-colors" onClick={() => import('react-hot-toast').then(m => m.default('Coming soon!'))}>
          Continue with Google
        </button>

        <p className="text-center mt-6 font-body text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
