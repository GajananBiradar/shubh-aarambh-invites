import { useState, useRef } from 'react';
import { TemplateMode, PhotoData, DefaultPhoto } from '@/templates/types';
import { X, Plus, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile, validatePhoto } from '@/lib/upload';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface EditablePhotoGalleryProps {
  photos: PhotoData[];
  defaultPhotos: DefaultPhoto[];
  onUpdate: (photos: PhotoData[]) => void;
  mode: TemplateMode;
  maxPhotos?: number;
  className?: string;
}

const EditablePhotoGallery = ({
  photos,
  defaultPhotos,
  onUpdate,
  mode,
  maxPhotos = 10,
  className = '',
}: EditablePhotoGalleryProps) => {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Use photos or default to defaultPhotos
  const displayPhotos = photos.length > 0
    ? photos
    : defaultPhotos.map((p, i) => ({ ...p, sortOrder: i, isDefault: true }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validatePhoto(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploadingSlot(slotIndex);
    setUploadProgress(0);

    try {
      const publicUrl = await uploadFile(file, 'gallery', (progress) => {
        setUploadProgress(progress);
      });

      const newPhoto: PhotoData = {
        photoUrl: publicUrl,
        sortOrder: slotIndex,
        isDefault: false,
      };

      // Update photos array
      const newPhotos = [...displayPhotos];
      if (slotIndex < newPhotos.length) {
        newPhotos[slotIndex] = newPhoto;
      } else {
        newPhotos.push(newPhoto);
      }
      
      // Re-sort by sortOrder
      newPhotos.sort((a, b) => a.sortOrder - b.sortOrder);
      onUpdate(newPhotos);
      
      toast.success('Photo added!');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingSlot(null);
      setUploadProgress(0);
      if (inputRefs.current[slotIndex]) {
        inputRefs.current[slotIndex]!.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newPhotos = displayPhotos.filter((_, i) => i !== index);
    // Re-index sortOrder
    newPhotos.forEach((p, i) => p.sortOrder = i);
    onUpdate(newPhotos);
    toast.success('Photo removed');
  };

  // View/Demo mode: masonry grid with lightbox
  if (mode !== 'edit') {
    if (displayPhotos.length === 0) return null;

    return (
      <>
        <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3', className)}>
          {displayPhotos.map((photo, i) => (
            <motion.div
              key={photo.photoUrl}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer card-hover"
              onClick={() => setLightboxUrl(photo.photoUrl)}
            >
              <img
                src={photo.photoUrl}
                alt={`Gallery photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
              onClick={() => setLightboxUrl(null)}
            >
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-card/50 text-foreground hover:bg-card"
              >
                <X size={24} />
              </button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={lightboxUrl}
                alt="Gallery photo"
                className="max-w-full max-h-[90vh] rounded-xl object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Edit mode: grid with upload slots
  const slots = Array.from({ length: maxPhotos }, (_, i) => displayPhotos[i] || null);

  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3', className)}>
      {slots.map((photo, i) => (
        <div
          key={i}
          className={cn(
            'aspect-square rounded-xl overflow-hidden relative',
            'border-2',
            photo ? 'border-transparent' : 'border-dashed border-border'
          )}
        >
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, i)}
            className="hidden"
          />

          {photo ? (
            // Photo slot
            <div className="relative w-full h-full group">
              <img
                src={photo.photoUrl}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Default badge */}
              {photo.isDefault && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] bg-background/80 text-foreground font-body">
                  Default
                </span>
              )}

              {/* Remove button */}
              <button
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>

              {/* Replace overlay */}
              <div
                onClick={() => inputRefs.current[i]?.click()}
                className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <span className="font-body text-xs text-foreground">Replace</span>
              </div>
            </div>
          ) : uploadingSlot === i ? (
            // Uploading state
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-1" />
              <span className="font-body text-xs text-muted-foreground">{uploadProgress}%</span>
            </div>
          ) : (
            // Empty slot
            <button
              onClick={() => inputRefs.current[i]?.click()}
              className="w-full h-full flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <Plus className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="font-body text-[10px] text-muted-foreground">Add</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditablePhotoGallery;
