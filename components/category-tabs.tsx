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
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-smooth ${
              isActive
                ? "border-brand-primary/70 bg-gradient-to-r from-brand-primary to-brand-accent text-slate-950 shadow-glow"
                : "border-app-line bg-app-panel text-app-textMuted hover:border-brand-primary/40 hover:bg-app-panelStrong hover:text-app-text"
            }`}
          >
            {label}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                isActive ? "bg-slate-950/20 text-slate-900" : "bg-app-panelStrong text-app-textMuted"
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
