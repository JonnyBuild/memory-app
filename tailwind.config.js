/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pearl: '#f8f4ee',
        chalk: '#fffdf9',
        graphite: '#262323',
        mist: '#e8e0d7',
        stone: '#8b8178',
        terracotta: '#8f3d2e',
        clay: '#c9826b',
        sage: '#7d8975',
        ink: '#191716',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 46px rgba(38, 35, 35, 0.10)',
        object: '0 18px 30px rgba(38, 35, 35, 0.18)',
        fine: '0 8px 18px rgba(38, 35, 35, 0.07)',
      },
    },
  },
  plugins: [],
};
