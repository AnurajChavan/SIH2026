/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        panel: 'rgba(10, 22, 36, 0.78)',
        line: 'rgba(124, 211, 252, 0.18)',
      },
      boxShadow: {
        glow: '0 18px 70px rgba(14, 165, 233, 0.14)',
      },
    },
  },
  plugins: [],
};
