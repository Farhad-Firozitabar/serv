import type { Config } from "tailwindcss";

/**
 * Tailwind CSS configuration preloading shadcn/ui tokens and CafePOS theme extensions.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7c3aed",
          dark: "#5b21b6",
          light: "#a855f7"
        }
      }
    }
  },
  plugins: []
};

export default config;
