import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-card border-t border-border py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <Heart className="w-5 h-5 text-gold fill-gold" />
            <span className="font-display text-xl font-semibold">WeddingInvites.in</span>
          </Link>
          <p className="font-body text-sm text-muted-foreground font-light leading-relaxed">
            Premium digital wedding invitations crafted for the modern Indian couple.
          </p>
        </div>
        <div>
          <h4 className="font-display text-base font-semibold mb-4 text-foreground">Quick Links</h4>
          <div className="flex flex-col gap-2.5">
            <a href="/" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Home</a>
            <a href="/templates" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Templates</a>
            <a href="/#pricing" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Pricing</a>
            <a href="/#faq" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">FAQ</a>
            <a href="mailto:hello@weddinginvites.in" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Contact</a>
          </div>
        </div>
        <div>
          <h4 className="font-display text-base font-semibold mb-4 text-foreground">Follow Us</h4>
          <div className="flex gap-5">
            <a href="#" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">Instagram</a>
            <a href="#" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">WhatsApp</a>
            <a href="#" className="font-body text-sm text-muted-foreground hover:text-gold transition-colors">YouTube</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-8 text-center">
        <p className="font-body text-sm text-muted-foreground">Made with ❤️ in India 🇮🇳</p>
        <p className="font-body text-xs text-muted-foreground mt-1.5">© 2025 WeddingInvites.in. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
