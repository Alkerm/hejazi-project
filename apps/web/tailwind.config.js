/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef7f5',
          100: '#fdeee9',
          200: '#fcd8cc',
          300: '#f9b7a2',
          400: '#f48b6c',
          500: '#ec6340',
          600: '#db4b2b',
          700: '#b73922',
          800: '#962f22',
          900: '#7c2b21',
        },
      },
    },
  },
  plugins: [],
};
