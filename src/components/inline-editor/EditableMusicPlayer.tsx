import { useState, useRef } from "react";
import { TemplateMode } from "@/templates/types";
import { Music, Upload, Link, X, Loader2, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile, validateMusic } from "@/lib/upload";
import toast from "react-hot-toast";

interface EditableMusicPlayerProps {
  musicUrl: string | null;
  musicName: string | null;
  defaultMusicUrl: string;
  defaultMusicName: string;
  onUpdate: (url: string | null, name: string | null) => void;
  mode: TemplateMode;
  className?: string;
  invitationId?: number;
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: "temp" | "draft" | "published";
}

const EditableMusicPlayer = ({
  musicUrl,
  musicName,
  defaultMusicUrl,
  defaultMusicName,
  onUpdate,
  mode,
  className = "",
  invitationId,
  templateId,
  sessionUUID,
  uploadStage = "temp",
}: EditableMusicPlayerProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine effective music
  const effectiveUrl = musicUrl || defaultMusicUrl;
  const effectiveName = musicName || defaultMusicName;
  const isUsingDefault = !musicUrl;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateMusic(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const publicUrl = await uploadFile({
        file,
        uploadType: "music",
        onProgress: (progress) => setUploadProgress(progress),
        invitationId: invitationId ?? null,
        templateId,
        sessionUUID,
        uploadStage,
        oldPublicUrl: musicUrl ?? undefined,
      });
      onUpdate(publicUrl, file.name.replace(/\.[^/.]+$/, ""));
      setIsChanging(false);
      toast.success("Music uploaded!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload music");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    onUpdate(urlInput.trim(), "Custom Music");
    setUrlInput("");
    setIsChanging(false);
    toast.success("Music URL saved!");
  };

  const handleRemoveCustom = () => {
    onUpdate(null, null);
    toast.success("Reverted to default music");
  };

  // View mode: just show floating player (handled by parent)
  if (mode !== "edit") {
    return null; // FloatingMusicPlayer is used separately
  }

  // Edit mode: music editor panel
  return (
    <div
      className={cn("bg-card rounded-2xl border border-border p-6", className)}
    >
      <div className="flex items-center gap-3 mb-4">
        <Music className="w-5 h-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold">Background Music</h3>
      </div>

      {/* Current music preview */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-xl">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium truncate">
            {effectiveName}
          </p>
          <p className="font-body text-xs text-muted-foreground">
            {isUsingDefault ? "Default template music" : "Custom music"}
          </p>
        </div>
        <audio
          ref={audioRef}
          src={effectiveUrl}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Actions */}
      {!isChanging ? (
        <div className="flex gap-2">
          <button
            onClick={() => setIsChanging(true)}
            className="btn-outline-accent px-4 py-2 rounded-xl text-sm flex-1"
          >
            Change Music
          </button>
          {!isUsingDefault && (
            <button
              onClick={handleRemoveCustom}
              className="px-4 py-2 rounded-xl text-sm border border-border hover:bg-muted transition-colors"
            >
              Use Default
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("upload")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-body font-medium transition-colors",
                activeTab === "upload"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Upload size={14} className="inline mr-1.5" />
              Upload MP3
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-body font-medium transition-colors",
                activeTab === "url"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Link size={14} className="inline mr-1.5" />
              Paste URL
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "upload" ? (
            <div>
              <input
                ref={inputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/m4a"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className={cn(
                  "w-full py-8 rounded-xl border-2 border-dashed border-border",
                  "flex flex-col items-center justify-center gap-2",
                  "hover:border-primary/50 hover:bg-primary/5 transition-all",
                  isUploading && "opacity-50 cursor-not-allowed",
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="font-body text-sm text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="font-body text-sm text-muted-foreground">
                      Click to upload MP3 or M4A (max 10MB)
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/song.mp3"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleUrlSubmit}
                className="w-full btn-gold py-2.5 rounded-xl text-sm"
              >
                Use This URL
              </button>
            </div>
          )}

          {/* Cancel */}
          <button
            onClick={() => {
              setIsChanging(false);
              setUrlInput("");
            }}
            className="w-full py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Keep Current Music
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableMusicPlayer;
