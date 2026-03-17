import type JSZip from "jszip";
import type { MediaPost, MediaItem, MediaType } from "@/types/instagram";
import { getMimeType, isVideo } from "./zip-processor";
import type { ZipStructure } from "./zip-processor";

/**
 * Instagram encodes non-ASCII text using a broken Latin-1 → UTF-8 scheme.
 * Each UTF-8 byte is stored as a separate Latin-1 character.
 * e.g. "café" → "\u00c3\u00a7\u00c3\u00a1\u00c3\u00a9"
 */
function decodeInstagramText(text: string): string {
  try {
    // Try to detect if text has the broken encoding (contains chars in 0x80-0xFF range)
    const hasHighChars = /[\u00c0-\u00ff][\u0080-\u00bf]/.test(text);
    if (!hasHighChars) return text;

    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return text;
  }
}

/** Resolve a media URI from the JSON against the ZIP file structure */
function resolveMediaPath(uri: string, rootPrefix: string, zip: JSZip): string | null {
  // Instagram JSON uses relative paths like "media/posts/12345.jpg"
  // or sometimes absolute-looking paths

  // Try the URI as-is
  if (zip.file(uri)) return uri;

  // Try with root prefix
  const withPrefix = rootPrefix + uri;
  if (zip.file(withPrefix)) return withPrefix;

  // Try without leading slash
  const noLeadingSlash = uri.replace(/^\//, "");
  if (zip.file(noLeadingSlash)) return noLeadingSlash;
  const prefixedNoSlash = rootPrefix + noLeadingSlash;
  if (zip.file(prefixedNoSlash)) return prefixedNoSlash;

  return null;
}

interface RawMediaEntry {
  uri?: string;
  creation_timestamp?: number;
  title?: string;
  media_metadata?: {
    photo_metadata?: { exif_data?: unknown[] };
    video_metadata?: unknown;
  };
}

interface RawPostEntry {
  media?: RawMediaEntry[];
  title?: string;
  creation_timestamp?: number;
}

/** Parse a single post entry from Instagram JSON */
function parsePostEntry(
  entry: RawPostEntry,
  rootPrefix: string,
  zip: JSZip,
  sourceType: MediaType
): MediaPost | null {
  const mediaEntries = entry.media || [];
  if (mediaEntries.length === 0) return null;

  const items: MediaItem[] = [];
  for (const m of mediaEntries) {
    if (!m.uri) continue;
    const resolved = resolveMediaPath(m.uri, rootPrefix, zip);
    if (!resolved) continue;
    items.push({
      zipPath: resolved,
      mimeType: getMimeType(resolved),
      isVideo: isVideo(resolved),
    });
  }

  if (items.length === 0) return null;

  const timestamp =
    entry.creation_timestamp ||
    mediaEntries[0]?.creation_timestamp ||
    0;

  const rawCaption = entry.title || mediaEntries[0]?.title || "";
  const caption = decodeInstagramText(rawCaption);

  // Determine type: if multiple items, it's a carousel
  let type = sourceType;
  if (items.length > 1 && sourceType === "post") {
    type = "carousel";
  }
  // If any item is a video and source is generic post, check if it's a reel
  if (sourceType === "post" && items.length === 1 && items[0].isVideo) {
    // We keep it as a post — reels come from their own file
  }

  const date = new Date(timestamp * 1000);
  const dateString = isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const id = `${type}-${timestamp}-${items[0].zipPath}`;

  return { id, type, items, caption, timestamp, dateString };
}

/** Match JSON files that contain post/reel/story data */
function categorizeJsonFile(path: string): MediaType | null {
  const lower = path.toLowerCase();

  if (/reels?[_.]/.test(lower) || lower.includes("/reels/") || lower.includes("reels_media")) {
    return "reel";
  }
  if (lower.includes("stories") || lower.includes("story")) {
    return "story";
  }
  if (
    lower.includes("posts_") ||
    lower.includes("/posts/") ||
    lower.includes("content/") ||
    lower.includes("photos_and_videos") ||
    lower.match(/media\.json$/)
  ) {
    return "post";
  }

  return null;
}

export async function parseInstagramExport(structure: ZipStructure): Promise<MediaPost[]> {
  const { zip, rootPrefix, jsonFiles } = structure;
  const allPosts: MediaPost[] = [];

  for (const jsonPath of jsonFiles) {
    const mediaType = categorizeJsonFile(jsonPath);
    if (!mediaType) continue;

    try {
      const file = zip.file(jsonPath);
      if (!file) continue;

      const text = await file.async("text");
      const data = JSON.parse(text);

      // Instagram JSON can come in several shapes:
      // 1. An array of post objects directly
      // 2. { ig_media: [...] }
      // 3. { [key]: [...] } where key varies

      let entries: RawPostEntry[] = [];

      if (Array.isArray(data)) {
        entries = data;
      } else if (data && typeof data === "object") {
        // Try common wrapper keys
        for (const key of Object.keys(data)) {
          const val = data[key];
          if (Array.isArray(val)) {
            entries = val;
            break;
          }
        }
      }

      for (const entry of entries) {
        // Some formats have media directly at entry level (single URI)
        if (!entry.media && (entry as unknown as RawMediaEntry).uri) {
          const singleEntry: RawPostEntry = {
            media: [entry as unknown as RawMediaEntry],
            title: (entry as unknown as RawMediaEntry).title,
            creation_timestamp: (entry as unknown as RawMediaEntry).creation_timestamp,
          };
          const post = parsePostEntry(singleEntry, rootPrefix, zip, mediaType);
          if (post) allPosts.push(post);
        } else {
          const post = parsePostEntry(entry, rootPrefix, zip, mediaType);
          if (post) allPosts.push(post);
        }
      }
    } catch {
      // Skip unparseable JSON files silently
      console.warn(`Failed to parse ${jsonPath}`);
    }
  }

  // Sort by timestamp descending (newest first)
  allPosts.sort((a, b) => b.timestamp - a.timestamp);

  // Deduplicate by first media item path
  const seen = new Set<string>();
  const unique: MediaPost[] = [];
  for (const post of allPosts) {
    const key = post.items[0].zipPath;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(post);
    }
  }

  return unique;
}
