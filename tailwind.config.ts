import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(222 47% 6%)",
        surface: "hsl(222 40% 10%)",
        border: "hsl(222 30% 18%)",
        primary: "hsl(160 84% 39%)",
        "primary-fg": "hsl(0 0% 100%)",
        muted: "hsl(217 20% 60%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
        "blink": "blink 1s step-start infinite",
      },
    },
  },
  plugins: [],
};

export default config;
