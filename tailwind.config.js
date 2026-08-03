/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf6f1',
          100: '#f3ebdf',
          200: '#e6d4be',
          300: '#d4b594',
          400: '#c0986a',
          500: '#a87c4f',
          600: '#8a6240',
          700: '#6e4d34',
          800: '#523c2b',
          900: '#3a2b20',
          950: '#211813',
        },
        accent: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bbe4ca',
          300: '#88d0a6',
          400: '#52b57f',
          500: '#2f9a62',
          600: '#207a4d',
          700: '#1a603e',
          800: '#174c33',
          900: '#133e2b',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
};
