/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        pitch: {
          darkest: "#0a1f0a",
          dark: "#0f2a0f",
          DEFAULT: "#1a4a1a",
          light: "#2d6b2d",
          lighter: "#3d8b3d",
        },
        gold: {
          DEFAULT: "#d4af37",
          light: "#e8c84a",
          dark: "#b8942a",
        },
        card: {
          bg: "#111f11",
          border: "#2d6b2d",
        },
      },
    },
  },
  plugins: [],
};
