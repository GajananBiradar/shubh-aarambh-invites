import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useMyInvitations } from "@/hooks/useInvitation";
import PageWrapper from "@/components/layout/PageWrapper";
import AdminDashboard from "@/components/admin/AdminDashboard";
import {
  Eye,
  Pencil,
  Copy,
  ExternalLink,
  Plus,
  Heart,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: invitations, isLoading } = useMyInvitations();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totalViews =
    invitations?.reduce((sum, inv) => sum + (inv.viewCount || 0), 0) || 0;
  const totalRsvps =
    invitations?.reduce((sum, inv) => sum + (inv.rsvpCount || 0), 0) || 0;

  const copyLink = (code: string, slug: string) => {
    const url = `${window.location.origin}/${code}/invite/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied! ✅");
  };

  const shareWhatsApp = (inv: any) => {
    const url = `${window.location.origin}/${inv.code}/invite/${inv.slug}`;
    const msg = encodeURIComponent(
      `You're invited! Open your beautiful invitation here: ${url} 💌`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Hello, {user?.name || "there"} 👋
            </h1>
            <p className="font-body text-sm text-muted-foreground font-light mt-1">
              Manage your wedding invitations
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/templates"
              className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <Plus size={16} /> Create New
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Invitations", value: invitations?.length || 0 },
            { label: "Total Views", value: totalViews },
            { label: "Total RSVPs", value: totalRsvps },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card rounded-2xl border border-border p-5 text-center"
            >
              <p className="font-display text-3xl font-bold text-gold">
                {s.value}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-6 animate-pulse"
              >
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : invitations && invitations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invitations.map((inv, i) => (
              <motion.div
                key={inv.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      {inv.groomName.split(" ")[0]} &{" "}
                      {inv.brideName.split(" ")[0]}
                    </h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {inv.templateTheme} template
                    </p>
                  </div>
                  <span
                    className={`font-body text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      inv.status === "PUBLISHED"
                        ? "bg-emerald/10 text-emerald border border-emerald/20"
                        : "bg-gold/10 text-gold border border-gold/20"
                    }`}
                  >
                    ● {inv.status === "PUBLISHED" ? "Live" : "Draft"}
                  </span>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground font-body mb-4">
                  <span>💌 {inv.viewCount || 0} views</span>
                  <span>👥 {inv.rsvpCount || 0} RSVPs</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      window.open(`/${inv.code}/invite/${inv.slug}`, "_blank")
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-secondary transition-colors"
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <button
                    onClick={() => navigate(`/edit/${inv.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-secondary transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  {inv.status === "PUBLISHED" && (
                    <>
                      <button
                        onClick={() => copyLink(inv.code || "", inv.slug)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-secondary transition-colors"
                      >
                        <Copy size={13} /> Copy Link
                      </button>
                      <button
                        onClick={() => shareWhatsApp(inv)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(142,70%,40%)] text-white font-body text-xs hover:opacity-90 transition-opacity"
                      >
                        💚 WhatsApp
                      </button>
                    </>
                  )}
                  {inv.status === "DRAFT" && (
                    <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg btn-gold font-body text-xs">
                      <Sparkles size={13} /> Publish
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gold/20 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-semibold mb-2">
              Your first invitation is just a few clicks away
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-6 font-light">
              Choose a template and create something beautiful.
            </p>
            <Link
              to="/templates"
              className="btn-gold px-8 py-3 rounded-xl text-sm inline-flex items-center gap-2"
            >
              <Plus size={16} /> Browse Templates
            </Link>
          </div>
        )}

        {/* Admin Panel */}
        {user?.role === "ADMIN" && <AdminDashboard />}

        {/* Account */}
        <div className="mt-12 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Account</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground">
                Name
              </label>
              <p className="font-body text-sm">{user?.name || "Dev User"}</p>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground">
                Email
              </label>
              <p className="font-body text-sm">
                {user?.email || "dev@example.com"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
