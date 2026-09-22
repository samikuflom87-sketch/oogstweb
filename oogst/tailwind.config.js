/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bos: '#1B2C20',
        'bos-licht': '#24382A',
        'bos-rand': '#334B39',
        cream: '#F6F1E7',
        goud: '#D9A441',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
