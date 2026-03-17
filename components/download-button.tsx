"use client";

import { useState } from "react";

interface DownloadButtonProps {
  onClick: () => Promise<void>;
  label: string;
  small?: boolean;
}

export default function DownloadButton({ onClick, label, small }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      await onClick();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={downloading}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors ${
        small
          ? "bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
          : "bg-gradient-to-r from-purple-600 to-orange-500 px-4 py-2 text-sm text-white hover:opacity-90"
      } disabled:opacity-50`}
    >
      {downloading ? (
        <>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Downloading...
        </>
      ) : (
        <>
          <svg className={small ? "h-3.5 w-3.5" : "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
