import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface LiveTemplatePreviewProps {
  templateId: string | number;
  className?: string;
  muted?: boolean;
  posterSrc?: string | null;
  title?: string;
  rootMargin?: string;
}

const MOBILE_WIDTH = 390;
const MOBILE_HEIGHT = 844;
const MAX_CONCURRENT_IFRAME_LOADS = 2;

type QueueItem = {
  id: number;
  start: () => void;
};

let activeIframeLoads = 0;
let queueId = 0;
const queuedPreviewLoads: QueueItem[] = [];

const flushQueuedPreviewLoads = () => {
  while (
    activeIframeLoads < MAX_CONCURRENT_IFRAME_LOADS &&
    queuedPreviewLoads.length > 0
  ) {
    const next = queuedPreviewLoads.shift();
    if (!next) return;
    activeIframeLoads += 1;
    next.start();
  }
};

const reservePreviewLoadSlot = (start: () => void) => {
  const item = { id: ++queueId, start };

  if (activeIframeLoads < MAX_CONCURRENT_IFRAME_LOADS) {
    activeIframeLoads += 1;
    start();
    return () => {};
  }

  queuedPreviewLoads.push(item);

  return () => {
    const index = queuedPreviewLoads.findIndex(
      (queuedItem) => queuedItem.id === item.id,
    );
    if (index >= 0) {
      queuedPreviewLoads.splice(index, 1);
    }
  };
};

const releasePreviewLoadSlot = () => {
  activeIframeLoads = Math.max(0, activeIframeLoads - 1);
  flushQueuedPreviewLoads();
};

const LiveTemplatePreview = ({
  templateId,
  className,
  muted = true,
  posterSrc,
  title,
  rootMargin = "300px 0px",
}: LiveTemplatePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [shouldQueueLoad, setShouldQueueLoad] = useState(false);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const loadSlotReleasedRef = useRef(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateScale = () => {
      const containerWidth = element.clientWidth;
      if (containerWidth > 0) {
        setScale(containerWidth / MOBILE_WIDTH);
      }
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldQueueLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldQueueLoad(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, shouldQueueLoad]);

  useEffect(() => {
    if (!shouldQueueLoad || shouldRenderIframe) return;

    const cancelQueue = reservePreviewLoadSlot(() => {
      setShouldRenderIframe(true);
    });

    return () => {
      cancelQueue();
    };
  }, [shouldQueueLoad, shouldRenderIframe]);

  useEffect(() => {
    return () => {
      if (!loadSlotReleasedRef.current && shouldRenderIframe && !iframeLoaded) {
        loadSlotReleasedRef.current = true;
        releasePreviewLoadSlot();
      }
    };
  }, [iframeLoaded, shouldRenderIframe]);

  const finishIframeLoad = () => {
    setIframeLoaded(true);
    if (!loadSlotReleasedRef.current) {
      loadSlotReleasedRef.current = true;
      releasePreviewLoadSlot();
    }
  };

  const previewParams = muted
    ? "?embed=1&frame=1&preview=1"
    : "?embed=1&frame=1";

  return (
    <div
      ref={containerRef}
      className={className || "relative h-full w-full overflow-hidden bg-black"}
    >
      {posterSrc && (
        <img
          src={posterSrc}
          alt={title || `Template ${templateId} poster`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            iframeLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {shouldRenderIframe && (
        <iframe
          src={`/templates/${templateId}/demo${previewParams}`}
          title={title || `Template ${templateId} preview`}
          onLoad={finishIframeLoad}
          onError={finishIframeLoad}
          className={`absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 ${
            iframeLoaded ? "opacity-100" : "opacity-0"
          }`}
          scrolling="no"
          loading="lazy"
          tabIndex={-1}
          style={{
            width: `${MOBILE_WIDTH}px`,
            height: `${MOBILE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export default LiveTemplatePreview;
