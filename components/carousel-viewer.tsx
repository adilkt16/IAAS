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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-purple-500" />
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={blobUrl}
        controls
        className="max-h-[70vh] max-w-full rounded-lg"
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
      className="max-h-[70vh] max-w-full rounded-lg object-contain"
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
      <div className="relative flex items-center justify-center">
        {/* Left arrow */}
        {total > 1 && (
          <button
            onClick={() => onChangeIndex((currentIndex - 1 + total) % total)}
            className="absolute -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
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
            className="absolute -right-12 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex gap-1.5">
          {zipPaths.map((_, i) => (
            <button
              key={i}
              onClick={() => onChangeIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
