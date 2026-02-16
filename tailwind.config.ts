import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'surah-name': ['v4-surah-name', 'serif'],
        'quran': ['common-quran-common', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Classic Web 1.0 / Radio Panel Colors
        'radio-gold': '#ffd700',
        'radio-gold-dark': '#b8860b',
        'radio-navy': '#0a0e17',
        'radio-navy-light': '#1a2639',
        'radio-red': '#8b0000',
        'radio-red-light': '#ff0000',

        // Legacy Windows Colors (Keep for backward compatibility but map to variables if needed)
        'win-gray': '#c0c0c0',
        'win-dark': '#808080',
        'win-blue': '#000080',
        'win-highlight': '#0000ff',
      },
      backgroundImage: {
        'starry': "radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px), radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px)",
        'glass-red': "linear-gradient(to bottom, #ff0000 0%, #8b0000 100%)",
        'glass-blue': "linear-gradient(to bottom, #1084d0 0%, #000080 100%)",
        'glass-gold': "linear-gradient(to bottom, #ffd700 0%, #b8860b 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
