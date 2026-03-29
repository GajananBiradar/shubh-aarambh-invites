import { useState, useRef } from "react";
import { TemplateMode, PhotoData, DefaultPhoto } from "@/templates/types";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile, validatePhoto } from "@/lib/upload";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface EditablePhotoGalleryProps {
  photos: PhotoData[];
  defaultPhotos: DefaultPhoto[];
  onUpdate: (photos: PhotoData[]) => void;
  mode: TemplateMode;
  maxPhotos?: number;
  className?: string;
  invitationId?: number;
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: "temp" | "draft" | "published";
}

const EditablePhotoGallery = ({
  photos,
  defaultPhotos,
  onUpdate,
  mode,
  maxPhotos = 10,
  className = "",
  invitationId,
  templateId,
  sessionUUID,
  uploadStage = "temp",
}: EditablePhotoGalleryProps) => {
  const [uploadingSlots, setUploadingSlots] = useState<Record<number, number>>(
    {},
  );
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const multiInputRef = useRef<HTMLInputElement | null>(null);

  // Use photos or default to defaultPhotos
  const displayPhotos: PhotoData[] =
    photos.length > 0
      ? photos
      : defaultPhotos.map((p, i) => ({
          photoUrl: p.photoUrl,
          sortOrder: i,
          isDefault: true,
        }));

  const photoCount = displayPhotos.length;
  const isAtCapacity = photoCount >= maxPhotos;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slotIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validatePhoto(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploadingSlots((prev) => ({ ...prev, [slotIndex]: 0 }));

    try {
      const publicUrl = await uploadFile({
        file,
        uploadType: "photo",
        onProgress: (progress) => {
          setUploadingSlots((prev) => ({ ...prev, [slotIndex]: progress }));
        },
        invitationId: invitationId ?? null,
        templateId,
        sessionUUID,
        uploadStage,
        oldPublicUrl: displayPhotos[slotIndex]?.photoUrl,
      });

      const newPhoto: PhotoData = {
        photoUrl: publicUrl,
        sortOrder: slotIndex,
        isDefault: false,
      };

      const newPhotos = [...displayPhotos];
      if (slotIndex < newPhotos.length) {
        newPhotos[slotIndex] = newPhoto;
      } else {
        newPhotos.push(newPhoto);
      }

      newPhotos.forEach((p, i) => (p.sortOrder = i));
      onUpdate(newPhotos);
      toast.success("Photo added!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingSlots((prev) => {
        const next = { ...prev };
        delete next[slotIndex];
        return next;
      });
      if (inputRefs.current[slotIndex]) {
        inputRefs.current[slotIndex]!.value = "";
      }
    }
  };

  const handleMultiFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxPhotos - photoCount;
    const filesToUpload = files.slice(0, remaining);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const error = validatePhoto(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      const slotIdx = photoCount + i;
      setUploadingSlots((prev) => ({ ...prev, [slotIdx]: 0 }));

      try {
        const publicUrl = await uploadFile({
          file,
          uploadType: "photo",
          onProgress: (progress) => {
            setUploadingSlots((prev) => ({ ...prev, [slotIdx]: progress }));
          },
          invitationId: invitationId ?? null,
          templateId,
          sessionUUID,
          uploadStage,
        });

        const newPhoto: PhotoData = {
          photoUrl: publicUrl,
          sortOrder: slotIdx,
          isDefault: false,
        };

        // We need to build the updated array; since uploads are sequential,
        // we read displayPhotos at time of completion
        const updated = [...displayPhotos, newPhoto];
        updated.forEach((p, idx) => (p.sortOrder = idx));
        onUpdate(updated);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingSlots((prev) => {
          const next = { ...prev };
          delete next[slotIdx];
          return next;
        });
      }
    }

    if (multiInputRef.current) multiInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    const newPhotos = displayPhotos.filter((_, i) => i !== index);
    newPhotos.forEach((p, i) => (p.sortOrder = i));
    onUpdate(newPhotos);
    toast.success("Photo removed");
  };

  // View/Demo mode: masonry grid with lightbox
  if (mode !== "edit") {
    if (displayPhotos.length === 0) return null;

    return (
      <>
        <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-3", className)}>
          {displayPhotos.map((photo, i) => (
            <motion.div
              key={`${photo.photoUrl}-${i}`}
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

  // Edit mode: 10-slot grid
  const slots = Array.from(
    { length: maxPhotos },
    (_, i) => displayPhotos[i] || null,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold">Photo Gallery</h3>
          <p className="font-body text-xs text-muted-foreground">
            JPG, PNG, WebP · Max 5MB each
          </p>
        </div>
        <span
          className={cn(
            "font-body text-sm font-medium px-3 py-1 rounded-full",
            isAtCapacity
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary",
          )}
        >
          {photoCount} of {maxPhotos} photos
        </span>
      </div>

      {isAtCapacity && (
        <p className="font-body text-xs text-destructive">
          Maximum reached — remove a photo to add more
        </p>
      )}

      {/* Grid */}
      <div
        className={cn(
          "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3",
          className,
        )}
      >
        {slots.map((photo, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-xl overflow-hidden relative",
              "border-2",
              photo ? "border-transparent" : "border-dashed border-border",
              isAtCapacity && !photo && "opacity-40 pointer-events-none",
            )}
          >
            <input
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFileChange(e, i)}
              className="hidden"
            />

            {photo ? (
              <div className="relative w-full h-full group">
                <img
                  src={photo.photoUrl}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover"
                />

                {photo.isDefault && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] bg-background/80 text-foreground font-body">
                    Default
                  </span>
                )}

                <button
                  onClick={() => handleRemove(i)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>

                <div
                  onClick={() => inputRefs.current[i]?.click()}
                  className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="font-body text-xs text-foreground">
                    Replace
                  </span>
                </div>
              </div>
            ) : uploadingSlots[i] !== undefined ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                <Loader2 className="w-6 h-6 text-primary animate-spin mb-1" />
                <span className="font-body text-xs text-muted-foreground">
                  {uploadingSlots[i]}%
                </span>
              </div>
            ) : (
              <button
                onClick={() => inputRefs.current[i]?.click()}
                className="w-full h-full flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="font-body text-[10px] text-muted-foreground">
                  Add
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditablePhotoGallery;
