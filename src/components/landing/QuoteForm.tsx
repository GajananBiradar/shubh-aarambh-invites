import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

const QuoteForm = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', vision: '', budget: '', eventDate: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.vision) {
      toast.error('Please fill in required fields');
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
    toast.success('Request sent! We\'ll get back to you soon.');
  };

  if (submitted) {
    return (
      <section id="quote-form" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-2xl border border-border p-10">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-display text-2xl font-semibold mb-2">Request Received!</h3>
            <p className="font-body text-sm text-muted-foreground">We'll reach out within 24 hours to discuss your dream invitation.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="quote-form" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-semibold mb-3">Request a Custom Design</h2>
          <p className="font-body text-sm text-muted-foreground font-light">Tell us your vision and we'll make it happen.</p>
        </motion.div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" placeholder="Your name" />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Email *</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" placeholder="you@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" placeholder="Optional" />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Budget</label>
              <select value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30">
                <option value="">Select budget</option>
                <option value="free">Free to try</option>
                <option value="under-1000">Under ₹1,000</option>
                <option value="1000-2500">₹1,000 – ₹2,500</option>
                <option value="2500+">₹2,500+</option>
              </select>
            </div>
          </div>
          <div>
            <label className="font-body text-sm font-medium block mb-1.5">Tell us your vision *</label>
            <textarea value={form.vision} onChange={e => setForm({...form, vision: e.target.value})} rows={4} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none" placeholder="Describe your dream invitation — colors, style, culture, any inspiration..." />
          </div>
          <div>
            <label className="font-body text-sm font-medium block mb-1.5">Event Date (optional)</label>
            <input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={16} /> {loading ? 'Sending...' : 'Send My Request'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default QuoteForm;
