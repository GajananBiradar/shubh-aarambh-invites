import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-card border-t border-border py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            <span className="font-heading text-lg font-semibold">WeddingInvites.in</span>
          </Link>
          <p className="font-body text-sm text-muted-foreground">Beautiful digital wedding invitations for modern Indian weddings.</p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-3 text-foreground">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <a href="/#templates" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</a>
            <a href="/#pricing" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="/#faq" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <a href="mailto:hello@weddinginvites.in" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-3 text-foreground">Follow Us</h4>
          <div className="flex gap-4">
            <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
            <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">WhatsApp</a>
            <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">YouTube</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6 text-center">
        <p className="font-body text-sm text-muted-foreground">Made with ❤️ in India 🇮🇳</p>
        <p className="font-body text-xs text-muted-foreground mt-1">© 2025 WeddingInvites.in. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
