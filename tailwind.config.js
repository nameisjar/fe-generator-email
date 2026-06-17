/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec1ff',
          400: '#599cff',
          500: '#327aff',
          600: '#1d5cf2',
          700: '#1947d4',
          800: '#1a3daa',
          900: '#1c3885',
        },
      },
    },
  },
  plugins: [],
};
