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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col gap-3 p-3 py-6 sm:gap-4 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:-right-2 sm:-top-0 sm:h-11 sm:w-11"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows for browsing between posts */}
        {onPrev && post.items.length <= 1 && (
          <button
            onClick={onPrev}
            className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:-left-14 sm:h-11 sm:w-11"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {onNext && post.items.length <= 1 && (
          <button
            onClick={onNext}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:-right-14 sm:h-11 sm:w-11"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Media content */}
        <div className="surface-panel flex items-center justify-center rounded-panel p-2 sm:p-3">
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
        <div className="surface-panel rounded-panel p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {post.caption && (
                <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-app-text sm:line-clamp-none sm:text-base">
                  {post.caption}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-app-textMuted sm:mt-3">
                <span>{post.dateString}</span>
                <span className="rounded-full border border-brand-primary/40 bg-app-panelStrong px-2 py-0.5 uppercase text-app-text">
                  {post.type}
                </span>
                {post.items.length > 1 && (
                  <span className="rounded-full border border-app-line bg-app-panel px-2 py-0.5">
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
