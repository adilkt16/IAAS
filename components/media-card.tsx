"use client";

import type { MediaPost } from "@/types/instagram";
import { useLazyMedia } from "@/hooks/use-lazy-media";

interface MediaCardProps {
  post: MediaPost;
  onClick: () => void;
}

function TypeBadge({ type }: { type: MediaPost["type"] }) {
  const icons: Record<string, string> = {
    post: "IMG",
    carousel: "ALB",
    reel: "REEL",
    story: "STR",
  };
  return (
    <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
      {icons[type]}
    </span>
  );
}

function VideoIcon() {
  return (
    <svg className="h-5 w-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CarouselIcon() {
  return (
    <svg className="h-5 w-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 21h10a4 4 0 004-4V7" />
    </svg>
  );
}

export default function MediaCard({ post, onClick }: MediaCardProps) {
  const firstItem = post.items[0];
  const { ref, blobUrl, loading } = useLazyMedia(firstItem.zipPath);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-neutral-800"
    >
      {/* Thumbnail */}
      {blobUrl ? (
        firstItem.isVideo ? (
          <video
            src={blobUrl}
            className="h-full w-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobUrl}
            alt={post.caption || "Instagram media"}
            className="h-full w-full object-cover"
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-purple-500" />
          ) : (
            <div className="h-full w-full bg-neutral-800" />
          )}
        </div>
      )}

      {/* Overlay icons */}
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
        {firstItem.isVideo && <VideoIcon />}
        {post.type === "carousel" && <CarouselIcon />}
        <TypeBadge type={post.type} />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="p-3">
          {post.caption && (
            <p className="line-clamp-2 text-xs text-white/90">{post.caption}</p>
          )}
          <p className="mt-1 text-[10px] text-white/60">{post.dateString}</p>
        </div>
      </div>
    </div>
  );
}
