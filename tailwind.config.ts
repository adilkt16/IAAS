import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#080d12",
          panel: "#101923",
          panelStrong: "#162333",
          line: "#25364a",
          text: "#e6edf7",
          textMuted: "#94a8c3",
        },
        brand: {
          primary: "#16b6b1",
          primarySoft: "#26ccc3",
          accent: "#ffb347",
          accentSoft: "#ffd180",
        },
      },
      borderRadius: {
        panel: "1rem",
      },
      boxShadow: {
        panel: "0 14px 36px rgba(3, 9, 18, 0.45)",
        glow: "0 0 0 1px rgba(38, 204, 195, 0.25), 0 12px 24px rgba(7, 32, 43, 0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.95" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 360ms ease-out both",
        "slide-up": "slide-up 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "pulse-soft": "pulse-soft 2.8s ease-in-out infinite",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
