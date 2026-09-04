/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vault: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bccfff",
          300: "#8daeff",
          400: "#5b83ff",
          500: "#3a5fff",
          600: "#2742f5",
          700: "#1f31e1",
          800: "#1e2bb6",
          900: "#1e2a8f",
          950: "#161a52",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
