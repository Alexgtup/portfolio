import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        bg: "rgb(var(--bg))",
        fg: "rgb(var(--fg))",
        muted: "rgb(var(--muted))",
        line: "rgb(var(--line))",
        card: "rgb(var(--card))",
        accent: "rgb(var(--accent))",
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,.35)",
        glow: "0 0 0 1px rgba(255,255,255,.08), 0 20px 80px rgba(0,0,0,.55)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-20%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        floaty: "floaty 8s ease-in-out infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
