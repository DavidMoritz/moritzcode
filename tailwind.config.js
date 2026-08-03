/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0f172a',
        accent: '#60a5fa',
        'accent-light': '#93c5fd',
      },
    },
  },
  plugins: [],
}
