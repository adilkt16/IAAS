"use client";

import { useEagerMedia } from "@/hooks/use-lazy-media";

interface CarouselViewerProps {
  zipPaths: { zipPath: string; isVideo: boolean }[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
}

function CarouselItem({ zipPath, isVideo }: { zipPath: string; isVideo: boolean }) {
  const { blobUrl, loading } = useEagerMedia(zipPath);

  if (loading || !blobUrl) {
    return (
      <div className="flex h-full min-h-[200px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-app-line border-t-brand-primary" />
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={blobUrl}
        controls
        className="max-h-[55vh] max-w-full rounded-lg border border-app-line/60 sm:max-h-[62vh]"
        autoPlay
        playsInline
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={blobUrl}
      alt="Instagram media"
      className="max-h-[55vh] max-w-full rounded-lg border border-app-line/60 object-contain sm:max-h-[62vh]"
    />
  );
}

export default function CarouselViewer({
  zipPaths,
  currentIndex,
  onChangeIndex,
}: CarouselViewerProps) {
  const total = zipPaths.length;

  return (
    <div className="relative flex w-full items-center justify-center">
      {/* Left arrow */}
      {total > 1 && (
        <button
          onClick={() => onChangeIndex((currentIndex - 1 + total) % total)}
          className="absolute left-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:left-2 sm:h-11 sm:w-11"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Media + overlaid indicators */}
      <div className="relative flex flex-col items-center">
        <CarouselItem
          zipPath={zipPaths[currentIndex].zipPath}
          isVideo={zipPaths[currentIndex].isVideo}
        />

        {/* Overlay indicators at the bottom of the media */}
        {total > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-app-line/50 bg-app-panel/80 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-[11px] tabular-nums text-app-textMuted">
              {currentIndex + 1}/{total}
            </span>
            <div className="flex gap-1.5">
              {zipPaths.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeIndex(i);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === currentIndex
                      ? "bg-brand-primary scale-110"
                      : "bg-app-textMuted/40 hover:bg-app-textMuted/70"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right arrow */}
      {total > 1 && (
        <button
          onClick={() => onChangeIndex((currentIndex + 1) % total)}
          className="absolute right-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:right-2 sm:h-11 sm:w-11"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
