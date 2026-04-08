import { useRef, useState, useEffect, useCallback } from "react";
import { Music } from "lucide-react";
import {
  EMBEDDED_TEST_MUSIC_NAME,
  EMBEDDED_TEST_MUSIC_URL,
} from "@/lib/defaultMusic";

interface FloatingMusicPlayerProps {
  musicUrl: string;
  musicName?: string;
}

const FloatingMusicPlayer = ({
  musicUrl,
  musicName,
}: FloatingMusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [resolvedMusicUrl, setResolvedMusicUrl] = useState(musicUrl);

  useEffect(() => {
    setResolvedMusicUrl(musicUrl);
    setPlaying(false);
    setHasInteracted(false);
  }, [musicUrl]);

  const tryPlay = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => {
        setPlaying(true);
        setHasInteracted(true);
      })
      .catch(() => {});
  }, []);

  // Try autoplay on mount
  useEffect(() => {
    if (!resolvedMusicUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.autoplay = true;
    audio.muted = false;
    audio.volume = 0.5;

    // Attempt immediate autoplay (works if browser allows)
    const timer = setTimeout(() => tryPlay(), 300);
    return () => clearTimeout(timer);
  }, [resolvedMusicUrl, tryPlay]);

  useEffect(() => {
    if (hasInteracted || !resolvedMusicUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    const retryPlay = () => {
      tryPlay();
    };

    audio.addEventListener("canplay", retryPlay);
    window.addEventListener("focus", retryPlay);
    document.addEventListener("visibilitychange", retryPlay);

    return () => {
      audio.removeEventListener("canplay", retryPlay);
      window.removeEventListener("focus", retryPlay);
      document.removeEventListener("visibilitychange", retryPlay);
    };
  }, [hasInteracted, resolvedMusicUrl, tryPlay]);

  // Fallback: play on first user interaction if autoplay was blocked
  useEffect(() => {
    if (hasInteracted) return;

    const handleFirstInteraction = () => {
      tryPlay();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("scroll", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);
    document.addEventListener("scroll", handleFirstInteraction, {
      passive: true,
    });
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("scroll", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [hasInteracted, tryPlay]);

  const handleAudioError = () => {
    if (resolvedMusicUrl === EMBEDDED_TEST_MUSIC_URL) return;

    console.warn("Music failed to load, falling back to embedded test audio.", {
      musicUrl,
    });
    setResolvedMusicUrl(EMBEDDED_TEST_MUSIC_URL);
    setPlaying(false);
  };

  const displayMusicName =
    resolvedMusicUrl === EMBEDDED_TEST_MUSIC_URL
      ? EMBEDDED_TEST_MUSIC_NAME
      : musicName || "Background Music";

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {});
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={resolvedMusicUrl}
        loop
        preload="auto"
        playsInline
        onError={handleAudioError}
      />
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-card rounded-lg px-3 py-1.5 shadow-lg border border-border whitespace-nowrap">
            <p className="font-body text-xs text-foreground">
              {displayMusicName}
            </p>
          </div>
        </div>

        <button
          onClick={toggle}
          className="w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95"
          aria-label={playing ? "Pause music" : "Play music"}
        >
          {playing ? (
            <div className="flex items-end gap-[3px] h-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-[3px] bg-accent-foreground rounded-full"
                  style={{
                    animation: `soundWave 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                    height: "4px",
                  }}
                />
              ))}
            </div>
          ) : (
            <Music size={20} />
          )}
        </button>

        {!hasInteracted && (
          <div className="absolute -top-2 -left-2 bg-accent text-accent-foreground font-body text-[10px] px-2 py-0.5 rounded-full animate-pulse">
            🎵 Tap to play
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingMusicPlayer;
