"use client";

import { useCallback, useState } from "react";
import { useInstagramData } from "@/context/instagram-data-context";

export default function UploadZone() {
  const { loadZipFile, state } = useInstagramData();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".zip")) {
        alert("Please upload a ZIP file from Instagram's data export.");
        return;
      }
      loadZipFile(file);
    },
    [loadZipFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-purple-500" />
        <p className="text-lg text-neutral-300">{state.loadingMessage}</p>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed p-16 transition-colors ${
        dragOver
          ? "border-purple-500 bg-purple-500/10"
          : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-500"
      }`}
    >
      {/* Upload icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-orange-500">
        <svg
          className="h-10 w-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-xl font-semibold text-white">
          Drop your Instagram export ZIP here
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          or click to browse files
        </p>
      </div>

      <label className="cursor-pointer rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90">
        Choose ZIP File
        <input
          type="file"
          accept=".zip"
          onChange={onFileSelect}
          className="hidden"
        />
      </label>

      <div className="mt-4 max-w-md text-center text-xs text-neutral-500">
        <p className="font-medium text-neutral-400">How to get your data:</p>
        <p className="mt-1">
          Instagram &rarr; Settings &rarr; Accounts Center &rarr; Your information
          and permissions &rarr; Download your information &rarr; Download or
          transfer information. Select JSON format.
        </p>
      </div>
    </div>
  );
}
