// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6E66FF",
          dark: "#5A54E6",
          light: "#8E86FF",
        },
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "wallet-gradient":
          "radial-gradient(120% 120% at 0% 0%, #9EE7FF 0%, #9F8CFF 45%, #6E66FF 90%)",
      },
    },
  },
  plugins: [],
};