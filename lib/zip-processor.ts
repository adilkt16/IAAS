import JSZip from "jszip";

export interface ZipStructure {
  zip: JSZip;
  rootPrefix: string;
  jsonFiles: string[];
  mediaFiles: string[];
}

function getMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    webm: "video/webm",
  };
  return mimeMap[ext] || "application/octet-stream";
}

function isVideo(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return ["mp4", "mov", "avi", "webm"].includes(ext);
}

function isMediaFile(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "heic", "mp4", "mov", "avi", "webm"].includes(ext);
}

function isJsonFile(path: string): boolean {
  return path.toLowerCase().endsWith(".json");
}

/**
 * Detect the root prefix of the Instagram export.
 * Instagram exports may have a top-level folder like "your_instagram_activity/"
 * or may be flat.
 */
function detectRootPrefix(zip: JSZip): string {
  const paths = Object.keys(zip.files);
  if (paths.length === 0) return "";

  // Check if all files share a common top-level directory
  const firstSegments = new Set<string>();
  for (const p of paths) {
    const first = p.split("/")[0];
    if (first) firstSegments.add(first);
  }

  // If there's exactly one top-level entry and it's a directory
  if (firstSegments.size === 1) {
    const prefix = Array.from(firstSegments)[0];
    const prefixWithSlash = prefix + "/";
    const isDir = zip.files[prefixWithSlash]?.dir || paths.every((p) => p.startsWith(prefixWithSlash));
    if (isDir) return prefixWithSlash;
  }

  return "";
}

export async function processZipFile(file: File): Promise<ZipStructure> {
  const zip = await JSZip.loadAsync(file);
  const rootPrefix = detectRootPrefix(zip);

  const jsonFiles: string[] = [];
  const mediaFiles: string[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    const fullPath = relativePath;

    if (isJsonFile(fullPath)) {
      jsonFiles.push(fullPath);
    }
    if (isMediaFile(fullPath)) {
      mediaFiles.push(fullPath);
    }
  });

  return { zip, rootPrefix, jsonFiles, mediaFiles };
}

export { getMimeType, isVideo };
