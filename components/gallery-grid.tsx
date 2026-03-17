"use client";

import type { MediaPost } from "@/types/instagram";
import MediaCard from "./media-card";

interface GalleryGridProps {
  posts: MediaPost[];
  onSelectPost: (post: MediaPost) => void;
}

export default function GalleryGrid({ posts, onSelectPost }: GalleryGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">No media found in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {posts.map((post) => (
        <MediaCard
          key={post.id}
          post={post}
          onClick={() => onSelectPost(post)}
        />
      ))}
    </div>
  );
}
