/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0c10',
          800: '#1f2833',
        },
        primary: '#66fcf1',
        secondary: '#45a29e',
        muted: '#c5c6c7',
      }
    },
  },
  plugins: [],
}
