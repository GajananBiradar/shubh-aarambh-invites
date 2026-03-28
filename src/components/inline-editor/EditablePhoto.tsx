import { useState, useRef } from "react";
import { TemplateMode } from "@/templates/types";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile, validatePhoto } from "@/lib/upload";
import toast from "react-hot-toast";

interface EditablePhotoProps {
  photoUrl: string | null;
  onSave: (url: string) => void;
  mode: TemplateMode;
  className?: string;
  shape?: "circle" | "square" | "rectangle";
  alt?: string;
  placeholderText?: string;
  invitationId?: number;
  oldPublicUrl?: string;
}

const EditablePhoto = ({
  photoUrl,
  onSave,
  mode,
  className = "",
  shape = "rectangle",
  alt = "Photo",
  placeholderText = "Add Photo",
  invitationId,
  oldPublicUrl,
}: EditablePhotoProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (mode === "edit" && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const error = validatePhoto(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const publicUrl = await uploadFile({
        file,
        uploadType: "photo",
        onProgress: (progress) => setUploadProgress(progress),
        invitationId,
        oldPublicUrl: oldPublicUrl || undefined,
      });
      onSave(publicUrl);
      toast.success("Photo uploaded!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const shapeClasses = {
    circle: "rounded-full aspect-square",
    square: "rounded-xl aspect-square",
    rectangle: "rounded-xl",
  };

  const baseClasses = cn(
    "relative overflow-hidden bg-muted",
    shapeClasses[shape],
    className,
  );

  // No photo placeholder
  if (!photoUrl) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          baseClasses,
          "flex flex-col items-center justify-center border-2 border-dashed border-border",
          mode === "edit" &&
            "cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <span className="font-body text-xs text-muted-foreground">
              {uploadProgress}%
            </span>
          </>
        ) : (
          <>
            <Camera className="w-8 h-8 text-muted-foreground mb-2" />
            {mode === "edit" && (
              <span className="font-body text-xs text-muted-foreground">
                {placeholderText}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(baseClasses, mode === "edit" && "cursor-pointer group")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <img src={photoUrl} alt={alt} className="w-full h-full object-cover" />

      {/* Edit overlay */}
      {mode === "edit" && (
        <div
          className={cn(
            "absolute inset-0 bg-background/60 flex flex-col items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isUploading && "opacity-100",
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <span className="font-body text-sm text-foreground">
                {uploadProgress}%
              </span>
            </>
          ) : (
            <>
              <Camera className="w-8 h-8 text-foreground mb-2" />
              <span className="font-body text-sm text-foreground">
                Change Photo
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EditablePhoto;
