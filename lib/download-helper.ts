import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { MediaItem, MediaPost } from "@/types/instagram";

/** Extract a single file from the ZIP and trigger a download */
export async function downloadSingleItem(
  zip: JSZip,
  item: MediaItem
): Promise<void> {
  const file = zip.file(item.zipPath);
  if (!file) return;

  const blob = await file.async("blob");
  const filename = item.zipPath.split("/").pop() || "download";
  saveAs(blob, filename);
}

/** Download all items from a post (useful for carousels) */
export async function downloadPost(
  zip: JSZip,
  post: MediaPost
): Promise<void> {
  if (post.items.length === 1) {
    return downloadSingleItem(zip, post.items[0]);
  }

  // Multiple items — bundle them into a ZIP
  const bundle = new JSZip();
  for (let i = 0; i < post.items.length; i++) {
    const item = post.items[i];
    const file = zip.file(item.zipPath);
    if (!file) continue;
    const data = await file.async("uint8array");
    const filename = item.zipPath.split("/").pop() || `media_${i}`;
    bundle.file(filename, data);
  }

  const blob = await bundle.generateAsync({ type: "blob" });
  const name = `post_${post.dateString.replace(/[^a-zA-Z0-9]/g, "_")}.zip`;
  saveAs(blob, name);
}

/** Download all posts matching a filter as a ZIP */
export async function downloadCategory(
  zip: JSZip,
  posts: MediaPost[],
  categoryName: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const bundle = new JSZip();
  const allItems = posts.flatMap((p) => p.items);
  let completed = 0;

  for (const item of allItems) {
    const file = zip.file(item.zipPath);
    if (!file) continue;
    const data = await file.async("uint8array");
    const filename = item.zipPath.split("/").pop() || `media_${completed}`;
    bundle.file(filename, data);
    completed++;
    onProgress?.(Math.round((completed / allItems.length) * 100));
  }

  const blob = await bundle.generateAsync({ type: "blob" });
  saveAs(blob, `instagram_${categoryName}.zip`);
}
