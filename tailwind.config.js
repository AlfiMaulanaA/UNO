/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        uno: {
          red: '#EF4444',
          blue: '#3B82F6',
          green: '#22C55E',
          yellow: '#EAB308',
          purple: '#A855F7',
          dark: '#0F172A',
        }
      }
    },
  },
  plugins: [],
};
