"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInstagramData } from "@/context/instagram-data-context";
import UploadZone from "@/components/upload-zone";
import PastUploads from "@/components/past-uploads";
import SiteLogo from "@/components/site-logo";

export default function HomePage() {
  const { state } = useInstagramData();
  const router = useRouter();

  // Navigate to gallery when data is loaded
  useEffect(() => {
    if (state.posts.length > 0 && !state.loading) {
      router.push("/gallery");
    }
  }, [state.posts.length, state.loading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 animate-slide-up text-center">
          <SiteLogo className="justify-center" size={56} textSizeClassName="text-4xl sm:text-5xl" />
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-app-textMuted sm:text-base">
            Upload your Instagram data export to browse and download your media.
            Everything runs locally in your browser — your data never leaves your
            device.
          </p>
        </div>

        <div className="animate-fade-in rounded-panel border border-app-line/80 bg-app-panel/75 p-2 shadow-panel backdrop-blur">
          <UploadZone />
        </div>

        {/* Past uploads */}
        <div className="mt-6 animate-fade-in">
          <PastUploads />
        </div>

        {/* Privacy note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-app-textMuted/80">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>100% client-side. No uploads. No servers. No tracking.</span>
        </div>
      </div>
    </main>
  );
}
