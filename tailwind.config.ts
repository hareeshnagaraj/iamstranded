import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505",
        "surface-primary": "#050505",
        "surface-secondary": "#0A0A0A",
        "surface-elevated": "#111111",
        "border-subtle": "#262626",
        "border-strong": "#404040",
        "text-primary": "#F0F0F2",
        "text-secondary": "#A0A0AA",
        "text-tertiary": "#68687A",
        "status-open": "#22C55E",
        "status-warning": "#F59E0B",
        "status-closed": "#EF4444",
        "status-info": "#3B82F6",
        accent: "#F59E0B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular"],
        display: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        blink: "blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
