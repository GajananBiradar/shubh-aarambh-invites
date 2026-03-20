import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { checkPayment, createInvitation } from '@/api/invitations';
import { SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';
import PageWrapper from '@/components/layout/PageWrapper';
import { slugify } from '@/utils/slugify';
import { generateCode } from '@/utils/generateCode';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Copy, ExternalLink, ChevronRight, ChevronLeft, Music, Image, Upload } from 'lucide-react';
import { WeddingEvent } from '@/types';

const step1Schema = z.object({
  brideName: z.string().min(2, 'Required'),
  groomName: z.string().min(2, 'Required'),
  brideBio: z.string().max(100).optional(),
  groomBio: z.string().max(100).optional(),
  hashtag: z.string().optional(),
  slug: z.string().min(2),
});

const CreateInvitationPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [events, setEvents] = useState<WeddingEvent[]>([
    { eventName: 'Wedding', date: '', time: '', venueName: '', venueAddress: '', mapsUrl: '' },
  ]);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [musicUrl, setMusicUrl] = useState('');
  const [musicName, setMusicName] = useState('');
  const [musicMode, setMusicMode] = useState<'upload' | 'url'>('url');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showCountdown, setShowCountdown] = useState(true);
  const [weddingDate, setWeddingDate] = useState('');
  const [published, setPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const template = SAMPLE_TEMPLATES.find(t => t.id === templateId) || SAMPLE_TEMPLATES[0];
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      brideName: '', groomName: '', brideBio: '', groomBio: '', hashtag: '', slug: '',
    },
  });

  const groomName = watch('groomName');
  const brideName = watch('brideName');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (groomName && brideName) {
      const slug = slugify(groomName, brideName);
      setValue('slug', slug);
      setValue('hashtag', `#${groomName.split(' ')[0]}Weds${brideName.split(' ')[0]}`);
    }
  }, [groomName, brideName, setValue]);

  const addEvent = () => {
    if (events.length >= 8) { toast.error('Maximum 8 events'); return; }
    setEvents([...events, { eventName: '', date: '', time: '', venueName: '', venueAddress: '', mapsUrl: '' }]);
  };

  const removeEvent = (i: number) => {
    if (events.length <= 1) return;
    setEvents(events.filter((_, idx) => idx !== i));
  };

  const updateEvent = (i: number, field: keyof WeddingEvent, value: string) => {
    const updated = [...events];
    updated[i] = { ...updated[i], [field]: value };
    setEvents(updated);
  };

  const addMockPhotos = () => {
    setGalleryPhotos([
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
    ]);
    toast.success('Sample photos added (dev mode)');
  };

  const handlePublish = async (data: any) => {
    setPublishing(true);
    const code = generateCode();
    const invData = {
      ...data,
      templateId: template.id,
      templateTheme: template.theme,
      events,
      galleryPhotos,
      musicUrl: musicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      musicName: musicName || 'Wedding Song',
      welcomeMessage: welcomeMessage || `Together with their families, ${data.groomName} & ${data.brideName} joyfully invite you to be part of their celebration of love.`,
      showCountdown,
      weddingDate: weddingDate || '2025-12-14',
      code,
      couplePhotoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    };

    try {
      await createInvitation(invData);
    } catch { /* dev mode fallback */ }

    const url = `${window.location.origin}/${code}/invite/${data.slug}`;
    setPublishedUrl(url);
    setPublished(true);
    setPublishing(false);
    toast.success('Invitation published! 🎉');
  };

  const steps = ['Couple Details', 'Events', 'Gallery & Music', 'Review & Publish'];

  if (published) {
    const whatsappMsg = encodeURIComponent(`You're invited to our wedding celebrations! 💌 ${publishedUrl} 🌸`);
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-2xl border border-border p-8 shadow-lg">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-heading text-2xl font-bold mb-2">Your invitation is live!</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">Share it with your loved ones</p>
            <div className="bg-muted rounded-xl p-3 mb-6">
              <p className="font-body text-xs text-muted-foreground break-all select-all">{publishedUrl}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { navigator.clipboard.writeText(publishedUrl); toast.success('Copied!'); }} className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                <Copy size={16} /> Copy Link
              </button>
              <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] font-body font-medium px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                💚 Share on WhatsApp
              </a>
              <button onClick={() => window.open(publishedUrl, '_blank')} className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                <ExternalLink size={16} /> Preview
              </button>
              <button onClick={() => navigate('/dashboard')} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
                Go to Dashboard →
              </button>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {isDevMode && (
          <div className="bg-[hsl(45,100%,90%)] border border-[hsl(45,100%,70%)] text-[hsl(45,80%,20%)] font-body text-xs px-4 py-2 rounded-xl mb-6 text-center">
            🛠️ DEV MODE — Payment check bypassed. Remove before going live.
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1.5 font-body text-xs ${i + 1 <= step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i + 1 <= step ? <Check size={12} /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <h2 className="font-heading text-xl font-bold">Couple Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Bride's Name *</label>
                <input {...register('brideName')} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Priya Sharma" />
                {errors.brideName && <p className="text-destructive text-xs mt-1 font-body">{errors.brideName.message}</p>}
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Groom's Name *</label>
                <input {...register('groomName')} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Rahul Mehta" />
                {errors.groomName && <p className="text-destructive text-xs mt-1 font-body">{errors.groomName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Bride's Bio <span className="text-muted-foreground">({(watch('brideBio') || '').length}/100)</span></label>
                <input {...register('brideBio')} maxLength={100} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Software engineer & chai lover ☕" />
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Groom's Bio <span className="text-muted-foreground">({(watch('groomBio') || '').length}/100)</span></label>
                <input {...register('groomBio')} maxLength={100} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Architect who draws buildings & hearts 🏛️" />
              </div>
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Wedding Date</label>
              <input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Hashtag</label>
              <input {...register('hashtag')} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">URL Slug</label>
              <input {...register('slug')} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="font-body text-xs text-muted-foreground mt-1">
                Preview: {window.location.origin}/XXXXX/invite/{watch('slug') || 'your-slug'}
              </p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(2)} className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <h2 className="font-heading text-xl font-bold">Events</h2>
            {events.map((event, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-muted-foreground font-medium">Event {i + 1}</span>
                  {events.length > 1 && (
                    <button onClick={() => removeEvent(i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <select value={event.eventName} onChange={e => updateEvent(i, 'eventName', e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select event type</option>
                  {['Haldi', 'Mehendi', 'Sangeet', 'Wedding', 'Reception', 'Custom'].map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={event.date} onChange={e => updateEvent(i, 'date', e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input type="time" value={event.time} onChange={e => updateEvent(i, 'time', e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <input value={event.venueName} onChange={e => updateEvent(i, 'venueName', e.target.value)} placeholder="Venue name" className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <textarea value={event.venueAddress} onChange={e => updateEvent(i, 'venueAddress', e.target.value)} placeholder="Venue address" rows={2} className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <input value={event.mapsUrl} onChange={e => updateEvent(i, 'mapsUrl', e.target.value)} placeholder="Google Maps URL" className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
            <button onClick={addEvent} className="btn-outline-accent w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
              <Plus size={16} /> Add Event
            </button>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)} className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="font-heading text-xl font-bold">Gallery & Music</h2>

            <div>
              <h3 className="font-body text-sm font-medium mb-3">Photos</h3>
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {galleryPhotos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setGalleryPhotos(galleryPhotos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-destructive/80 text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <button onClick={addMockPhotos} className="w-full border-2 border-dashed border-border rounded-2xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors">
                <Upload size={24} />
                <span className="font-body text-sm">Drop photos here or click to browse</span>
                <span className="font-body text-xs">(Dev: click to add sample photos)</span>
              </button>
            </div>

            <div>
              <h3 className="font-body text-sm font-medium mb-3">Background Music</h3>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setMusicMode('url')} className={`px-4 py-1.5 rounded-lg font-body text-xs border transition-colors ${musicMode === 'url' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                  Paste URL
                </button>
                <button onClick={() => setMusicMode('upload')} className={`px-4 py-1.5 rounded-lg font-body text-xs border transition-colors ${musicMode === 'upload' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>
                  Upload MP3
                </button>
              </div>
              {musicMode === 'url' ? (
                <input value={musicUrl} onChange={e => setMusicUrl(e.target.value)} placeholder="Paste music URL" className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              ) : (
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-muted-foreground font-body text-sm">
                  <Music size={24} className="mx-auto mb-2" />
                  Upload MP3 (max 5MB) — coming in production
                </div>
              )}
              <input value={musicName} onChange={e => setMusicName(e.target.value)} placeholder="Song name (optional)" className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-3" />
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(4)} className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="font-heading text-xl font-bold">Review & Publish</h2>

            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Welcome Message <span className="text-muted-foreground">({welcomeMessage.length}/300)</span></label>
              <textarea
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value.slice(0, 300))}
                placeholder={`Together with their families, ${groomName || '[Groom]'} & ${brideName || '[Bride]'} joyfully invite you to be part of their celebration of love.`}
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
              <span className="font-body text-sm">Show Countdown Timer</span>
              <button
                onClick={() => setShowCountdown(!showCountdown)}
                className={`w-12 h-6 rounded-full transition-colors relative ${showCountdown ? 'bg-accent' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 bg-card rounded-full absolute top-0.5 transition-all shadow-sm ${showCountdown ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-heading text-base font-semibold">Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm font-body">
                <span className="text-muted-foreground">Bride</span><span>{brideName || '—'}</span>
                <span className="text-muted-foreground">Groom</span><span>{groomName || '—'}</span>
                <span className="text-muted-foreground">Events</span><span>{events.length}</span>
                <span className="text-muted-foreground">Photos</span><span>{galleryPhotos.length}</span>
                <span className="text-muted-foreground">Template</span><span>{template.name}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleSubmit(handlePublish)}
                disabled={publishing}
                className="btn-gold px-8 py-3 rounded-xl text-base flex items-center gap-2 disabled:opacity-50"
              >
                {publishing ? 'Publishing...' : '✅ Publish My Invitation'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default CreateInvitationPage;
