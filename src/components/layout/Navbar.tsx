import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Heart className="w-5 h-5 text-gold fill-gold group-hover:scale-110 transition-transform" />
          <span className="font-display text-xl font-semibold text-foreground">WeddingInvites.in</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/templates" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Templates</Link>
          <a href="/#features" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Features</a>
          <a href="/#pricing" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Pricing</a>
          <a href="/#faq" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">FAQ</a>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="font-body text-sm font-medium text-foreground hover:text-gold transition-colors">Dashboard</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-outline-accent px-4 py-2 rounded-lg text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-body text-sm font-medium text-foreground hover:text-gold transition-colors">Login</Link>
              <Link to="/register" className="btn-gold px-5 py-2 rounded-lg text-sm">Get Started</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              <Link to="/templates" onClick={() => setMobileOpen(false)} className="font-body text-muted-foreground hover:text-gold">Templates</Link>
              <a href="/#features" onClick={() => setMobileOpen(false)} className="font-body text-muted-foreground hover:text-gold">Features</a>
              <a href="/#pricing" onClick={() => setMobileOpen(false)} className="font-body text-muted-foreground hover:text-gold">Pricing</a>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="font-body text-foreground font-medium">Dashboard</Link>
                  <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="btn-outline-accent px-4 py-2 rounded-lg text-sm text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="font-body text-foreground font-medium">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-gold px-5 py-2 rounded-lg text-sm text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
