"use client";

import { useCallback, useEffect, useState } from "react";
import type { MediaPost } from "@/types/instagram";
import { useInstagramData } from "@/context/instagram-data-context";
import { downloadSingleItem, downloadPost } from "@/lib/download-helper";
import CarouselViewer from "./carousel-viewer";
import DownloadButton from "./download-button";

interface MediaViewerProps {
  post: MediaPost;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function MediaViewer({ post, onClose, onPrev, onNext }: MediaViewerProps) {
  const { state } = useInstagramData();
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Reset carousel index when post changes
  useEffect(() => {
    setCarouselIndex(0);
  }, [post.id]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (post.items.length > 1) {
            setCarouselIndex((i) => (i - 1 + post.items.length) % post.items.length);
          } else {
            onPrev?.();
          }
          break;
        case "ArrowRight":
          if (post.items.length > 1) {
            setCarouselIndex((i) => (i + 1) % post.items.length);
          } else {
            onNext?.();
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext, post.items.length]);

  const handleDownloadCurrent = useCallback(async () => {
    if (!state.zip) return;
    await downloadSingleItem(state.zip, post.items[carouselIndex]);
  }, [state.zip, post.items, carouselIndex]);

  const handleDownloadAll = useCallback(async () => {
    if (!state.zip) return;
    await downloadPost(state.zip, post);
  }, [state.zip, post]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[95vh] w-full max-w-4xl flex-col gap-4 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows for browsing between posts */}
        {onPrev && post.items.length <= 1 && (
          <button
            onClick={onPrev}
            className="absolute -left-14 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {onNext && post.items.length <= 1 && (
          <button
            onClick={onNext}
            className="absolute -right-14 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Media content */}
        <div className="flex items-center justify-center">
          <CarouselViewer
            zipPaths={post.items.map((item) => ({
              zipPath: item.zipPath,
              isVideo: item.isVideo,
            }))}
            currentIndex={carouselIndex}
            onChangeIndex={setCarouselIndex}
          />
        </div>

        {/* Info panel */}
        <div className="rounded-xl bg-neutral-900/80 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {post.caption && (
                <p className="whitespace-pre-wrap text-sm text-neutral-200">
                  {post.caption}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                <span>{post.dateString}</span>
                <span className="rounded bg-neutral-800 px-1.5 py-0.5 uppercase">
                  {post.type}
                </span>
                {post.items.length > 1 && (
                  <span>
                    {carouselIndex + 1} / {post.items.length}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <DownloadButton
                onClick={handleDownloadCurrent}
                label={post.items.length > 1 ? "This" : "Download"}
                small
              />
              {post.items.length > 1 && (
                <DownloadButton
                  onClick={handleDownloadAll}
                  label="All"
                  small
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
