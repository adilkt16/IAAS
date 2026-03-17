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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[95vh] w-full max-w-4xl flex-col gap-4 p-3 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:-right-2 sm:-top-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows for browsing between posts */}
        {onPrev && post.items.length <= 1 && (
          <button
            onClick={onPrev}
            className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:-left-14"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {onNext && post.items.length <= 1 && (
          <button
            onClick={onNext}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-app-line bg-app-panel/90 text-app-text transition-colors hover:border-brand-primary/60 hover:bg-app-panelStrong sm:-right-14"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="surface-panel rounded-panel p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {post.caption && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-text sm:text-base">
                  {post.caption}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-app-textMuted">
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

            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
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
