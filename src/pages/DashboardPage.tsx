import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useMyInvitations } from "@/hooks/useInvitation";
import PageWrapper from "@/components/layout/PageWrapper";
import AdminDashboard from "@/components/admin/AdminDashboard";
import {
  Eye,
  Pencil,
  Copy,
  Plus,
  Heart,
  Sparkles,
  Trash2,
  Loader2,
  ChevronDown,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { deleteInvitation } from "@/api/invitations";
import { getRsvps, RsvpResponseItem } from "@/api/rsvp";

const DashboardPage = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: invitations, isLoading, refetch } = useMyInvitations();
  const [localInvitations, setLocalInvitations] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedRsvp, setExpandedRsvp] = useState<number | null>(null);
  const [rsvpData, setRsvpData] = useState<Record<number, RsvpResponseItem[]>>({});
  const [rsvpLoading, setRsvpLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (invitations) setLocalInvitations(invitations);
  }, [invitations]);

  const totalViews = localInvitations.reduce(
    (sum, inv) => sum + (inv.viewCount || 0),
    0,
  );
  const totalRsvps = localInvitations.reduce(
    (sum, inv) => sum + (inv.rsvpCount || 0),
    0,
  );

  // CHANGE 5: Use accessCode instead of code
  const getPublicUrl = (inv: any) => {
    const code = inv.accessCode || inv.code;
    return `/${code}/invite/${inv.slug}`;
  };

  const copyLink = (inv: any) => {
    const url = `${window.location.origin}${getPublicUrl(inv)}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied! ✅");
  };

  const shareWhatsApp = (inv: any) => {
    const url = `${window.location.origin}${getPublicUrl(inv)}`;
    const msg = encodeURIComponent(
      `You're invited! Open your beautiful wedding invitation here: ${url} 💌`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // CHANGE 4: Delete invitation
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvitation(deleteTarget.id);
      setLocalInvitations((prev) =>
        prev.filter((inv) => inv.id !== deleteTarget.id),
      );
      toast.success("Invitation deleted.");
      setDeleteTarget(null);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this.");
      } else {
        toast.error("Could not delete. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const toggleRsvpPanel = async (invId: number) => {
    if (expandedRsvp === invId) {
      setExpandedRsvp(null);
      return;
    }
    setExpandedRsvp(invId);
    if (!rsvpData[invId]) {
      setRsvpLoading(invId);
      try {
        const data = await getRsvps(invId);
        setRsvpData((prev) => ({ ...prev, [invId]: data }));
      } catch {
        toast.error("Could not load RSVPs");
      } finally {
        setRsvpLoading(null);
      }
    }
  };

  return (
    <PageWrapper>
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="font-heading text-lg font-bold mb-2">
                Delete this invitation?
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-6">
                This will permanently delete {deleteTarget.brideName} &{" "}
                {deleteTarget.groomName}'s invitation. This action cannot be
                undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="btn-outline-accent px-4 py-2 rounded-xl text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground font-body font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 hover:bg-destructive/90 transition-colors"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            { label: "Total Invitations", value: localInvitations.length },
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
        ) : localInvitations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localInvitations.map((inv, i) => (
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
                      {(inv.brideName || "").split(" ")[0]} &{" "}
                      {(inv.groomName || "").split(" ")[0]}
                    </h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {inv.templateTheme || inv.template?.name || "Template"}{" "}
                      template
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
                  <button
                    onClick={() => inv.id && toggleRsvpPanel(inv.id)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Users size={12} />
                    {inv.rsvpCount || 0} RSVPs
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${expandedRsvp === inv.id ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* RSVP Detail Panel */}
                <AnimatePresence>
                  {expandedRsvp === inv.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                        {rsvpLoading === inv.id ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="animate-spin text-muted-foreground" />
                            <span className="ml-2 font-body text-xs text-muted-foreground">Loading RSVPs...</span>
                          </div>
                        ) : (rsvpData[inv.id] || []).length === 0 ? (
                          <p className="font-body text-xs text-muted-foreground text-center py-3">
                            No RSVPs yet
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-3 text-[10px] font-body text-muted-foreground uppercase tracking-wider px-1">
                              <span className="flex-1">Guest</span>
                              <span className="w-20 text-center">Status</span>
                              <span className="w-12 text-center">Guests</span>
                            </div>
                            {(rsvpData[inv.id] || []).map((rsvp) => (
                              <div
                                key={rsvp.id}
                                className="flex gap-3 items-center bg-card rounded-lg px-3 py-2.5 border border-border/50"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-body text-sm font-medium truncate">
                                    {rsvp.guestName}
                                  </p>
                                  <p className="font-body text-[10px] text-muted-foreground">
                                    {rsvp.guestPhone}
                                    {rsvp.message && (
                                      <span className="ml-2 italic">— "{rsvp.message}"</span>
                                    )}
                                  </p>
                                </div>
                                <span
                                  className={`w-20 text-center font-body text-[10px] font-semibold px-2 py-1 rounded-full ${
                                    rsvp.attending === "YES"
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : rsvp.attending === "MAYBE"
                                        ? "bg-amber-500/10 text-amber-600"
                                        : "bg-red-500/10 text-red-600"
                                  }`}
                                >
                                  {rsvp.attending === "YES"
                                    ? "Attending"
                                    : rsvp.attending === "MAYBE"
                                      ? "Maybe"
                                      : "Declined"}
                                </span>
                                <span className="w-12 text-center font-body text-xs">
                                  {rsvp.guestCount}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2">
                  {/* View published invitation */}
                  {inv.status === "PUBLISHED" &&
                    (inv.accessCode || inv.code) &&
                    inv.slug && (
                      <button
                        onClick={() =>
                          window.open(
                            `/${inv.accessCode || inv.code}/invite/${inv.slug}`,
                            "_blank",
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-secondary transition-colors"
                      >
                        <Eye size={13} /> View
                      </button>
                    )}
                  <button
                    onClick={() => navigate(`/edit/${inv.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-secondary transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  {inv.status === "PUBLISHED" && (inv.accessCode || inv.code) && inv.slug && (
                    <>
                      <button
                        onClick={() => copyLink(inv)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card font-body text-xs hover:bg-secondary transition-colors"
                      >
                        <Copy size={13} /> Copy Link
                      </button>
                      <button
                        onClick={() => shareWhatsApp(inv)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(142,70%,40%)] text-white font-body text-xs hover:opacity-90 transition-opacity"
                      >
                        Share
                      </button>
                    </>
                  )}
                  {inv.status === "DRAFT" && (
                    <button
                      onClick={() => window.open(`/edit/${inv.id}`, "_blank")}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg btn-gold font-body text-xs"
                    >
                      <Sparkles size={13} /> Continue Editing
                    </button>
                  )}
                  {/* CHANGE 4: Delete button */}
                  <button
                    onClick={() => setDeleteTarget(inv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive font-body text-xs hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={13} />{" "}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
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

        {user?.role === "ADMIN" && <AdminDashboard />}

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
