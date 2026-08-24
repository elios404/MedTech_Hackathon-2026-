import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC", // Light Slate 50
        surface: {
          DEFAULT: "#FFFFFF", // Pure White
          subtle: "#F1F5F9",  // Slate 100
          border: "#E2E8F0",  // Slate 200
          hover: "#F8FAFC",   // Slate 50
        },
        clinical: {
          green: "#059669",   // Emerald 600
          amber: "#D97706",   // Amber 600
          red: "#DC2626",     // Red 600
          blue: "#0284C7",    // Sky 600
          purple: "#7C3AED",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
};

export default config;
