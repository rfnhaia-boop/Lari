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
        // Design system "quiet luxury" — fundo escuro + destaque dourado
        background: "#0F1115",
        surface: "#1A1D22",
        border: "rgba(255,255,255,0.07)",
        primary: "#C9A86A", // dourado (accent / luxo)
        "primary-fg": "#15130E", // texto escuro sobre o dourado
        "primary-hover": "#B89658",
        muted: "#B8BCC5", // texto secundário
        success: "#2BB673", // verde — só estados funcionais (sucesso/online)
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
