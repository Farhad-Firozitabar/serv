import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Tailwind CSS configuration preloading shadcn/ui tokens and سرو theme extensions.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#059669",
          dark: "#047857",
          light: "#6ee7b7",
          muted: "#d1fae5"
        }
      },
      fontFamily: {
        sans: ["var(--font-vazirmatn)", ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: []
};

export default config;
