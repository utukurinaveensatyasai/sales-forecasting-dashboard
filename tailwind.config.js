/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This tells Tailwind to scan all JS, JSX, TS, TSX files in the src folder
  ],
  theme: {
    extend: {
      fontFamily: { // Add this to define the 'Inter' font
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}