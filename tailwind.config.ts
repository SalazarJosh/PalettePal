import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#7367f0',
          600: '#5c4ce0',
          700: '#4c3bcf',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        'xl': '15px',
      },
      boxShadow: {
        'neumorph': '8px 8px 16px rgba(136, 165, 191, 0.48), -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'neumorph-inset': 'inset 8px 8px 16px rgba(136, 165, 191, 0.48), inset -8px -8px 16px rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
};
export default config;
