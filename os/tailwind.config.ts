import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#090C13",
          raised: "#0E1322",
        },
        surface: {
          DEFAULT: "#121828",
          hover: "#171E30",
          elevated: "#1A2135",
        },
        border: {
          DEFAULT: "#232C42",
          subtle: "#1B2235",
        },
        ink: {
          DEFAULT: "#E7EAF1",
          muted: "#9AA4BC",
          faint: "#636F8C",
        },
        accent: {
          DEFAULT: "#5B86F7",
          soft: "#3A4A7A",
          dim: "#28345A",
        },
        positive: "#3FB37F",
        warning: "#D9A54E",
        danger: "#E2635A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -8px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(91,134,247,0.15), 0 8px 30px -8px rgba(91,134,247,0.25)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};

export default config;
