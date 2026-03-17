"use client";

import type { CategoryFilter } from "@/types/instagram";
import { useInstagramData } from "@/context/instagram-data-context";

const TABS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "post", label: "Posts" },
  { key: "carousel", label: "Carousels" },
  { key: "reel", label: "Reels" },
  { key: "story", label: "Stories" },
];

export default function CategoryTabs() {
  const { state, setFilter, getCounts } = useInstagramData();
  const counts = getCounts();

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map(({ key, label }) => {
        const isActive = state.filter === key;
        const count = counts[key];
        return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {label}
            <span
              className={`ml-1.5 ${
                isActive ? "text-white/80" : "text-neutral-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
