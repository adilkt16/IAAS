"use client";

import { useEffect, useRef, useState } from "react";
import { useInstagramData } from "@/context/instagram-data-context";

/**
 * Lazy-loads a media blob from the ZIP archive when the element scrolls into view.
 * Returns { ref, blobUrl, loading }.
 * Attach `ref` to the container element you want to observe.
 */
export function useLazyMedia(zipPath: string) {
  const { state, cacheBlob } = useInstagramData();
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const extractingRef = useRef(false);

  const cachedUrl = state.blobCache[zipPath];

  useEffect(() => {
    if (cachedUrl || !state.zip || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !extractingRef.current) {
          extractingRef.current = true;
          setLoading(true);

          const file = state.zip!.file(zipPath);
          if (file) {
            file.async("blob").then((blob) => {
              const url = URL.createObjectURL(blob);
              cacheBlob(zipPath, url);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }

          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [zipPath, cachedUrl, state.zip, cacheBlob]);

  return { ref, blobUrl: cachedUrl || null, loading };
}

/**
 * Eagerly extract a blob URL (for when media is already visible, e.g. in viewer modal).
 */
export function useEagerMedia(zipPath: string) {
  const { state, cacheBlob } = useInstagramData();
  const [loading, setLoading] = useState(false);

  const cachedUrl = state.blobCache[zipPath];

  useEffect(() => {
    if (cachedUrl || !state.zip) return;

    setLoading(true);
    const file = state.zip.file(zipPath);
    if (file) {
      file.async("blob").then((blob) => {
        const url = URL.createObjectURL(blob);
        cacheBlob(zipPath, url);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [zipPath, cachedUrl, state.zip, cacheBlob]);

  return { blobUrl: cachedUrl || null, loading };
}
