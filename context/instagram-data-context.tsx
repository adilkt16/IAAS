"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type { AppState, AppAction, CategoryFilter, MediaPost } from "@/types/instagram";
import { processZipFile } from "@/lib/zip-processor";
import { parseInstagramExport } from "@/lib/instagram-parser";
import type JSZip from "jszip";

const initialState: AppState = {
  zip: null,
  posts: [],
  loading: false,
  loadingMessage: "",
  filter: "all",
  blobCache: {},
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true, loadingMessage: action.message };
    case "SET_DATA":
      return {
        ...state,
        loading: false,
        loadingMessage: "",
        zip: action.zip,
        posts: action.posts,
      };
    case "CACHE_BLOB":
      return {
        ...state,
        blobCache: { ...state.blobCache, [action.zipPath]: action.blobUrl },
      };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "RESET": {
      // Revoke all blob URLs to free memory
      for (const url of Object.values(state.blobCache)) {
        URL.revokeObjectURL(url);
      }
      return initialState;
    }
    default:
      return state;
  }
}

interface ContextValue {
  state: AppState;
  loadZipFile: (file: File) => Promise<void>;
  setFilter: (filter: CategoryFilter) => void;
  cacheBlob: (zipPath: string, blobUrl: string) => void;
  reset: () => void;
  getFilteredPosts: () => MediaPost[];
  getCounts: () => Record<CategoryFilter, number>;
}

const InstagramDataContext = createContext<ContextValue | null>(null);

export function InstagramDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadZipFile = useCallback(async (file: File) => {
    try {
      dispatch({ type: "SET_LOADING", message: "Opening ZIP file..." });
      const structure = await processZipFile(file);

      dispatch({ type: "SET_LOADING", message: "Parsing Instagram data..." });
      const posts = await parseInstagramExport(structure);

      dispatch({ type: "SET_DATA", posts, zip: structure.zip });
    } catch (err) {
      console.error("Failed to process ZIP:", err);
      dispatch({
        type: "SET_LOADING",
        message: "Error: Failed to process the ZIP file. Make sure it's a valid Instagram data export.",
      });
      // Reset loading after showing error
      setTimeout(() => dispatch({ type: "RESET" }), 3000);
    }
  }, []);

  const setFilter = useCallback((filter: CategoryFilter) => {
    dispatch({ type: "SET_FILTER", filter });
  }, []);

  const cacheBlob = useCallback((zipPath: string, blobUrl: string) => {
    dispatch({ type: "CACHE_BLOB", zipPath, blobUrl });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const getFilteredPosts = useCallback((): MediaPost[] => {
    if (state.filter === "all") return state.posts;
    return state.posts.filter((p) => p.type === state.filter);
  }, [state.posts, state.filter]);

  const getCounts = useCallback((): Record<CategoryFilter, number> => {
    const counts: Record<CategoryFilter, number> = {
      all: state.posts.length,
      post: 0,
      carousel: 0,
      reel: 0,
      story: 0,
    };
    for (const p of state.posts) {
      counts[p.type]++;
    }
    return counts;
  }, [state.posts]);

  return (
    <InstagramDataContext.Provider
      value={{ state, loadZipFile, setFilter, cacheBlob, reset, getFilteredPosts, getCounts }}
    >
      {children}
    </InstagramDataContext.Provider>
  );
}

export function useInstagramData(): ContextValue {
  const ctx = useContext(InstagramDataContext);
  if (!ctx) throw new Error("useInstagramData must be used within InstagramDataProvider");
  return ctx;
}

export { type ContextValue };
