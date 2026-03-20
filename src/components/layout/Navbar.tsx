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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-heading text-xl font-semibold text-foreground">WeddingInvites.in</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/#templates" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent hover:after:w-full after:transition-all">Templates</a>
          <a href="/#features" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent hover:after:w-full after:transition-all">Features</a>
          <a href="/#pricing" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent hover:after:w-full after:transition-all">Pricing</a>
          <a href="/#faq" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent hover:after:w-full after:transition-all">FAQ</a>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="font-body text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-outline-accent px-4 py-2 rounded-lg text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-body text-sm font-medium text-foreground hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="btn-gold px-5 py-2 rounded-lg text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
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
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              <a href="/#templates" onClick={() => setMobileOpen(false)} className="font-body text-muted-foreground">Templates</a>
              <a href="/#features" onClick={() => setMobileOpen(false)} className="font-body text-muted-foreground">Features</a>
              <a href="/#pricing" onClick={() => setMobileOpen(false)} className="font-body text-muted-foreground">Pricing</a>
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
