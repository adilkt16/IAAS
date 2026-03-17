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
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-app-line border-t-brand-primary" />
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={blobUrl}
        controls
        className="max-h-[70vh] max-w-full rounded-lg border border-app-line/60"
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
      className="max-h-[70vh] max-w-full rounded-lg border border-app-line/60 object-contain"
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
    <div className="flex flex-col items-center gap-4">
      {/* Main media */}
      <div className="relative flex w-full max-w-3xl items-center justify-center px-12 sm:px-16">
        {/* Left arrow */}
        {total > 1 && (
          <button
            onClick={() => onChangeIndex((currentIndex - 1 + total) % total)}
            className="absolute left-1 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:left-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <CarouselItem
          zipPath={zipPaths[currentIndex].zipPath}
          isVideo={zipPaths[currentIndex].isVideo}
        />

        {/* Right arrow */}
        {total > 1 && (
          <button
            onClick={() => onChangeIndex((currentIndex + 1) % total)}
            className="absolute right-1 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:right-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full border border-app-line bg-app-panel px-2.5 py-0.5 text-xs text-app-textMuted">
            {currentIndex + 1} / {total}
          </div>
          <div className="flex gap-2">
          {zipPaths.map((_, i) => (
            <button
              key={i}
              onClick={() => onChangeIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === currentIndex ? "bg-brand-primary" : "bg-app-textMuted/45"
              }`}
            />
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
