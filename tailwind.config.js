/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: { extend: { fontFamily: { ios: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'sans-serif'] } } },
  plugins: []
}
