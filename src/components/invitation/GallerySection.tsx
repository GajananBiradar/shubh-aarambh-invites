import { motion, AnimatePresence } from 'framer-motion';
import { Invitation } from '@/types';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useCallback } from 'react';

const GallerySection = ({ invitation }: { invitation: Invitation }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + invitation.galleryPhotos.length) % invitation.galleryPhotos.length);
    }
  }, [lightboxIndex, invitation.galleryPhotos.length]);
  const next = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % invitation.galleryPhotos.length);
    }
  }, [lightboxIndex, invitation.galleryPhotos.length]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-muted/30"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-heading text-3xl font-bold text-center mb-10">Our Moments Together</h2>
        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {invitation.galleryPhotos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="break-inside-avoid group cursor-pointer relative rounded-lg overflow-hidden"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={photo} alt={`Gallery ${i + 1}`} className="w-full rounded-lg transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white">
              <X size={28} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white/80 hover:text-white">
              <ChevronLeft size={32} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white/80 hover:text-white">
              <ChevronRight size={32} />
            </button>
            <img
              src={invitation.galleryPhotos[lightboxIndex]}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default GallerySection;
