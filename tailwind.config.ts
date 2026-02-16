import type { Config } from "tailwindcss";

const config: Config = {
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
        'win-gray': '#c0c0c0',
        'win-dark': '#808080',
        'win-blue': '#000080',
        'win-highlight': '#0000ff',
      },
    },
  },
  plugins: [],
};

export default config;
