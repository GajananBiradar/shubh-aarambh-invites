import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useMyInvitations } from '@/hooks/useInvitation';
import PageWrapper from '@/components/layout/PageWrapper';
import { Eye, Pencil, Copy, ExternalLink, Plus, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { data: invitations, isLoading } = useMyInvitations();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const copyLink = (code: string, slug: string) => {
    const url = `${window.location.origin}/${code}/invite/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied! ✅');
  };

  const shareWhatsApp = (inv: any) => {
    const url = `${window.location.origin}/${inv.code}/invite/${inv.slug}`;
    const msg = encodeURIComponent(`You're invited to ${inv.groomName.split(' ')[0]} & ${inv.brideName.split(' ')[0]}'s wedding! 💌 ${url} 🌸`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Hello, {user?.name || 'there'} 👋</h1>
            <p className="font-body text-sm text-muted-foreground">Manage your wedding invitations</p>
          </div>
          <Link to="/#templates" className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Plus size={16} /> Create New
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : invitations && invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((inv, i) => (
              <motion.div
                key={inv.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{inv.groomName.split(' ')[0]} & {inv.brideName.split(' ')[0]}</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {inv.templateTheme} · 💌 {inv.viewCount || 0} opens
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => window.open(`/${inv.code}/invite/${inv.slug}`, '_blank')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-muted transition-colors"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => navigate(`/edit/${inv.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-muted transition-colors"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => copyLink(inv.code || '', inv.slug)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-muted transition-colors"
                    >
                      <Copy size={14} /> Copy
                    </button>
                    <button
                      onClick={() => shareWhatsApp(inv)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] font-body text-xs hover:opacity-90 transition-opacity"
                    >
                      💚 WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">Your first invitation is just a click away</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">Choose a template and create something beautiful.</p>
            <Link to="/#templates" className="btn-gold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
              <Plus size={16} /> Create Now
            </Link>
          </div>
        )}

        {/* Account section */}
        <div className="mt-12 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Account</h3>
          <div className="space-y-3">
            <div>
              <label className="font-body text-xs text-muted-foreground">Name</label>
              <p className="font-body text-sm">{user?.name || 'Dev User'}</p>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground">Email</label>
              <p className="font-body text-sm">{user?.email || 'dev@example.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
