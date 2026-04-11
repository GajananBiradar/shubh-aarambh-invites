import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Eye, EyeOff, Check, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[@#$%^&+=!]/.test(p),
  },
];

const RegisterPage = () => {
  const { handleRegister } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch("password") || "";

  const strength = useMemo(() => {
    const passed = passwordRules.filter((r) => r.test(password)).length;
    if (passed <= 1)
      return { label: "Weak", color: "bg-destructive", width: "25%" };
    if (passed <= 2)
      return { label: "Fair", color: "bg-[hsl(38,80%,50%)]", width: "50%" };
    if (passed <= 3) return { label: "Good", color: "bg-gold", width: "75%" };
    return { label: "Strong", color: "bg-emerald", width: "100%" };
  }, [password]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await handleRegister(data.name, data.email, data.password);
    setLoading(false);
  };

  const handleOAuth = (provider: string) => {
    if (import.meta.env.VITE_DEV_MODE === "true") {
      toast(`${provider} login — coming soon!`);
      return;
    }
    window.location.href = `/oauth2/authorization/${provider.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--gold)) 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <Heart className="w-12 h-12 text-gold fill-gold mb-6" />
          <h2 className="font-display text-4xl font-semibold mb-4">
            LuxEnvelope
          </h2>
          <p className="font-body text-muted-foreground font-light max-w-sm">
            Create stunning digital invitations that your guests will never
            forget.
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 lg:hidden">
            <Heart className="w-8 h-8 text-gold fill-gold mx-auto mb-3" />
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 px-3 py-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-secondary transition-colors font-body text-sm"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="font-display text-3xl font-semibold mb-2">
            Create your account
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Start building your invitation
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">
                Full Name
              </label>
              <input
                {...register("name")}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                placeholder="Your full name"
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1 font-body">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1 font-body">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1 font-body">
                  {errors.password.message}
                </p>
              )}

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {passwordRules.map((rule) => (
                      <span
                        key={rule.label}
                        className={`font-body text-[11px] flex items-center gap-1 ${rule.test(password) ? "text-emerald" : "text-muted-foreground"}`}
                      >
                        {rule.test(password) ? (
                          <Check size={11} />
                        ) : (
                          <X size={11} />
                        )}{" "}
                        {rule.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1 font-body">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl text-base disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="font-body text-xs text-muted-foreground">
              or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleOAuth("Google")}
              className="flex items-center justify-center py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors font-body text-sm"
            >
              G
            </button>
            <button
              onClick={() => handleOAuth("Facebook")}
              className="flex items-center justify-center py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors font-body text-sm"
            >
              f
            </button>
            <button
              onClick={() => handleOAuth("Apple")}
              className="flex items-center justify-center py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors font-body text-sm"
            ></button>
          </div>

          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-gold font-medium hover:underline">
              Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
