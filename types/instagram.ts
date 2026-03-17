import type JSZip from "jszip";

export type MediaType = "post" | "carousel" | "reel" | "story";

export interface MediaItem {
  /** Path within the ZIP archive */
  zipPath: string;
  /** Blob URL once extracted (lazy-loaded) */
  blobUrl?: string;
  /** MIME type inferred from extension */
  mimeType: string;
  /** Whether this is a video */
  isVideo: boolean;
}

export interface MediaPost {
  id: string;
  type: MediaType;
  items: MediaItem[];
  caption: string;
  timestamp: number;
  /** Human-readable date string */
  dateString: string;
}

export type CategoryFilter = "all" | MediaType;

export interface AppState {
  zip: JSZip | null;
  posts: MediaPost[];
  loading: boolean;
  loadingMessage: string;
  filter: CategoryFilter;
  blobCache: Record<string, string>;
}

export type AppAction =
  | { type: "SET_LOADING"; message: string }
  | { type: "SET_DATA"; posts: MediaPost[]; zip: JSZip }
  | { type: "CACHE_BLOB"; zipPath: string; blobUrl: string }
  | { type: "SET_FILTER"; filter: CategoryFilter }
  | { type: "RESET" };
