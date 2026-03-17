"use client";

import { useEffect, useState } from "react";
import { useInstagramData } from "@/context/instagram-data-context";

interface UploadEntry {
  name: string;
  date: string;
  postCount: number;
  mediaCount: number;
}

export default function PastUploads() {
  const { loadFromHistory } = useInstagramData();
  const [history, setHistory] = useState<UploadEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadingName, setLoadingName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("iaas_upload_history");
      if (raw) {
        setHistory(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClick = async (name: string) => {
    setLoadingName(name);
    await loadFromHistory(name);
    setLoadingName(null);
  };

  if (!mounted) return null;

  if (history.length === 0) {
    return (
      <div className="rounded-panel border border-app-line/60 bg-app-panelStrong/50 px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-app-textMuted">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>No past uploads yet. Your recent exports will appear here.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-app-textMuted">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Past Uploads
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {history.map((entry) => {
          const date = new Date(entry.date);
          const relative = formatRelativeDate(date);
          const isLoading = loadingName === entry.name;

          return (
            <button
              key={entry.name + entry.date}
              onClick={() => handleClick(entry.name)}
              disabled={loadingName !== null}
              className="flex items-start gap-3 rounded-lg border border-app-line/60 bg-app-panel/80 px-4 py-3 text-left transition-all hover:border-brand-primarySoft/50 hover:bg-app-panelStrong hover:shadow-soft disabled:opacity-60"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-app-text" title={entry.name}>
                  {entry.name}
                </p>
                <p className="mt-0.5 text-xs text-app-textMuted">
                  {entry.postCount} posts &middot; {entry.mediaCount} files &middot; {relative}
                </p>
              </div>
              <div className="mt-1 shrink-0 text-app-textMuted/60">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-app-textMuted/70">
        Click to reopen a previous export
      </p>
    </div>
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
