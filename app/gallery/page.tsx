"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInstagramData } from "@/context/instagram-data-context";
import type { MediaPost } from "@/types/instagram";
import CategoryTabs from "@/components/category-tabs";
import GalleryGrid from "@/components/gallery-grid";
import MediaViewer from "@/components/media-viewer";
import DownloadButton from "@/components/download-button";
import SiteLogo from "@/components/site-logo";
import { downloadCategory } from "@/lib/download-helper";

export default function GalleryPage() {
  const { state, reset, getFilteredPosts } = useInstagramData();
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<MediaPost | null>(null);

  // Redirect to upload page if no data
  useEffect(() => {
    if (!state.zip && !state.loading) {
      router.push("/");
    }
  }, [state.zip, state.loading, router]);

  const filteredPosts = getFilteredPosts();

  const handleSelectPost = useCallback((post: MediaPost) => {
    setSelectedPost(post);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedPost(null);
  }, []);

  const handlePrevPost = useCallback(() => {
    if (!selectedPost) return;
    const idx = filteredPosts.indexOf(selectedPost);
    if (idx > 0) setSelectedPost(filteredPosts[idx - 1]);
  }, [selectedPost, filteredPosts]);

  const handleNextPost = useCallback(() => {
    if (!selectedPost) return;
    const idx = filteredPosts.indexOf(selectedPost);
    if (idx < filteredPosts.length - 1) setSelectedPost(filteredPosts[idx + 1]);
  }, [selectedPost, filteredPosts]);

  const handleDownloadCategory = useCallback(async () => {
    if (!state.zip) return;
    await downloadCategory(state.zip, filteredPosts, state.filter);
  }, [state.zip, filteredPosts, state.filter]);

  const handleReset = useCallback(() => {
    reset();
    router.push("/");
  }, [reset, router]);

  if (!state.zip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-app-line border-t-brand-primary" />
      </div>
    );
  }

  // Stats
  const totalMedia = state.posts.reduce((sum, p) => sum + p.items.length, 0);
  const dateRange =
    state.posts.length > 0
      ? `${state.posts[state.posts.length - 1].dateString} — ${state.posts[0].dateString}`
      : "";

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-app-line/80 bg-app-bg/80 shadow-panel backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <SiteLogo size={30} textSizeClassName="text-xl" />
            <div className="hidden rounded-full border border-app-line bg-app-panel px-3 py-1 text-xs text-app-textMuted sm:block">
              {state.posts.length} posts &middot; {totalMedia} media files
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <DownloadButton
              onClick={handleDownloadCategory}
              label={`Download ${state.filter === "all" ? "All" : state.filter + "s"}`}
            />
            <button
              onClick={handleReset}
              className="rounded-lg border border-app-line bg-app-panel px-3 py-2 text-sm text-app-textMuted transition-all duration-200 ease-smooth hover:border-brand-primary/60 hover:bg-app-panelStrong hover:text-app-text"
            >
              New Upload
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl animate-fade-in px-4 py-6">
        {/* Stats bar */}
        {dateRange && (
          <p className="mb-4 text-xs tracking-wide text-app-textMuted">{dateRange}</p>
        )}

        {/* Category tabs */}
        <div className="mb-6">
          <CategoryTabs />
        </div>

        {/* Gallery grid */}
        <GalleryGrid posts={filteredPosts} onSelectPost={handleSelectPost} />
      </div>

      {/* Media viewer modal */}
      {selectedPost && (
        <MediaViewer
          post={selectedPost}
          onClose={handleCloseViewer}
          onPrev={handlePrevPost}
          onNext={handleNextPost}
        />
      )}
    </main>
  );
}
